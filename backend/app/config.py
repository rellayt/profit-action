from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    demo_mode: bool = False
    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"
    openai_timeout_seconds: float = 60.0
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def openai_configured(self) -> bool:
        return bool(self.openai_api_key and self.openai_api_key.strip())

    @property
    def live_ai_available(self) -> bool:
        """Live when API key is set; DEMO_MODE=true forces local path."""
        if self.demo_mode:
            return False
        return self.openai_configured


settings = Settings()
