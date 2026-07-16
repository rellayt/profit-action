from __future__ import annotations

import json
import logging
from collections.abc import AsyncIterator

from app.config import settings
from app.models.analysis import AnalysisPlan
from app.models.chat import ChatRequest
from app.services.analysis import catalog_digest, run_product_analysis
from app.services.field_registry import field_registry_prompt
from app.services.openai_client import get_openai_client
from app.services.plan_tool_schema import ANALYZE_TOOL, TOOL_NAME
from app.services.stream_orchestrator import extract_messages_for_model, stream_text_chunks
from app.services.stream_protocol import encode_data, encode_finish

logger = logging.getLogger(__name__)

_CONNECT_ERROR_TEXT = (
    "Nie udało się połączyć z modelem. Sprawdź OPENAI_API_KEY albo włącz DEMO_MODE."
)


def _system_prompt() -> str:
    return (
        "Jesteś Copilotem Profit Action dla e-commerce. Odpowiadasz po polsku, konkretnie.\n"
        f"{field_registry_prompt()}\n"
        f"{catalog_digest()}\n"
        "Gdy potrzebujesz liczb lub listy produktów, wywołaj narzędzie analyze_products.\n"
        "Nie wymyślaj ID produktów ani KPI — używaj wyłącznie wyniku narzędzia.\n"
        "Follow-upy („z tych”, „a teraz tylko…”) muszą użyć scopeAnalysisId z poprzedniej analizy.\n"
        "Jeśli pytanie nie wymaga danych katalogu, odpowiedz bez narzędzia.\n"
        "Dla niejednoznacznych haseł (np. najlepiej) ustaw interpretationNote i wymień interpretację w odpowiedzi.\n"
        "\n"
        "Styl odpowiedzi po analizie:\n"
        "- Maks. 2–4 krótkie zdania (lub krótki markdown: nagłówek + 2–3 punkty).\n"
        "- Używaj matchedCount z narzędzia jako liczby wyniku (po limicie). "
        "Jeśli użytkownik prosi o 5 produktów, a matchedCount=5 — mów o 5, nigdy zawyżaj.\n"
        "- Ewentualnie do 3 nazw z topProducts — bez długich opisów każdego SKU.\n"
        "- Gdy showCta=true, napisz że szczegóły / wykres są pod przyciskiem "
        "„Zobacz analizę” (UI pokazuje przycisk — Ty tylko o niego nawiąż).\n"
        "- Przy listach ustaw limit zgodnie z prośbą (np. top 5 → limit: 5).\n"
        "- Nie powtarzaj pełnych tabel z narzędzia.\n"
    )


def _tool_payload_for_model(result) -> dict:
    return {
        "analysisId": result.analysis_id,
        "operation": result.operation,
        "criteriaSummary": result.criteria_summary,
        "interpretationNote": result.interpretation_note,
        "limit": result.plan.limit,
        "matchedCount": result.summary.matched_products,
        "matchedProductIds": result.matched_product_ids[:40],
        "kpis": [k.model_dump(by_alias=True) for k in result.kpis],
        "topProducts": [t.model_dump(by_alias=True) for t in result.top_products[:3]],
        "groupRows": [g.model_dump(by_alias=True) for g in result.group_rows[:8]],
        "aggregations": [a.model_dump() for a in result.aggregations],
        "showCta": result.show_cta,
    }


def _tool_error_message(tool_call_id: str, error: str) -> dict:
    return {
        "role": "tool",
        "tool_call_id": tool_call_id,
        "content": json.dumps({"error": error}, ensure_ascii=False),
    }


async def stream_live_chat(request: ChatRequest) -> AsyncIterator[str]:
    yield encode_data({"type": "status", "message": "Analizuję dane produktów…"})

    client = get_openai_client()
    messages = [
        {"role": "system", "content": _system_prompt()},
        *extract_messages_for_model(request, limit=12),
    ]

    analysis_result = None
    text_emitted = False

    try:
        first = await client.chat.completions.create(
            model=settings.openai_model,
            messages=messages,
            tools=[ANALYZE_TOOL],
            tool_choice="auto",
            temperature=0.2,
        )
        if not first.choices:
            raise RuntimeError("Empty completion choices from model")
        choice = first.choices[0].message
        tool_calls = choice.tool_calls or []

        if tool_calls:
            messages.append(
                {
                    "role": "assistant",
                    "content": choice.content,
                    "tool_calls": [
                        {
                            "id": call.id,
                            "type": "function",
                            "function": {
                                "name": call.function.name,
                                "arguments": call.function.arguments,
                            },
                        }
                        for call in tool_calls
                    ],
                }
            )
            for call in tool_calls:
                if call.function.name != TOOL_NAME:
                    messages.append(_tool_error_message(call.id, "Unsupported tool"))
                    continue
                try:
                    args = json.loads(call.function.arguments or "{}")
                    plan = AnalysisPlan.model_validate(args)
                except Exception:
                    logger.exception("Invalid analyze_products plan from model")
                    messages.append(_tool_error_message(call.id, "Invalid analysis plan"))
                    continue
                analysis_result = run_product_analysis(plan)
                messages.append(
                    {
                        "role": "tool",
                        "tool_call_id": call.id,
                        "content": json.dumps(
                            _tool_payload_for_model(analysis_result),
                            ensure_ascii=False,
                        ),
                    }
                )

            stream = await client.chat.completions.create(
                model=settings.openai_model,
                messages=messages,
                temperature=0.3,
                stream=True,
            )
            async for event in stream:
                delta = event.choices[0].delta.content if event.choices else None
                if delta:
                    async for chunk in stream_text_chunks(delta):
                        text_emitted = True
                        yield chunk
        else:
            content = choice.content or ""
            async for chunk in stream_text_chunks(content):
                text_emitted = True
                yield chunk
    except Exception:
        logger.exception("Live chat completion failed")
        if not text_emitted:
            fallback = (
                analysis_result.answer_text if analysis_result is not None else _CONNECT_ERROR_TEXT
            )
            async for chunk in stream_text_chunks(fallback):
                yield chunk

    if analysis_result is not None:
        yield encode_data(
            {
                "type": "analysis",
                "analysis": analysis_result.model_dump(by_alias=True),
            }
        )

    yield encode_finish()
