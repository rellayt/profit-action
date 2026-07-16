<p align="center">
  <img src="./docs/assets/pa-mark.png" width="96" height="96" alt="Profit Action" />
</p>

<h1 align="center">Profit Action</h1>

<p align="center">
  <strong>Ask about products. Get explainable numbers.</strong><br />
  Demo-ready monorepo — React + FastAPI · synthetic e-commerce catalog · read-only analytics
</p>

<p align="center">
  <a href="#quick-start">Quick start</a>
  ·
  <a href="./docs/README.md">Docs</a>
  ·
  <a href="./docs/ARCHITECTURE.md">Architecture</a>
  ·
  <a href="./CONTRIBUTING.md">Contributing</a>
  ·
  <a href="./LICENSE">License</a>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React_19-Vite-61DAFB?style=flat-square&logo=react&logoColor=111" />
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-Python_3.12-009688?style=flat-square&logo=fastapi&logoColor=white" />
  <img alt="AI" src="https://img.shields.io/badge/AI-OpenAI_or_Demo-14d977?style=flat-square" />
  <img alt="Contracts" src="https://img.shields.io/badge/Contracts-OpenAPI_+_Zod-0ea85c?style=flat-square" />
</p>

---

## What it is

Profit Action is a **Polish-language product analytics copilot**. You ask a natural-language (or voice) question; OpenAI or a local demo parser builds a declarative **AnalysisPlan**; FastAPI runs it on a classified synthetic catalog and returns numbers you can verify on a chart and in the full product list.

No external advertising or analytics systems are connected. A production extension could turn recommendations into approved feed or ad actions — **this demo stays read-only**.

| | |
| :--- | :--- |
| **UI & answers** | Polish |
| **Docs in this repo** | English |
| **Catalog** | ~100 synthetic products (`p-001` … `p-100`) |
| **Runtime** | No Docker — `npm run dev` |

---

## Highlights

- **Natural questions** — type or speak; starter chips get you moving in seconds
- **Explainable segments** — stop spending / rescue / scale / neutral, with real KPIs
- **Deterministic engine** — the LLM never invents counts; Python owns classify + analysis
- **Verify anywhere** — chat answer → **Zobacz analizę** (chart + table) → full **Produkty** catalog
- **Two AI paths** — Live OpenAI tool calling, or offline demo heuristics without a key

---

## Quick start

```bash
# One command (backend + frontend)
npm run dev

# Or separately:
# npm run dev:backend
# npm run dev:frontend
```

| Surface | URL |
|---------|-----|
| App | http://localhost:5173 |
| API docs | http://127.0.0.1:8000/docs |

Copy `.env.example` → `backend/.env`. **No OpenAI key is required** for a working demo — without a key the API uses local heuristics. `DEMO_MODE` defaults to `false` in Settings; set `DEMO_MODE=true` to force demo even when a key is present.

→ Full setup: **[docs/LOCAL-RUN.md](./docs/LOCAL-RUN.md)**

---

## Modes

| Mode | Env | Behaviour |
|------|-----|-----------|
| **Demo** | No `OPENAI_API_KEY`, or `DEMO_MODE=true` | Local heuristics + deterministic `analyze_products` engine |
| **Live AI** | `OPENAI_API_KEY` + `DEMO_MODE=false` | OpenAI tool calling → FastAPI numbers → natural answer |
| **Voice** | Browser STT | Web Speech API transcript → same `POST /api/chat` path |

The LLM never computes segment counts or KPIs — Python `classify.py` / `services/analysis` are the source of truth.

---

## Demo flow

1. Open **Copilot** and pick a suggestion chip (or type / speak a question).
2. Copilot streams a short answer with real numbers from `products.json`.
3. **Zobacz analizę** → spend vs profit chart + KPIs + matched products.
4. Open **Produkty** for the full catalog (independent of the chat filter).

---

## Repository layout

```text
profit-action/
├── frontend/              React 19 · Vite · Mantine · TanStack Query · AI SDK · Zod
│   └── src/
│       ├── features/copilot/
│       └── contracts/generated/   Zod schemas (generated — do not hand-edit)
├── backend/               Python 3.12 · FastAPI · classify + analysis engine
├── contracts/             Committed OpenAPI snapshot (openapi.json)
├── docs/                  Guides, ADRs, design system, brand assets
├── scripts/               Dev helpers + contracts export/generate
├── .github/workflows/ci.yml
└── package.json
```

---

## Documentation

| Doc | Role |
|-----|------|
| [docs/README.md](./docs/README.md) | Docs index |
| [LOCAL-RUN.md](./docs/LOCAL-RUN.md) | Setup, reload, Live AI env, tests |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System boundaries, contracts, session |
| [APPLICATION-GUIDE.md](./docs/APPLICATION-GUIDE.md) | UI contracts and flows (source of truth for agents) |
| [BACKEND-API.md](./docs/BACKEND-API.md) | HTTP surface and stream parts |
| [DATA.md](./docs/DATA.md) | Synthetic catalog, generator, segments |
| [DESIGN-SYSTEM.md](./docs/DESIGN-SYSTEM.md) | Tokens, surfaces, chart colors |
| [ADR-001](./docs/adr/001-deterministic-analysis-engine.md) | Why Python owns numbers |
| [ADR-002](./docs/adr/002-ephemeral-conversation-store.md) | In-memory API store + localStorage cache |
| [ADR-003](./docs/adr/003-openapi-zod-contracts.md) | OpenAPI SoT + generated Zod |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Checks and conventions |
| [LICENSE](./LICENSE) | License |

---

## Quality / CI

```bash
npm test                 # backend pytest + frontend vitest (unit + RTL/MSW)
npm run ci               # ruff + pytest + contracts:check + ESLint + knip + typecheck + vitest
npm run ci:full          # ci + Playwright smoke
npm run contracts:generate
npm run test:e2e         # Playwright smoke (starts dev servers)
cd frontend && npm run storybook
```

GitHub Actions (`.github/workflows/ci.yml`) on every PR:

- **Backend:** Ruff · pytest · contracts drift (`git diff` after regenerate)
- **Frontend:** ESLint · Knip · `tsc` · Vitest (MSW + Testing Library)
- **E2E:** Playwright smoke (demo CTA, history, Ponów, catalog, settings — one worker)

Wire DTOs: Pydantic → `contracts/openapi.json` → generated Zod ([ADR-003](./docs/adr/003-openapi-zod-contracts.md)). Client conversation cache key: `pa-copilot-conversations-v2` ([ADR-002](./docs/adr/002-ephemeral-conversation-store.md)).

---

## Stack

| Area | Choice in this repo |
|------|---------------------|
| Core | React 19 · TypeScript · Vite · npm |
| UI | Mantine + design tokens (`frontend/src/design/`) · Tailwind utilities |
| Server state | TanStack Query — products, health, conversations (list/detail + mutations) |
| API contracts | OpenAPI snapshot + generated Zod at HTTP/stream edges |
| AI-native UI | Vercel AI SDK (`@ai-sdk/react` `useChat`, data-stream protocol) |
| Routing | React Router 7 |
| Tests | Vitest · Testing Library · MSW · Playwright |
| Components | Storybook (co-located `*.stories.tsx`) |
| Lint / dead code | ESLint 9 · Knip |
| Auth | **Clerk intentionally omitted** — single-user demo, no multi-tenant tenants |

Client optimistic history uses `localStorage` (`…-conversations-v2`); remote sync goes through TanStack Query so reload and multi-tab UX stay coherent with the API. Backend conversation store is process-lifetime ([ADR-002](./docs/adr/002-ephemeral-conversation-store.md)).
