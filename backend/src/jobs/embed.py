from __future__ import annotations

import logging

from src.jobs.base import BaseJob
from src.services.gemini_client import gemini_client

logger = logging.getLogger(__name__)

BATCH_SIZE = 50


class EmbedJob(BaseJob):
    """job-embed: embedding未設定のarticlesをベクトル化する（RAGチャット用）。"""

    name = "embed"

    def run(self) -> None:
        rows = (
            self.supabase.table("articles")
            .select("id, title, content")
            .is_("embedding", "null")
            .limit(500)
            .execute()
            .data
            or []
        )
        if not rows:
            logger.info("No articles need embedding")
            return

        logger.info("Embedding %d articles", len(rows))
        for i in range(0, len(rows), BATCH_SIZE):
            batch = rows[i : i + BATCH_SIZE]
            texts = [f"{r.get('title', '')}\n{r.get('content', '')}" for r in batch]
            embeddings = gemini_client.embed_texts(texts)
            for row, embedding in zip(batch, embeddings):
                self.supabase.table("articles").update({"embedding": embedding}).eq(
                    "id", row["id"]
                ).execute()
            logger.info("Embedded batch %d-%d / %d", i, i + len(batch), len(rows))


if __name__ == "__main__":
    EmbedJob().execute()
