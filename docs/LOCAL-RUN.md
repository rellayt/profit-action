# Local run

## Prerequisites

- Python 3.12+
- Node.js 22+ (matches CI)
- Windows: use two terminals (no Docker)

## All-in-one dev

From repo root (after `pip install -e ".[dev]"` in `backend/` and `npm install` in `frontend/`):

```bash
npm run dev
```

- Backend: http://127.0.0.1:8000  
- Frontend: http://localhost:5173  

`Ctrl+C` stops both services.

Frontend changes hot-reload via Vite (no full restart). Backend reload watches only `backend/app/` — edits to tests, scripts, or `data/` do **not** restart the API.

### Frontend-only (stable backend)

If you only change React/UI code, run backend once without reload and frontend with HMR:

```bash
# terminal 1 — stable API
set PA_BACKEND_RELOAD=0
npm run dev:backend

# terminal 2 — hot reload UI
npm run dev:frontend
```

On Unix: `PA_BACKEND_RELOAD=0 npm run dev:backend`

## Backend only

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -e ".[dev]"
copy ..\.env.example .env
node ../scripts/run-backend-dev.mjs
```

Or manually (same narrow reload as `npm run dev:backend`):

```bash
uvicorn app.main:app --reload --reload-dir app --host 127.0.0.1 --port 8000
```

Health check: http://127.0.0.1:8000/health  
Interactive OpenAPI: http://127.0.0.1:8000/docs

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — Vite proxies `/api` and `/health` to port 8000.

## Live AI

In `backend/.env`:

```env
DEMO_MODE=false
OPENAI_API_KEY=sk-...
```

Restart backend. Health returns `liveAiAvailable: true`.

Voice input is browser-only (Web Speech API) and does not use the backend — transcripts are sent as normal chat text via `POST /api/chat`.

## Conversations while developing

Backend conversation/analysis stores are **in-memory**. Restarting the API clears server-side history. The UI may still show chats from `localStorage` (`pa-copilot-conversations-v2`) — intentional demo behaviour ([ADR-002](./adr/002-ephemeral-conversation-store.md)). Clear site data in the browser if you want a fully empty history after a backend restart.

After a breaking `AnalysisResult` change, regenerate contracts and bump the storage key again (see [ADR-003](./adr/003-openapi-zod-contracts.md)).

## Contracts (OpenAPI → Zod)

When you change Pydantic models or stream data parts:

```bash
npm run contracts:generate   # writes contracts/openapi.json + frontend Zod
npm run contracts:check      # fails if committed outputs are stale
```

Requires a working backend venv (scripts use `backend/.venv` Python when present). Details: [ADR-003](./adr/003-openapi-zod-contracts.md).

## Tests

From repo root:

```bash
npm test              # pytest + vitest
npm run ci            # full unit gate (incl. contracts:check)
npm run ci:full       # ci + Playwright
npm run test:e2e      # Playwright only (starts backend + frontend if needed)
```

E2E uses `reuseExistingServer: !process.env.CI` — locally it may attach to already-running servers. Playwright runs with **one worker** because the backend conversation store is shared in-memory; each test wipes `/api/conversations` and `localStorage` via `e2e/tests/helpers.ts`.
