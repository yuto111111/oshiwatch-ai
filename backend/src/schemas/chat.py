from typing import Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    # 単一メンバー詳細ページから呼ぶ場合はここに name_en を渡す
    # ダッシュボード (フォロー中の推し横断チャット) から呼ぶ場合は user_id を渡す
    member_name: str | None = None
    user_id: str | None = None
    # 会話履歴。最新のユーザー発言を末尾に含めて送る
    messages: list[ChatMessage] = Field(..., min_length=1)
