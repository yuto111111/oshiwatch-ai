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

app.include_router(health.router, tags=["health"])
app.include_router(summaries.router, prefix="/api/summaries", tags=["summaries"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(users.router, prefix="/api/users", tags=["users"])