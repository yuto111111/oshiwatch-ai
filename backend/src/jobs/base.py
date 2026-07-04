from __future__ import annotations

import logging
import time
from abc import ABC, abstractmethod

from src.services.supabase_client import get_supabase_client

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)


class BaseJob(ABC):
    """バッチジョブ共通の基底クラス。Supabaseクライアント初期化と実行時間計測を提供する。"""

    name: str = "base-job"

    def __init__(self) -> None:
        self.supabase = get_supabase_client()

    @abstractmethod
    def run(self) -> None:
        """ジョブ固有の処理。サブクラスで実装する。"""

    def execute(self) -> None:
        logger.info("job-%s started", self.name)
        start = time.monotonic()
        try:
            self.run()
            logger.info("job-%s completed in %.1fs", self.name, time.monotonic() - start)
        except Exception:
            logger.exception("job-%s failed after %.1fs", self.name, time.monotonic() - start)
            raise
