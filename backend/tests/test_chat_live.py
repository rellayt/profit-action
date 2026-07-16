"""Mocked Live AI path — no real OpenAI calls."""

from __future__ import annotations

import json
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.models.chat import ChatMessage, ChatRequest
from app.services import chat_live


def _tool_call(arguments: str, name: str = "analyze_products") -> SimpleNamespace:
    return SimpleNamespace(
        id="call_1",
        function=SimpleNamespace(name=name, arguments=arguments),
    )


def _completion_message(*, content: str | None = None, tool_calls=None):
    return SimpleNamespace(
        choices=[
            SimpleNamespace(message=SimpleNamespace(content=content, tool_calls=tool_calls or []))
        ]
    )


async def _empty_stream():
    if False:  # pragma: no cover
        yield None


async def _collect(stream) -> str:
    chunks: list[str] = []
    async for chunk in stream:
        chunks.append(chunk)
    return "".join(chunks)


def _data_parts(body: str) -> list[dict]:
    parts: list[dict] = []
    for line in body.splitlines():
        if not line.startswith("2:"):
            continue
        payload = json.loads(line[2:])
        if isinstance(payload, list):
            parts.extend(item for item in payload if isinstance(item, dict))
        elif isinstance(payload, dict):
            parts.append(payload)
    return parts


@pytest.mark.asyncio
async def test_invalid_plan_continues_then_finishes(monkeypatch):
    async def create(**kwargs):
        if kwargs.get("stream"):
            return _empty_stream()
        return _completion_message(
            content=None,
            tool_calls=[_tool_call("{not-json")],
        )

    client = MagicMock()
    client.chat.completions.create = AsyncMock(side_effect=create)
    monkeypatch.setattr(chat_live, "get_openai_client", lambda: client)

    body = await _collect(
        chat_live.stream_live_chat(
            ChatRequest(messages=[ChatMessage(role="user", content="pokaż ujemny zysk")])
        )
    )
    parts = _data_parts(body)
    assert any(part.get("type") == "status" for part in parts)
    assert not any(part.get("type") == "analysis" for part in parts)
    assert "d:" in body


def _text_from_body(body: str) -> str:
    texts: list[str] = []
    for line in body.splitlines():
        if line.startswith("0:"):
            texts.append(json.loads(line[2:]))
    return "".join(texts)


_VALID_LIST_ARGS = json.dumps(
    {
        "operation": "list",
        "criteriaSummary": "Ujemny zysk",
        "filters": [{"field": "profit", "operator": "lt", "value": 0}],
    }
)


@pytest.mark.asyncio
async def test_soft_fail_after_analysis_still_emits_analysis(monkeypatch):
    first = _completion_message(
        content=None,
        tool_calls=[_tool_call(_VALID_LIST_ARGS)],
    )

    async def create(**kwargs):
        if kwargs.get("stream"):
            raise RuntimeError("narration failed")
        return first

    client = MagicMock()
    client.chat.completions.create = AsyncMock(side_effect=create)
    monkeypatch.setattr(chat_live, "get_openai_client", lambda: client)

    body = await _collect(
        chat_live.stream_live_chat(
            ChatRequest(messages=[ChatMessage(role="user", content="ujemny zysk")])
        )
    )
    parts = _data_parts(body)
    analysis_parts = [part for part in parts if part.get("type") == "analysis"]
    assert len(analysis_parts) == 1
    assert analysis_parts[0]["analysis"]["analysisId"]
    assert "d:" in body
    assert _text_from_body(body)


@pytest.mark.asyncio
async def test_soft_fail_after_partial_text_does_not_duplicate(monkeypatch):
    first = _completion_message(
        content=None,
        tool_calls=[_tool_call(_VALID_LIST_ARGS)],
    )
    answer_text_holder: dict[str, str] = {}

    async def partial_then_fail():
        yield SimpleNamespace(choices=[SimpleNamespace(delta=SimpleNamespace(content="Partial."))])
        raise RuntimeError("narration failed mid-stream")

    async def create(**kwargs):
        if kwargs.get("stream"):
            return partial_then_fail()
        return first

    client = MagicMock()
    client.chat.completions.create = AsyncMock(side_effect=create)
    monkeypatch.setattr(chat_live, "get_openai_client", lambda: client)

    original_run = chat_live.run_product_analysis

    def capture_run(plan):
        result = original_run(plan)
        answer_text_holder["answer"] = result.answer_text
        return result

    monkeypatch.setattr(chat_live, "run_product_analysis", capture_run)

    body = await _collect(
        chat_live.stream_live_chat(
            ChatRequest(messages=[ChatMessage(role="user", content="ujemny zysk")])
        )
    )
    text = _text_from_body(body)
    assert text == "Partial."
    assert answer_text_holder["answer"]
    assert answer_text_holder["answer"] not in text
    parts = _data_parts(body)
    assert any(part.get("type") == "analysis" for part in parts)
    assert "d:" in body


@pytest.mark.asyncio
async def test_empty_choices_soft_fails_and_finishes(monkeypatch):
    async def create(**kwargs):
        return SimpleNamespace(choices=[])

    client = MagicMock()
    client.chat.completions.create = AsyncMock(side_effect=create)
    monkeypatch.setattr(chat_live, "get_openai_client", lambda: client)

    body = await _collect(
        chat_live.stream_live_chat(
            ChatRequest(messages=[ChatMessage(role="user", content="hello")])
        )
    )
    parts = _data_parts(body)
    assert not any(part.get("type") == "analysis" for part in parts)
    assert "Nie udało się połączyć z modelem" in _text_from_body(body)
    assert "d:" in body


@pytest.mark.asyncio
async def test_unknown_tool_continues_then_finishes(monkeypatch):
    async def create(**kwargs):
        if kwargs.get("stream"):
            return _empty_stream()
        return _completion_message(
            content=None,
            tool_calls=[_tool_call("{}", name="not_a_real_tool")],
        )

    client = MagicMock()
    client.chat.completions.create = AsyncMock(side_effect=create)
    monkeypatch.setattr(chat_live, "get_openai_client", lambda: client)

    body = await _collect(
        chat_live.stream_live_chat(ChatRequest(messages=[ChatMessage(role="user", content="coś")]))
    )
    parts = _data_parts(body)
    assert any(part.get("type") == "status" for part in parts)
    assert not any(part.get("type") == "analysis" for part in parts)
    assert "d:" in body

    second_call_messages = client.chat.completions.create.await_args_list[1].kwargs["messages"]
    tool_msgs = [m for m in second_call_messages if m.get("role") == "tool"]
    assert len(tool_msgs) == 1
    assert json.loads(tool_msgs[0]["content"]) == {"error": "Unsupported tool"}
