from typing import Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    member_name: str
    # 会話履歴。最新のユーザー発言を末尾に含めて送る
    messages: list[ChatMessage] = Field(..., min_length=1)
