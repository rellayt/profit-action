import json


def encode_text(text: str) -> str:
    return f"0:{json.dumps(text, ensure_ascii=False)}\n"


def encode_data(payload: dict) -> str:
    return f"2:{json.dumps([payload], ensure_ascii=False)}\n"


def encode_finish() -> str:
    return 'd:{"type":"finish","finishReason":"stop"}\n'


STREAM_HEADERS = {
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "x-vercel-ai-data-stream": "v1",
}
