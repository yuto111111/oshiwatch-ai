from __future__ import annotations

import logging
from datetime import date, datetime

import httpx
from bs4 import BeautifulSoup

from src.config import settings
from src.jobs.base import BaseJob
from src.services.gemini_client import gemini_client

logger = logging.getLogger(__name__)

ARTICLES_PER_SUMMARY = 5


def _sanitize_text(text: str) -> str:
    """Geminiの出力に稀に混入する不正なサロゲート文字を除去する。"""
    return text.encode("utf-8", "ignore").decode("utf-8")


class SummarizeJob(BaseJob):
    """job-summarize: 記事のニュース要約生成 + 公式サイト/検索groundingによる予定抽出。"""

    name = "summarize"

    def run(self) -> None:
        members = (
            self.supabase.table("members")
            .select("id, name, group_name")
            .execute()
            .data
            or []
        )
        # STARTO 公式スケジュールは Snow Man 固有なので Snow Man 系のみ使用
        schedule_html = self._fetch_official_schedule_html()

        # グループ全体まとめ (member_id=NULL 記事から生成)。
        # 対応中の全グループを合わせた 1 本のまとめを作る。
        groups = sorted(
            {m["group_name"] for m in members if m.get("group_name")}
        )
        group_label = " / ".join(groups) if groups else "推し"
        self._summarize_target(
            member_id=None, name=group_label, schedule_html=schedule_html
        )

        # メンバー個別 (schedule_html は Snow Man 系のみ有効)
        for member in members:
            grp = (member.get("group_name") or "").strip()
            schedule_for_member = schedule_html if grp == "Snow Man" else None
            self._summarize_target(
                member_id=member["id"],
                name=member["name"],
                schedule_html=schedule_for_member,
            )

    def _summarize_target(self, member_id: str | None, name: str, schedule_html: str | None) -> None:
        try:
            self._generate_news_summary(member_id, name)
        except Exception:
            logger.exception("Failed to summarize news for %s", name)

        try:
            self._refresh_events(member_id, name, schedule_html)
        except Exception:
            logger.exception("Failed to refresh events for %s", name)

    # ------------------------------------------------------------------
    # ニュース要約
    # ------------------------------------------------------------------
    def _generate_news_summary(self, member_id: str | None, name: str) -> None:
        query = self.supabase.table("articles").select("title, content, source_url")
        query = query.is_("member_id", "null") if member_id is None else query.eq("member_id", member_id)
        articles = (
            query.order("published_at", desc=True).limit(ARTICLES_PER_SUMMARY).execute().data or []
        )
        if not articles:
            logger.info("No articles for %s, skip summarize", name)
            return

        result = gemini_client.summarize_news(name, articles)
        if not result.get("summary"):
            logger.info("Empty summary generated for %s, skip save", name)
            return

        self.supabase.table("daily_summaries").upsert(
            {
                "member_id": member_id,
                "date": date.today().isoformat(),
                "summary": result["summary"],
                "bullets": result["bullets"],
                "sources": result["sources"],
            },
            on_conflict="member_id,date",
        ).execute()
        logger.info("Saved daily summary for %s", name)

    # ------------------------------------------------------------------
    # 予定抽出
    # ------------------------------------------------------------------
    def _fetch_official_schedule_html(self) -> str | None:
        try:
            resp = httpx.get(
                settings.snowman_official_schedule_url,
                headers={"User-Agent": settings.crawl_user_agent},
                timeout=settings.crawl_request_timeout,
                follow_redirects=True,
            )
            resp.raise_for_status()
        except httpx.HTTPError as e:
            logger.warning("Failed to fetch official schedule page: %s", e)
            return None

        try:
            soup = BeautifulSoup(resp.text, "html.parser")
            for tag in soup(["script", "style", "noscript", "svg", "header", "footer", "nav"]):
                tag.decompose()
            return str(soup)
        except Exception:
            return resp.text

    def _refresh_events(self, member_id: str | None, name: str, schedule_html: str | None) -> None:
        events: list[dict] = []
        if schedule_html:
            events = gemini_client.extract_events_from_html(name, schedule_html)
        if not events:
            events = gemini_client.fetch_upcoming_events_via_search(name)
        if events:
            self._upsert_events(member_id, events)

    def _upsert_events(self, member_id: str | None, events: list[dict]) -> None:
        today_iso = date.today().isoformat()
        rows: list[dict] = []
        for ev in events:
            if not isinstance(ev, dict):
                continue
            title = _sanitize_text((ev.get("title") or "").strip())
            event_date = (ev.get("event_date") or "").strip()
            if not title or not event_date:
                continue
            try:
                parsed = datetime.fromisoformat(event_date).date()
            except (ValueError, TypeError):
                continue
            if parsed.isoformat() < today_iso:
                continue
            rows.append(
                {
                    "member_id": member_id,
                    "title": title[:300],
                    "event_date": parsed.isoformat(),
                    "description": _sanitize_text((ev.get("description") or "")[:200]) or None,
                    "source_url": ev.get("source_url"),
                }
            )
        if not rows:
            return

        query = self.supabase.table("events").select("title, event_date")
        query = query.is_("member_id", "null") if member_id is None else query.eq("member_id", member_id)
        existing = query.execute().data or []
        existing_keys = {(e["event_date"], e["title"]) for e in existing}

        new_rows = [r for r in rows if (r["event_date"], r["title"]) not in existing_keys]
        if not new_rows:
            return
        self.supabase.table("events").insert(new_rows).execute()
        logger.info("Inserted %d new events for member_id=%s", len(new_rows), member_id)


if __name__ == "__main__":
    SummarizeJob().execute()
