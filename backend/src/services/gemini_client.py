from __future__ import annotations

import json
import logging
import re
from typing import Any

from google import genai
from google.genai import types as genai_types

from src.config import settings

logger = logging.getLogger(__name__)


def _safe_parse_json(raw_text: str) -> dict[str, Any] | None:
    """Gemini のレスポンスを壊れにくくパースする。

    JSON 厳格モードでない呼び出し（Google 検索 grounding 併用時など）は
    ```json ... ``` で囲まれて返ってくることがあるため、まずそれを剥がしてから
    パースを試みる。
    """
    if not raw_text:
        return None
    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        pass

    fenced = re.search(r"```(?:json)?\s*(.*?)```", raw_text, re.DOTALL)
    if fenced:
        try:
            return json.loads(fenced.group(1).strip())
        except json.JSONDecodeError:
            pass

    logger.warning("Gemini returned unparsable JSON: %s", raw_text[:300])
    return None


class GeminiClient:
    """Vertex AI Gemini（google-genai SDK）の薄いラッパー。"""

    def __init__(self) -> None:
        self.model_name = settings.gemini_model
        self._client: genai.Client | None = None

    @property
    def client(self) -> genai.Client:
        if self._client is None:
            self._client = genai.Client(
                vertexai=True,
                project=settings.google_cloud_project,
                location=settings.vertex_ai_location,
            )
        return self._client

    def summarize_news(self, name: str, articles: list[dict]) -> dict[str, Any]:
        """直近記事から「summary / bullets / sources」の JSON を生成する（JSON厳格モード）。"""
        from src.jobs.prompts import load_prompt

        content_text = "\n\n".join(
            f"タイトル: {a.get('title', '')}\n"
            f"要約: {a.get('content', '')[:200]}\n"
            f"URL: {a.get('source_url', '')}"
            for a in articles
        )
        prompt = load_prompt("summarize_news.txt").format(
            name=name, content_texts=content_text
        )

        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=genai_types.GenerateContentConfig(
                temperature=0.3,
                max_output_tokens=4096,
                response_mime_type="application/json",
                thinking_config=genai_types.ThinkingConfig(thinking_budget=0),
            ),
        )
        result = _safe_parse_json((response.text or "").strip())
        if result is None:
            return {"summary": "", "bullets": [], "sources": []}
        return {
            "summary": (result.get("summary") or "").strip(),
            "bullets": result.get("bullets") or [],
            "sources": result.get("sources") or [],
        }

    def extract_events_from_html(self, name: str, html_text: str) -> list[dict]:
        """公式サイトHTMLから今後の予定を構造化抽出する。"""
        from src.jobs.prompts import load_prompt

        prompt = load_prompt("extract_events_from_html.txt").format(
            name=name, html_content=html_text[:60000]
        )
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=genai_types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=4096,
                response_mime_type="application/json",
                thinking_config=genai_types.ThinkingConfig(thinking_budget=0),
            ),
        )
        result = _safe_parse_json((response.text or "").strip())
        if result is None:
            return []
        return result.get("events") or []

    def fetch_upcoming_events_via_search(self, name: str) -> list[dict]:
        """Google検索grounding付きで今後の予定を取得する（フォールバック）。

        grounding 使用時は response_mime_type=json を指定できないため、
        プレーンテキストとして返ってきた JSON を _safe_parse_json で救済する。
        """
        from datetime import date

        from src.jobs.prompts import load_prompt

        prompt = load_prompt("upcoming_events_search.txt").format(
            name=name, today=date.today().isoformat()
        )
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=genai_types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=4096,
                tools=[genai_types.Tool(google_search=genai_types.GoogleSearch())],
                thinking_config=genai_types.ThinkingConfig(thinking_budget=0),
            ),
        )
        raw_text = (response.text or "").strip()
        result = _safe_parse_json(raw_text)
        if result is None:
            return []

        events = result.get("events") or []
        # grounding のリダイレクトURLは短命で404になりやすいため無効化する
        for ev in events:
            if isinstance(ev, dict):
                ev["source_url"] = None
        return events

    # ------------------------------------------------------------------
    # RAGチャット
    # ------------------------------------------------------------------
    def embed_texts(self, texts: list[str], task_type: str = "RETRIEVAL_DOCUMENT") -> list[list[float]]:
        if not texts:
            return []
        response = self.client.models.embed_content(
            model=settings.embedding_model,
            contents=texts,
            config=genai_types.EmbedContentConfig(task_type=task_type),
        )
        return [e.values for e in response.embeddings]

    def embed_query(self, text: str) -> list[float]:
        return self.embed_texts([text], task_type="RETRIEVAL_QUERY")[0]

    def build_chat_prompt(
        self,
        name: str,
        history: list,
        question: str,
        context_chunks: list[str] | None,
        user_context: str = "",
    ) -> str:
        from src.jobs.prompts import load_prompt

        context_block = (
            "\n\n".join(f"[資料{i + 1}] {c}" for i, c in enumerate(context_chunks))
            if context_chunks
            else "(該当する資料なし。一般知識やWeb検索結果をもとに回答してください)"
        )
        system = load_prompt("chat_system.txt").format(
            name=name, context_block=context_block, user_context=user_context or ""
        )

        parts = [system]
        history_lines = [
            f"{'ユーザー' if m.role == 'user' else 'アシスタント'}: {m.content}" for m in history
        ]
        if history_lines:
            parts.append("【これまでの会話】\n" + "\n".join(history_lines))
        parts.append(f"ユーザー: {question}\nアシスタント:")
        return "\n\n".join(parts)

    def stream_chat(self, prompt: str, use_search: bool):
        """回答をトークン単位でストリーミングする。

        yield する dict:
          {"type": "delta", "text": "..."}
          {"type": "grounding_sources", "sources": [...]}  # use_search=True のときのみ、最後に1回
        """
        tools = [genai_types.Tool(google_search=genai_types.GoogleSearch())] if use_search else None
        # 出力側ガードライン: 有害コンテンツ (性的 / 危険 / 誹謗中傷 / 差別) の
        # 高信頼度カテゴリを Vertex AI 側で自動ブロックする
        safety_settings = [
            genai_types.SafetySetting(
                category="HARM_CATEGORY_HARASSMENT",
                threshold="BLOCK_MEDIUM_AND_ABOVE",
            ),
            genai_types.SafetySetting(
                category="HARM_CATEGORY_HATE_SPEECH",
                threshold="BLOCK_MEDIUM_AND_ABOVE",
            ),
            genai_types.SafetySetting(
                category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold="BLOCK_MEDIUM_AND_ABOVE",
            ),
            genai_types.SafetySetting(
                category="HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold="BLOCK_MEDIUM_AND_ABOVE",
            ),
        ]
        config = genai_types.GenerateContentConfig(
            temperature=0.5,
            max_output_tokens=2048,
            tools=tools,
            safety_settings=safety_settings,
            thinking_config=genai_types.ThinkingConfig(thinking_budget=0),
        )
        stream = self.client.models.generate_content_stream(
            model=self.model_name, contents=prompt, config=config
        )

        sources: list[str] = []
        for chunk in stream:
            delta = ""
            try:
                delta = chunk.text or ""
            except (ValueError, AttributeError):
                pass
            if delta:
                yield {"type": "delta", "text": delta}

            if use_search:
                try:
                    for cand in getattr(chunk, "candidates", []) or []:
                        gm = getattr(cand, "grounding_metadata", None)
                        if not gm:
                            continue
                        for gc in getattr(gm, "grounding_chunks", []) or []:
                            web = getattr(gc, "web", None)
                            if not web:
                                continue
                            # NOTE: web.uri は vertexaisearch.cloud.google.com の
                            # リダイレクト URL (GCP 内部パス)。 ユーザーに露出
                            # させない (インフラ構成の開示 + 短命で 404 になる)。
                            # 表示には web.title (参照元ドメイン名) だけを使う
                            title = getattr(web, "title", None)
                            if title and title not in sources:
                                sources.append(title)
                except Exception:
                    logger.debug("failed to parse grounding metadata", exc_info=True)

        if use_search and sources:
            yield {"type": "grounding_sources", "sources": sources[:4]}


gemini_client = GeminiClient()
