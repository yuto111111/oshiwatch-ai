from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from supabase import Client

from src.schemas.chat import ChatRequest
from src.services.chat_history import trim_history
from src.services.gemini_client import gemini_client
from src.services.guardrails import validate_input
from src.services.supabase_client import get_supabase_client

router = APIRouter()

RAG_MATCH_COUNT = 5
RAG_MIN_SIMILARITY = 0.5
RAG_MIN_HITS = 2

# 「鮮度」を求めるキーワード。含まれていたらDBのヒット件数に関わらず
# 強制的にGoogle検索groundingを使う（DB内の古い記事だけで答えてしまうのを防ぐ）
_FRESHNESS_KEYWORDS = (
    "最新", "今日", "今週", "今月", "昨日", "本日", "先日", "先週",
    "速報", "ニュース", "新着", "発表", "リリース", "公開",
    "現在", "今", "最近",
)


def _needs_freshness(question: str) -> bool:
    return any(keyword in question for keyword in _FRESHNESS_KEYWORDS)


def _sse(data: dict) -> str:
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"


def _profile_context(member: dict) -> str:
    """メンバーの基本プロフィール。類似検索とは無関係に必ずコンテキストへ含める。"""
    lines = [f"{member['name']}は推し活AIの対応アイドルグループのメンバーです。"]
    if member.get("birth_date"):
        lines.append(f"生年月日: {member['birth_date']}")
    return " ".join(lines)


def _resolve_target_members(
    supabase: Client, member_name: str | None, user_id: str | None
) -> tuple[list[dict], str]:
    """質問対象のメンバー一覧と、プロンプトに渡す ``name`` (単数 or 複数) を決める。

    優先順:
      1. member_name 指定あり (メンバー詳細ページからのチャット)
      2. user_id 指定あり (ダッシュボードからのチャット、フォロー中の推し全員)
      3. どちらもなし → エラー
    """
    if member_name:
        member_result = (
            supabase.table("members")
            .select("id, name, birth_date, name_en")
            .eq("name_en", member_name)
            .limit(1)
            .execute()
        )
        if not member_result.data:
            raise HTTPException(
                status_code=404, detail=f"member not found: {member_name}"
            )
        return member_result.data, member_result.data[0]["name"]

    if user_id:
        user_result = (
            supabase.table("demo_users")
            .select("followed_member_ids, display_name")
            .eq("id", user_id)
            .limit(1)
            .execute()
        )
        if not user_result.data:
            raise HTTPException(status_code=404, detail=f"user not found: {user_id}")
        member_ids = user_result.data[0]["followed_member_ids"] or []
        if not member_ids:
            raise HTTPException(
                status_code=400, detail="user has no followed members"
            )
        members = (
            supabase.table("members")
            .select("id, name, birth_date, name_en")
            .in_("id", member_ids)
            .execute()
        )
        names = "、".join([m["name"] for m in members.data or []])
        return members.data or [], names

    raise HTTPException(
        status_code=400, detail="either member_name or user_id must be provided"
    )


def _user_context_block(supabase: Client, user_id: str | None) -> str:
    """ユーザー ID があればそのペルソナ情報を prompt に埋め込むための文を作る。

    「〇〇さんの推し活アシスタントです。フォロー中は 向井康二 と 目黒蓮 です」といった
    自然な導入文にすることで、AI エージェントが「誰の担当か」を自覚した振る舞いをする。
    """
    if not user_id:
        return ""
    user_result = (
        supabase.table("demo_users")
        .select("display_name, followed_member_ids, interests")
        .eq("id", user_id)
        .limit(1)
        .execute()
    )
    if not user_result.data:
        return ""
    user = user_result.data[0]
    member_ids = user["followed_member_ids"] or []
    if not member_ids:
        return ""
    members = (
        supabase.table("members")
        .select("name")
        .in_("id", member_ids)
        .execute()
    )
    names = "、".join([m["name"] for m in (members.data or [])])
    interests = "、".join(user.get("interests") or [])
    lines = [
        f"あなたは今、「{user['display_name']}」さんの推し活アシスタントとして応答しています。",
        f"このユーザーがフォローしている推しは {names} です。",
    ]
    if interests:
        lines.append(f"関心のあるジャンル: {interests}。")
    lines.append(
        "回答する際はフォロー中の推しを優先的に取り上げ、"
        "話題が広い時も『あなたの推しに関連づけると…』の視点を混ぜてください。"
    )
    return "【ユーザー情報】\n" + "\n".join(lines)


@router.post("")
async def chat(req: ChatRequest, supabase: Client = Depends(get_supabase_client)):
    question = req.messages[-1].content

    error = validate_input(question)
    if error:

        async def error_stream():
            yield _sse({"type": "delta", "text": error})
            yield _sse({"type": "sources", "sources": []})
            yield _sse({"type": "done"})

        return StreamingResponse(error_stream(), media_type="text/event-stream")

    members, name_for_prompt = _resolve_target_members(
        supabase, req.member_name, req.user_id
    )
    member_ids = [m["id"] for m in members]

    query_embedding = gemini_client.embed_query(question)
    # 複数メンバー横断で類似検索する場合、まず filter_member_id=None で広く取り、
    # フォロー中の member_id セットで手元フィルタする方が実装が簡潔
    match_result = supabase.rpc(
        "match_articles",
        {
            "query_embedding": query_embedding,
            "match_count": RAG_MATCH_COUNT * max(1, len(member_ids)),
            "filter_member_id": None,
        },
    ).execute()
    all_matches = match_result.data or []
    matches = [
        m
        for m in all_matches
        if m["similarity"] >= RAG_MIN_SIMILARITY
        and m.get("member_id") in member_ids
    ][:RAG_MATCH_COUNT]

    # プロフィール(確定情報) は必ず入れる。 記事ヒットは RAG の補足。
    context_chunks = [_profile_context(m) for m in members] + [
        f"{m['title']}\n{m['content']}" for m in matches
    ]
    use_search = len(matches) < RAG_MIN_HITS or _needs_freshness(question)

    user_context = _user_context_block(supabase, req.user_id)

    history = trim_history(req.messages[:-1])
    prompt = gemini_client.build_chat_prompt(
        name_for_prompt,
        history,
        question,
        context_chunks=context_chunks,
        user_context=user_context,
    )
    sources: list[dict] = [
        {"title": m["title"], "url": m["source_url"]}
        for m in matches
        if m.get("source_url")
    ]

    async def event_stream():
        for chunk in gemini_client.stream_chat(prompt, use_search=use_search):
            if chunk["type"] == "delta":
                yield _sse({"type": "delta", "text": chunk["text"]})
            elif chunk["type"] == "grounding_sources":
                for url in chunk["sources"]:
                    sources.append({"title": url, "url": url})
        yield _sse({"type": "sources", "sources": sources})
        yield _sse({"type": "done"})

    return StreamingResponse(event_stream(), media_type="text/event-stream")
