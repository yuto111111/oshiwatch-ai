from __future__ import annotations

import logging
from datetime import UTC, datetime
from urllib.parse import quote

import feedparser
import httpx
from bs4 import BeautifulSoup

from src.config import settings
from src.jobs.base import BaseJob

logger = logging.getLogger(__name__)

MAX_ITEMS_PER_QUERY = 10


def _strip_html(html_text: str) -> str:
    if not html_text:
        return ""
    try:
        text = BeautifulSoup(html_text, "html.parser").get_text(separator=" ", strip=True)
    except Exception:
        text = html_text
    return " ".join(text.split())


def _google_news_rss_url(query: str) -> str:
    return f"https://news.google.com/rss/search?q={quote(query)}&hl=ja&gl=JP&ceid=JP:ja"


class CrawlJob(BaseJob):
    """job-crawl: Google News RSSからメンバー別・グループ全体のニュースを取得しarticlesに保存する。"""

    name = "crawl"

    def run(self) -> None:
        members = self.supabase.table("members").select("id, name").execute().data or []

        total_inserted = 0
        # グループ全体 (member_id = NULL)
        total_inserted += self._crawl_and_store(member_id=None, query="Snow Man")

        # メンバー個別
        for member in members:
            total_inserted += self._crawl_and_store(
                member_id=member["id"], query=f"Snow Man {member['name']}"
            )

        logger.info("Crawl complete: %d new articles inserted", total_inserted)

    def _crawl_and_store(self, member_id: str | None, query: str) -> int:
        items = self._fetch_rss(query)
        if not items:
            return 0
        return self._insert_new_articles(member_id, items)

    def _fetch_rss(self, query: str) -> list[dict]:
        url = _google_news_rss_url(query)
        logger.info("Fetching RSS for %r: %s", query, url)
        try:
            resp = httpx.get(
                url,
                headers={"User-Agent": settings.crawl_user_agent},
                timeout=settings.crawl_request_timeout,
                follow_redirects=True,
            )
            resp.raise_for_status()
        except httpx.HTTPError as e:
            logger.warning("RSS fetch failed for %r: %s", query, e)
            return []

        feed = feedparser.parse(resp.content)
        items = []
        for entry in feed.entries[:MAX_ITEMS_PER_QUERY]:
            published_at = None
            if getattr(entry, "published_parsed", None):
                published_at = datetime(*entry.published_parsed[:6], tzinfo=UTC)
            items.append(
                {
                    "title": _strip_html(entry.get("title", ""))[:500],
                    "content": _strip_html(entry.get("summary", ""))[:1000],
                    "source_url": entry.get("link", ""),
                    "published_at": (published_at or datetime.now(UTC)).isoformat(),
                }
            )
        logger.info("RSS %r: %d entries found", query, len(items))
        return items

    def _insert_new_articles(self, member_id: str | None, items: list[dict]) -> int:
        items = [i for i in items if i.get("source_url")]
        if not items:
            return 0

        query = self.supabase.table("articles").select("source_url")
        query = query.is_("member_id", "null") if member_id is None else query.eq("member_id", member_id)
        existing = query.in_("source_url", [i["source_url"] for i in items]).execute()
        existing_urls = {row["source_url"] for row in (existing.data or [])}

        new_rows = [
            {"member_id": member_id, **i} for i in items if i["source_url"] not in existing_urls
        ]
        if not new_rows:
            return 0

        result = self.supabase.table("articles").insert(new_rows).execute()
        return len(result.data) if result.data else 0


if __name__ == "__main__":
    CrawlJob().execute()
