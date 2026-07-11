"""チャット入力に対するガードライン層。

外部ライブラリ (NeMo Guardrails 等) は導入せず、軽量なカスタム実装で
以下を担保する:

1. 入力サイズ検証 (空 / 短すぎ / 長すぎ を拒否)
2. プロンプトインジェクション検知
   - 「これまでの指示を無視」「システムプロンプトを表示」等の
     LLM 制御を奪取しようとするパターンをブロック
3. 攻撃的・倫理違反リクエスト検知
   - 誹謗中傷 / 個人特定情報要求 / 違法行為助長 の兆候をブロック
4. 出力側の安全対策
   - Gemini API 側の safety_settings は gemini_client.py 側で制御
   - 本モジュールは入力ゲートに専念

すべての拒否はユーザー向け丁寧な断り文を返し、
バックエンド側で Gemini 呼び出しを行わないため コスト面の防御も兼ねる。
"""

import re

MIN_LEN = 2
MAX_LEN = 2000

# ユーザー向けブロック応答 (chat.py と共通で参照)
UNSAFE_INPUT_RESPONSE = "申し訳ございませんが、この質問にはお答えできません。"

# ---------- プロンプトインジェクション パターン ----------
# 大文字小文字無視、日英対応。
# LLM の役割・制約を上書きしようとする文字列や、
# システムプロンプトを露出させようとする表現を検知する。
_PROMPT_INJECTION_PATTERNS = [
    # 指示上書き系
    r"ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?)",
    r"disregard\s+(previous|prior|above)\s+",
    r"forget\s+(all|everything|previous)\s+",
    r"これまでの(指示|プロンプト|命令|ルール).*(無視|忘れ|破棄)",
    r"以前の(指示|プロンプト|命令|ルール).*(無視|忘れ)",
    r"(すべての|全ての)(指示|ルール|制約).*(無視|忘れ|解除)",
    # ロール偽装系
    r"(you\s+are|act\s+as|pretend\s+to\s+be)\s+(dan|jailbreak|developer|admin|root|system)",
    r"(from\s+now\s+on|going\s+forward),?\s*you('re| are)\s+",
    r"あなたは.*(DAN|開発者|管理者|システム|root)(モード|として)",
    # システムプロンプト露出要求
    r"(show|reveal|print|display|output)\s+(the\s+)?(system|initial|hidden)\s+prompt",
    r"(システム|初期|隠された)(プロンプト|指示|命令).*(表示|見せ|教え|出力)",
    # コード実行系
    r"```\s*(system|sudo|shell|bash|python)",
    r"<\s*(system|assistant|user)\s*>",
    r"\bsudo\s+",
]

# ---------- 攻撃的・倫理違反リクエスト パターン ----------
# 完全ブロックする明確な攻撃キーワード群。
# 推し活の範疇で "殴りたい" 等の慣用表現が誤検知されるのを避けるため、
# 動詞 + 対象の組み合わせで検出。
_HARMFUL_PATTERNS = [
    # 誹謗中傷 / 攻撃指示
    r"(死ね|殺す|殺害|自殺しろ)",
    r"kill\s+(yourself|him|her|them)",
    # 個人情報要求
    r"(実家|自宅|住所|電話番号|本名).{0,15}(教え|知りたい|調べ|特定)",
    r"(personal|home|private)\s+(address|phone|number)",
    # 違法行為の指示
    r"(爆弾|銃器|麻薬|覚醒剤|大麻).{0,15}(作り|製造|入手|購入)",
    r"how\s+to\s+(make|build|create)\s+(a\s+)?(bomb|weapon|drug|virus|malware)",
    # 差別・ヘイト
    r"(差別|ヘイト).{0,10}(発言|表現).{0,10}(生成|作成|書い)",
]


def _matches_any(text: str, patterns: list[str]) -> bool:
    for pat in patterns:
        if re.search(pat, text, flags=re.IGNORECASE):
            return True
    return False


def validate_input(text: str) -> str | None:
    """入力をバリデーションし、問題があればユーザー向けメッセージを返す (無ければ None)。

    チェック順:
      1. サイズ (空/短すぎ/長すぎ)
      2. プロンプトインジェクション
      3. 攻撃的/倫理違反リクエスト
    """
    stripped = text.strip()

    if not stripped:
        return "質問を入力してください。"
    if len(stripped) < MIN_LEN:
        return "もう少し詳しく質問を入力していただけますか？"
    if len(stripped) > MAX_LEN:
        return f"質問が長すぎます。{MAX_LEN}文字以内でお願いします。"

    if _matches_any(stripped, _PROMPT_INJECTION_PATTERNS):
        return UNSAFE_INPUT_RESPONSE

    if _matches_any(stripped, _HARMFUL_PATTERNS):
        return UNSAFE_INPUT_RESPONSE

    return None
