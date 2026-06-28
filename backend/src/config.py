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

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()