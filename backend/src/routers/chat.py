from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class ChatRequest(BaseModel):
    member_name: str
    message: str


@router.post("/")
async def chat(req: ChatRequest):
    """メンバーについての質問に RAG + Gemini で回答する。"""
    # TODO: articles テーブルから embedding 検索 → Gemini に渡して回答生成
    return {"answer": ""}