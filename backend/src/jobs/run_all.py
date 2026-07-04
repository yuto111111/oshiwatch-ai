"""Cloud Run Job のエントリーポイント。crawl → summarize → embed を順に実行する。"""

from __future__ import annotations

import logging
import sys

from src.jobs.crawl import CrawlJob
from src.jobs.embed import EmbedJob
from src.jobs.summarize import SummarizeJob

logger = logging.getLogger(__name__)


def main() -> None:
    failed = False

    try:
        CrawlJob().execute()
    except Exception:
        logger.exception("crawl job failed")
        failed = True

    try:
        SummarizeJob().execute()
    except Exception:
        logger.exception("summarize job failed")
        failed = True

    try:
        EmbedJob().execute()
    except Exception:
        logger.exception("embed job failed")
        failed = True

    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
