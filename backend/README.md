# Profit Action · Backend

FastAPI service · synthetic `products.json` · `services/analysis` + `classify.py` · read-only analytics.

User-facing analysis strings (`answerText`, KPI labels, recommendations) are Polish.

Conversation and analysis snapshot stores are **in-memory** (process lifetime). See [ADR-002](../docs/adr/002-ephemeral-conversation-store.md).

Wire DTOs are the OpenAPI source of truth — regenerate committed contracts after model changes ([ADR-003](../docs/adr/003-openapi-zod-contracts.md)).

## Layout (high level)

| Area | Role |
|------|------|
| `app/models/` | `catalog`, `analysis`, `conversation`, `chat` (request + stream parts), `health` — no product barrel |
| `app/api/` | `health`, `products`, `conversations`, `chat` |
| `app/services/classify.py` | Segments; `classify_catalog()` cached |
| `app/services/analysis/` | Public plan execution helpers + `run_product_analysis` |
| `app/services/field_registry.py` | `FIELD_META` / prompt prose keyed by `PlanField` |
| `app/services/analysis_demo.py` | Demo NL heuristics; exact starter-chip match first |

## Run

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -e ".[dev]"
uvicorn app.main:app --reload --reload-dir app --host 127.0.0.1 --port 8000
```

Prefer repo-root `npm run dev:backend` for the same narrow reload scope.

## Tests

```bash
pytest
```

Includes classify cache, field_registry coverage, conversation upsert validation, plan schema sync.

## Contracts

From repo root (uses this venv’s Python when present):

```bash
npm run contracts:generate
npm run contracts:check
```

## Config (`backend/.env`)

| Variable | Default | Notes |
|----------|---------|-------|
| `DEMO_MODE` | `false` | When `true`, forces local demo heuristics (no OpenAI). With a key and `false`, Live AI is used. |
| `OPENAI_API_KEY` | empty | Required for Live AI when `DEMO_MODE=false` |
| `OPENAI_MODEL` | `gpt-4o-mini` | Live tool-calling analysis |
| `OPENAI_TIMEOUT_SECONDS` | `60` | OpenAI client timeout |
| `CORS_ORIGINS` | Vite origins | Comma-separated |
