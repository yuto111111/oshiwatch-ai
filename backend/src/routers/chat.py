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
    lines = [f"{member['name']}はSnow Manのメンバーです。"]
    if member.get("birth_date"):
        lines.append(f"生年月日: {member['birth_date']}")
    return " ".join(lines)


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

    member_result = (
        supabase.table("members")
        .select("id, name, birth_date")
        .eq("name_en", req.member_name)
        .limit(1)
        .execute()
    )
    if not member_result.data:
        raise HTTPException(status_code=404, detail=f"member not found: {req.member_name}")
    member = member_result.data[0]

    query_embedding = gemini_client.embed_query(question)
    match_result = supabase.rpc(
        "match_articles",
        {
            "query_embedding": query_embedding,
            "match_count": RAG_MATCH_COUNT,
            "filter_member_id": member["id"],
        },
    ).execute()
    matches = [m for m in (match_result.data or []) if m["similarity"] >= RAG_MIN_SIMILARITY]

    # プロフィール（確定情報）は必ず含め、記事ヒットはRAGの補足として追加する。
    # 「十分な内部情報があるか」の判定は記事ヒット数のみで行う
    # （プロフィール1件だけでは「情報が揃っている」とは見なさない）。
    context_chunks = [_profile_context(member)] + [
        f"{m['title']}\n{m['content']}" for m in matches
    ]
    use_search = len(matches) < RAG_MIN_HITS or _needs_freshness(question)

    history = trim_history(req.messages[:-1])
    prompt = gemini_client.build_chat_prompt(
        member["name"], history, question, context_chunks=context_chunks
    )
    sources: list[dict] = [
        {"title": m["title"], "url": m["source_url"]} for m in matches if m.get("source_url")
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
