from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = "sqlite:///./route53.db"
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    cookie_name: str = "route53_session"
    cookie_secure: bool = False
    cookie_samesite: str = "lax"
    session_ttl_hours: int = 24
    seed_on_start: bool = True
    frontend_url: str = "http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]


settings = Settings()
