from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Supabase
    supabase_url: str = "http://127.0.0.1:54321"
    supabase_service_role_key: str = ""

    # GCP / Vertex AI
    google_cloud_project: str = ""
    vertex_ai_location: str = "asia-northeast1"
    gemini_model: str = "gemini-2.5-flash"
    embedding_model: str = "text-multilingual-embedding-002"

    # App
    cors_origins: str = "http://localhost:3000"
    env: str = "development"

    # Crawl
    crawl_user_agent: str = "Mozilla/5.0 (compatible; OshiWatchAI/1.0)"
    crawl_request_timeout: float = 15.0
    snowman_official_schedule_url: str = "https://starto.jp/s/p/artist/43"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()