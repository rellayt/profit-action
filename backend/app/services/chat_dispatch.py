from collections.abc import AsyncIterator

from app.config import settings
from app.models.chat import ChatRequest
from app.services.chat_live import stream_live_chat
from app.services.stream_orchestrator import emit_demo_analysis, extract_last_message


async def stream_chat_response(request: ChatRequest) -> AsyncIterator[str]:
    if not settings.live_ai_available:
        question = extract_last_message(request)
        async for chunk in emit_demo_analysis(question):
            yield chunk
        return

    async for chunk in stream_live_chat(request):
        yield chunk
