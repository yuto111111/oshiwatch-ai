from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import settings
from src.routers import health, summaries, chat, users

app = FastAPI(
    title="OshiWatch AI API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def _warm_guardrails() -> None:
    """NeMo Guardrails を起動時にロードする。

    遅延ロードのままだと (1) 初回の suspicious 入力で数秒待たされる、
    (2) ロード失敗に気づけない (regex-only へ静かにフォールバック)、
    の 2 点が問題だったため起動時に実行し、成否を必ずログに残す。
    失敗してもアプリは起動する (regex 層は動く)。
    """
    from src.guardrails import _get_rails

    _get_rails()


app.include_router(health.router, tags=["health"])
app.include_router(summaries.router, prefix="/api/summaries", tags=["summaries"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(users.router, prefix="/api/users", tags=["users"])