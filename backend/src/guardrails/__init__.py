"""NeMo Guardrails 統合モジュール (NeMo 標準中心ハイブリッド版)。

検査の流れ:
  1. 推し活ドメイン特有の regex (住所要求 / アンチ依頼 / 転売 etc) を即ブロック
  2. 通過したものを "怪しさ" ヒューリスティックで判定
  3. 怪しい (= 残り 5%) もののみ NeMo Guardrails の標準 flow
     (jailbreak detection heuristics + self_check_input) で意味判定
  4. それも通れば本体 LLM に投げる

設計方針:
  - 汎用 (jailbreak / 有害コンテンツ) は NVIDIA がメンテする NeMo 標準 flow に
    委譲。多言語対応 / 新攻撃手法への追従コストをアプリ側で持たない
  - 推し活ドメイン特有のチェック (住所特定要求、アンチ投稿生成依頼 etc) のみ
    アプリ側で regex 実装
  - コスト: 95% は regex のみ通過、5% のみ NeMo LLM 判定 (~$0.001/call)

NeMo Guardrails パッケージが import 不能な環境 (= annoy ビルド失敗 etc) では
LLM ステップを自動スキップし regex のみで動作する (フォールバック)。
"""

from __future__ import annotations

import logging
import os
from pathlib import Path

# nemoguardrails 0.23+ は Vertex AI を langchain 経由でのみ初期化できる。
# この env は nemoguardrails の import 時に評価されるため、actions.py 経由の
# import が走る前 (= 本モジュールの先頭) で設定する必要がある
# (_get_rails 内での設定では手遅れだった、2026-07-26 検証)
os.environ.setdefault("NEMOGUARDRAILS_LLM_FRAMEWORK", "langchain")

from src.guardrails.actions import (  # noqa: E402
    check_citation_present,
    check_oshi_specific,
)

logger = logging.getLogger(__name__)

NO_CITATION_RESPONSE = (
    "申し訳ございませんが、この質問に対して確認できる情報源が見つかりませんでした。"
    "別の質問をお試しください。"
)

UNSAFE_INPUT_RESPONSE = (
    "申し訳ございませんが、この質問にはお答えできません。推し活に関する質問をお願いします。"
)

# 「regex は通ったが NeMo LLM 判定に回したい」マーカ。
# これらが含まれる入力は ~5% で、コストとセキュリティのバランス点。
_SUSPICIOUS_KEYWORDS = (
    # 英語
    "system prompt",
    "system message",
    "system instruction",
    "previous instruction",
    "above instruction",
    "above message",
    "developer mode",
    "dan mode",
    "jailbreak",
    "reveal",
    "disclose",
    "leak",
    "bypass",
    "override",
    "act as",
    "pretend",
    "roleplay",  # "Roleplay: you are now…" 系
    "no rules",
    "no restriction",
    "no restrictions",
    "without restrictions",
    "echo the following",
    "output the following",
    "print the following",
    "そのまま出力",
    "そのまま表示",
    # 日本語
    "システムプロンプト",
    "システムの指示",
    "以前の指示",
    "上記の指示を",
    "指示を全て",
    "指示を無視",
    "開発者モード",
    "脱獄",
    "本当のあなた",
    "あなたの正体",
    "あなたの本性",
    "秘密を",
    "内部情報",
    "なりきって",
    "ふりをして",
    "演じて",
    # 多言語混入 (ローカライズ攻撃のサイン)
    "你的指令",
    "你的命令",  # 中国語
    "너의 지시",  # 韓国語
)

_SUSPICIOUS_MIN_LEN = 200
_SUSPICIOUS_NEWLINE_MIN = 4

# Base64 でエンコードした攻撃の検出 (英数記号 30 文字以上の長い base64 ブロック)
# 例: SWdub3JlIHByZXZpb3VzIGluc3RydWN0aW9ucw==  ← "Ignore previous instructions"
import re as _re  # noqa: E402  (base64 検出 regex の直前に意図的に配置)

_BASE64_BLOCK = _re.compile(r"[A-Za-z0-9+/]{30,}={0,2}")

