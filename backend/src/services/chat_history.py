from src.schemas.chat import ChatMessage

KEEP_RECENT = 8
COMPACT_TOPIC_LEN = 50


def trim_history(messages: list[ChatMessage]) -> list[ChatMessage]:
    """直近 KEEP_RECENT 件はそのまま保持し、それより古い履歴は
    ユーザーの過去質問を1行に圧縮する（LLM呼び出しなしの軽量処理）。
    """
    if len(messages) <= KEEP_RECENT:
        return messages

    older = messages[:-KEEP_RECENT]
    recent = messages[-KEEP_RECENT:]

    topics = [m.content[:COMPACT_TOPIC_LEN] for m in older if m.role == "user"]
    if not topics:
        return recent

    compact = ChatMessage(role="assistant", content="(これまでの話題: " + " / ".join(topics) + ")")
    return [compact, *recent]
