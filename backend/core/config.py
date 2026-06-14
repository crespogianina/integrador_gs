from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str = "postgresql+psycopg2://foodalchemy:foodalchemy_dev@localhost:5432/foodalchemy"
    GEMINI_API_KEY: str = ""
    JWT_SECRET_KEY: str = "cambiar-en-produccion-usar-secreto-largo"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 días
    GEMINI_MODEL: str = "gemini-2.5-flash-lite"
    CORS_ORIGINS: str = "*"


settings = Settings()