# 明確な jailbreak / プロンプト漏洩試行は regex で即ブロック。
# NeMo / LLM 判定の遅延 (~1-2s + コスト) を回避し、本番でも保険として動く。
# 多言語対応・新攻撃手法のフォローは NeMo 標準 flow に任せる
_DIRECT_JAILBREAK_PATTERNS = [
    # 英語: ignore previous / above instructions
    _re.compile(r"ignore.*(previous|above|prior).*instruction", _re.IGNORECASE),
    _re.compile(r"disregard.*(previous|above|prior).*instruction", _re.IGNORECASE),
    _re.compile(r"forget.*(previous|above|all).*instruction", _re.IGNORECASE),
    # システムプロンプト漏洩
    _re.compile(
        r"(reveal|disclose|show|tell).*(system|hidden|secret).*(prompt|instruction|message)",
        _re.IGNORECASE,
    ),
    _re.compile(r"システムプロンプト.*(教え|何|全部|出し|表示|公開|見せ)"),
    _re.compile(r"秘密の指示"),
    _re.compile(r"内部.*(指示|プロンプト|情報).*(教え|出し|何)"),
    # DAN / 開発者モード
    _re.compile(r"DAN[\s_-]*mode", _re.IGNORECASE),
    _re.compile(r"DAN として"),
    _re.compile(r"developer.?mode", _re.IGNORECASE),
    _re.compile(r"開発者モード"),
    _re.compile(r"jailbreak", _re.IGNORECASE),
    _re.compile(r"脱獄"),
    # 制約解除
    _re.compile(r"制約.*(全て|すべて).*解除"),
    _re.compile(r"ルール.*(無視|忘れ)"),
    _re.compile(r"no rules", _re.IGNORECASE),
    _re.compile(r"without.*restriction", _re.IGNORECASE),
    _re.compile(r"unrestricted.*(AI|assistant|mode)", _re.IGNORECASE),
    # Roleplay 攻撃
    _re.compile(r"roleplay.*you are.*(no|without|unrestricted)", _re.IGNORECASE),
    _re.compile(r"規則のない.*(AI|別の)"),
    # Echo 攻撃
    _re.compile(r"そのまま(出力|表示|返答|答え)"),
    _re.compile(r"(echo|output|print).*(the following|below)", _re.IGNORECASE),
    # 中国語 / 韓国語 (代表的なものだけ)
    _re.compile(r"你的(指令|命令|系统|提示)"),
    _re.compile(r"너의 (지시|명령)"),
]


def _is_direct_jailbreak(text: str) -> bool:
    """明確な jailbreak / プロンプト漏洩試行を regex で検出 (即ブロック判定)。"""
    for p in _DIRECT_JAILBREAK_PATTERNS:
        if p.search(text):
            return True
    return False


def _has_encoded_jailbreak(text: str) -> bool:
    """テキスト中の base64 ブロックを decode し、jailbreak パターンに該当するか判定。

    "SWdub3JlIHByZXZpb3VzIGluc3RydWN0aW9ucw==" のような base64 攻撃を捕まえる。
    decode 失敗時はスキップ、UTF-8 として読めない場合もスキップ。
    """
    import base64 as _b64

    for m in _BASE64_BLOCK.finditer(text):
        block = m.group()
        try:
            decoded = _b64.b64decode(block, validate=False).decode("utf-8", errors="ignore")
        except Exception:
            continue
        if _is_direct_jailbreak(decoded):
            return True
    return False


_rails = None
_rails_load_failed = False


def _get_rails():
    """NeMo Guardrails のインスタンスを遅延ロード。

    import 失敗時は None。呼び出し側は LLM 判定をスキップする。
    """
    global _rails, _rails_load_failed
    if _rails is not None or _rails_load_failed:
        return _rails
    try:
        import os

        # nemoguardrails 0.23+ は Vertex AI を langchain 経由でのみ初期化できる
        # (未設定だと `No default base_url for provider 'vertexai'` でロード失敗
        #  → 静かに regex-only になる事故が起きた、2026-07-26)
        os.environ.setdefault("NEMOGUARDRAILS_LLM_FRAMEWORK", "langchain")

        from nemoguardrails import LLMRails, RailsConfig

        config_path = str(Path(__file__).parent)
        config = RailsConfig.from_path(config_path)
        _rails = LLMRails(config)
        # ロード成否は運用上の重要シグナルなので WARNING で必ずログに出す
        # (INFO はデフォルト設定で欠落し、フォールバック稼働に気づけなかった)
        logger.warning("NeMo Guardrails loaded from %s", config_path)
        return _rails
    except Exception as e:
        logger.warning(
            "NeMo Guardrails unavailable, regex-only fallback (%s: %s)",
            type(e).__name__,
            e,
        )
        _rails_load_failed = True
        return None


