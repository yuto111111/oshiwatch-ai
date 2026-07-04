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


gemini_client = GeminiClient()
