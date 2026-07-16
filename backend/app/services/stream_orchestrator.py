from collections.abc import AsyncIterator

from app.models.chat import ChatRequest
from app.services.analysis_demo import run_demo_question
from app.services.stream_protocol import encode_data, encode_finish, encode_text

_CHUNK_SIZE = 48


async def stream_text_chunks(text: str) -> AsyncIterator[str]:
    if not text:
        return
    for index in range(0, len(text), _CHUNK_SIZE):
        yield encode_text(text[index : index + _CHUNK_SIZE])


def extract_last_message(request: ChatRequest) -> str:
    if not request.messages:
        return ""
    return request.messages[-1].content


def extract_messages_for_model(request: ChatRequest, *, limit: int = 12) -> list[dict]:
    rows = [
        {"role": message.role, "content": message.content}
        for message in request.messages
        if message.role in {"user", "assistant", "system"}
    ]
    return rows[-limit:]


async def emit_demo_analysis(question: str) -> AsyncIterator[str]:
    yield encode_data({"type": "status", "message": "Analizuję dane produktów…"})
    result, answer = run_demo_question(question)
    async for chunk in stream_text_chunks(answer):
        yield chunk
    if result is not None:
        yield encode_data(
            {
                "type": "analysis",
                "analysis": result.model_dump(by_alias=True),
            }
        )
    else:
        yield encode_data({"type": "unsupported"})
    yield encode_finish()
