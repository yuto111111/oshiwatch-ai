MIN_LEN = 2
MAX_LEN = 2000


def validate_input(text: str) -> str | None:
    """入力を軽量バリデーションする。問題があればユーザー向けメッセージを返し、無ければ None。"""
    stripped = text.strip()
    if not stripped:
        return "質問を入力してください。"
    if len(stripped) < MIN_LEN:
        return "もう少し詳しく質問を入力していただけますか？"
    if len(stripped) > MAX_LEN:
        return f"質問が長すぎます。{MAX_LEN}文字以内でお願いします。"
    return None
