from fastapi import APIRouter

from app.config import settings
from app.models.health import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="profit-action-backend",
        demoMode=settings.demo_mode,
        openaiConfigured=settings.openai_configured,
        liveAiAvailable=settings.live_ai_available,
    )
