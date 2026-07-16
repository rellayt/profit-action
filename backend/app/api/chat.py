from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.models.chat import ChatRequest
from app.services.chat_dispatch import stream_chat_response
from app.services.stream_protocol import STREAM_HEADERS

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat")
async def post_chat(body: ChatRequest):
    return StreamingResponse(
        stream_chat_response(body),
        media_type="text/plain; charset=utf-8",
        headers=STREAM_HEADERS,
    )
