# Backend API

Base URL (local): `http://127.0.0.1:8000`

**Contract source of truth:** Pydantic models → OpenAPI (`/docs`, committed `contracts/openapi.json`) → generated Zod on the frontend ([ADR-003](./adr/003-openapi-zod-contracts.md)). Wire JSON uses **camelCase** aliases.

## Health

`GET /health`

```json
{
  "status": "ok",
  "service": "profit-action-backend",
  "demoMode": false,
  "openaiConfigured": false,
  "liveAiAvailable": false
}
```

`demoMode` mirrors Settings/`DEMO_MODE`. Without a key, `liveAiAvailable` is still `false` and the chat path uses demo heuristics.

## Products

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products` | Classified catalog from `classify_catalog()` (`segment`, `recommendation`, `segmentCounts`). No period query — analysis windows live on `AnalysisResult.periodDays`. |

## Conversations

In-memory store for the local demo (resets on process restart). The UI also keeps an optimistic copy in `localStorage` (`pa-copilot-conversations-v2` — may outlive an API restart; see [ADR-002](./adr/002-ephemeral-conversation-store.md)).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/conversations` | List summaries (`id`, `title`, `createdAt`, `updatedAt`) |
| GET | `/api/conversations/{id}` | Full conversation (messages + `analysesById` + bindings) |
| PUT | `/api/conversations/{id}` | Upsert full detail body (`ConversationDetail` shape; path id must match body `id`) |
| DELETE | `/api/conversations/{id}` | Remove conversation (`204`) |

`analysesById` is typed as `dict[str, AnalysisResult]` (invalid nested analysis bodies fail validation on upsert).

## Chat (streaming)

`POST /api/chat`

Body: `{ "messages": [{ "role": "user", "content": "..." }] }`

Response: `text/plain` AI SDK stream (`0:` text, `2:` JSON data, `d:` finish).

Data parts (also modeled in OpenAPI / Zod):

| type | Payload |
|------|---------|
| `status` | `{ type: "status", message }` progress (e.g. Analyzing products…) |
| `analysis` | `{ type: "analysis", analysis: AnalysisResult }` |
| `unsupported` | `{ type: "unsupported" }` when demo cannot map the question |

Chat always responds with HTTP 200 and a stream. Soft failures (Live AI narration errors) still emit useful text and, when available, the analysis data part.

### AnalysisResult (wire)

Includes: `analysisId`, `operation`, `periodDays`, `answerText`, `criteriaSummary`, `interpretationNote`, `showChart`, `showCta`, `plan` (`AnalysisPlan`), `summary`, `kpis`, `topProducts`, `matchedProductIds`, `matchedProducts`, `groupRows`, `aggregations`, `chartPoints`, `chartCaption`.

**Removed from the wire DTO:** `intent`, `intentLabel`, `confidence`, `minimumStock`, `segments`, `totalSpendWithoutRevenue`. Modal title / criteria UI uses `criteriaSummary` only.

Voice transcripts are obtained in the browser (Web Speech API) and sent as ordinary chat messages — the API has no audio upload or STT endpoint. There is also no feed-changes API.

## Regenerating the committed OpenAPI snapshot

```bash
npm run contracts:generate
```

See [LOCAL-RUN.md](./LOCAL-RUN.md) and [ADR-003](./adr/003-openapi-zod-contracts.md).
