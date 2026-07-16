from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    service: str
    demo_mode: bool = Field(alias="demoMode")
    openai_configured: bool = Field(alias="openaiConfigured")
    live_ai_available: bool = Field(alias="liveAiAvailable")

    model_config = {"populate_by_name": True}
