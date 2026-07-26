"""NeMo Guardrails カスタムアクション。

汎用的な jailbreak / 有害コンテンツ検出は NeMo 標準 (jailbreak detection
heuristics, self_check_input) に委譲し、ここでは推し活ドメイン特有のチェック
のみ実装する。
"""

from __future__ import annotations

import re

# NeMo の flow (.co) から execute で呼ぶには @action 登録が必要。
# nemoguardrails 不在の環境 (regex-only フォールバック) でも本モジュールは
# __init__ から直接 import されるため、デコレータはダミーに差し替える
try:
    from nemoguardrails.actions import action
except Exception:  # pragma: no cover

    def action(*_args, **_kwargs):
        def _decorator(fn):
            return fn

        return _decorator

# 推し活ドメイン特有 NG ワード
#   - ストーカー行為 / 私的情報の特定要求
#   - アンチ的投稿の生成依頼
#   - チケット転売の手助け
#   - 暴力的・違法な内容
_OSHI_SPECIFIC_NG = [
    # 住所・自宅特定
    r"住所.*(教え|知り|特定)",
    r"自宅.*(教え|知り|特定|住所)",
    r"実家.*(住所|場所|どこ).*(教え|知り)",
    # 待ち伏せ
    r"待ち伏せ",
    r"出待ち.*(場所|時間|教え)",
    r"入り待ち.*(場所|時間|教え)",
    # 連絡先
    r"(?:電話|携帯|スマホ).*番号",
    r"(?:LINE|ライン|インスタ|TikTok).*(ID|アカウント|教え).*(本人|プライベート|裏)",
    # 過去関係者 stalking
    r"(?:小学|中学|高校|大学).*(同級生|友達|友人|クラスメート).*(探|特定|連絡|教え)",
    r"元(?:彼|カノ|恋人|配偶者).*(探|特定|連絡|教え)",
    r"親(?:族|戚|戚|戚).*(住所|場所|連絡|特定)",
    # アンチ・誹謗
    r"アンチ.*(コメント|投稿|文章).*(作[っりるって]|書[いてけ]|考え)",
    r"誹謗中傷.*(文|コメント|投稿)",
    r"悪口.*(書|考|作|生成)",
    # 転売
    r"チケット.*(転売|高額|定価以上)",
    r"(?:プレ|プレミアム|限定).*グッズ.*(転売|高額)",
    # 暴露・流出
    r"暴露.*(記事|投稿|書)",
    r"(?:流出|リーク).*(情報|画像|動画).*(教え|どこ|入手)",
    # 致命的な暴力・自殺関連 (汎用は NeMo self_check に任せつつ、最低限の網)
    r"殺[すし]",
    r"自殺.*方法",
    r"自傷.*方法",
    r"児童ポルノ",
]

# 出典URLのパターン
_CITATION_PATTERN = re.compile(r"https?://[^\s\)]+")


@action(name="check_oshi_specific")
async def check_oshi_specific(user_input: str) -> bool:
    """推し活ドメイン特有の NG パターンに該当するかチェックする。

    汎用の jailbreak / 有害コンテンツ判定は NeMo 標準 flow が担当するため、
    ここでは推し活アプリ特有のリスクのみ判定する。

    Returns:
        True: 推し活 NG（ブロックすべき）, False: 該当なし
    """
    for pattern in _OSHI_SPECIFIC_NG:
        if re.search(pattern, user_input, re.IGNORECASE):
            return True
    return False


@action(name="check_citation_present")
async def check_citation_present(bot_response: str) -> bool:
    """回答に出典URLが含まれているかチェックする (厳格 RAG Q&A 用)。

    AI チャット用の緩い検証は guardrails.__init__.validate_output_chat 側で
    別途行うため、こちらは「情報が見つかりません」系を許容しつつ URL を必須
    にする。
    """
    no_info_patterns = [
        "見つかりませんでした",
        "情報がありません",
        "該当する情報",
        "蓄積されていません",
    ]
    for pattern in no_info_patterns:
        if pattern in bot_response:
            return True

    return bool(_CITATION_PATTERN.search(bot_response))