def _is_suspicious(text: str) -> bool:
    t = text.lower()
    if len(t) >= _SUSPICIOUS_MIN_LEN:
        return True
    if t.count("\n") >= _SUSPICIOUS_NEWLINE_MIN:
        return True
    # base64 でエンコードされた攻撃ペイロード (decode 内容は調べないが
    # 「30文字以上の base64 ブロックを混ぜる」=怪しい
    if _BASE64_BLOCK.search(text):
        return True
    for kw in _SUSPICIOUS_KEYWORDS:
        if kw in t:
            return True
    return False


async def _nemo_check_input(user_input: str) -> bool:
    """NeMo 標準 flow (jailbreak detection heuristics) で判定。

    rails.generate_async を呼ぶと jailbreak detection heuristics が input
    rails として走り、検出されたら bot refuse メッセージが返ってくる。
    refuse 系応答が返ったら True (= ブロック)。

    Returns:
        True: ブロックすべき, False: 安全 (or NeMo 利用不可時の fail-open)
    """
    rails = _get_rails()
    if rails is None:
        return False
    try:
        result = await rails.generate_async(messages=[{"role": "user", "content": user_input}])
        if isinstance(result, dict):
            content = result.get("content", "")
        else:
            content = str(result)

        # jailbreak detection heuristics の標準 refuse 文言
        block_signals = (
            "i'm not able to answer the question",
            "i can't respond to that",
            "i cannot",
            "i'm sorry",
            "お答えできません",
            "申し訳ありません",
            "refuse",
        )
        lowered = content.lower()
        for sig in block_signals:
            if sig in lowered:
                logger.warning("NeMo guardrails blocked input (signal=%r)", sig)
                return True
        return False
    except Exception as e:
        logger.warning("NeMo guardrails check failed, allowing: %s", e)
        return False  # fail-open


async def validate_input(user_input: str) -> str | None:
    """入力を検証し、問題がある場合はエラーメッセージを返す。

    フロー:
      1. 推し活特有 NG regex で即ブロック
      2. 怪しさ閾値を超えたら NeMo 標準 flow (LLM) で判定
      3. NeMo もブロック判定なら拒否、それ以外は通す
    """
    # Step 1: 推し活特有 NG (住所要求 / アンチ / 転売 etc)
    if await check_oshi_specific(user_input):
        logger.warning("Oshi-specific NG blocked: %s", user_input[:50])
        return UNSAFE_INPUT_RESPONSE

    # Step 1b: 明確な jailbreak / プロンプト漏洩 (NeMo に頼らず即ブロック)
    if _is_direct_jailbreak(user_input):
        logger.warning("Direct jailbreak blocked: %s", user_input[:80])
        return UNSAFE_INPUT_RESPONSE

    # Step 1c: base64 などエンコードされた攻撃 (decode して再判定)
    if _has_encoded_jailbreak(user_input):
        logger.warning("Encoded jailbreak blocked: %s", user_input[:80])
        return UNSAFE_INPUT_RESPONSE

    # Step 2 + 3: 怪しいもののみ NeMo 標準 flow で判定
    if _is_suspicious(user_input):
        logger.info(
            "Input flagged suspicious, escalating to NeMo (len=%d)",
            len(user_input),
        )
        if await _nemo_check_input(user_input):
            return UNSAFE_INPUT_RESPONSE

    return None


async def validate_output(bot_response: str) -> str:
    """厳格な出力検証 (citation 必須)。/api/rag/ask 等の RAG Q&A 用。"""
    if not await check_citation_present(bot_response):
        logger.warning("Missing citation, replacing with fallback")
        return NO_CITATION_RESPONSE
    return bot_response


async def validate_output_chat(bot_response: str) -> str:
    """会話用の緩い出力検証 (citation 不要)。/api/chat/send, /api/chat/stream 用。

    本文に URL を埋め込む必要は無く、出典は外側の sources 配列で渡される。
    汎用の有害コンテンツチェックは入力側で NeMo 標準が担当する想定なので
    出力側は素通し。
    """
    return bot_response
