# Profit Action — Application Guide

**Revision:** 19 · **Scope:** conversational product analytics with tool-calling analysis  
**Audience:** AI agents and humans implementing or reviewing the UI.

This document is the **single source of truth** for product behaviour. Do not create a second guide.

**UI language:** Polish product copy. Docs stay English.

---

## 1. Product purpose

Ask free-form questions about ~100 synthetic products. OpenAI plans an analysis tool call; FastAPI filters/aggregates deterministically; OpenAI narrates only those facts. A conditional **Zobacz analizę** button opens a snapshot modal for that turn.

**Out of scope:** feed/approve, Vercel AI Gateway, inventing KPIs/IDs in the model, auth, durable DB.

---

## 2. Modes

| Badge | Condition |
|-------|-----------|
| **Live AI** | `OPENAI_API_KEY` set and `DEMO_MODE=false` |
| **Tryb demo** | `DEMO_MODE=true` (forces local) or missing key |

No Vercel API key. AI SDK is frontend-only (`useChat`).

---

## 3. Live analysis loop

1. Status `Analizuję dane produktów…`
2. OpenAI may call `analyze_products` with `AnalysisPlan`
3. FastAPI runs filters / aggregate / group (optional `scopeAnalysisId`) on `classify_catalog()`
4. Tool facts return to OpenAI → streamed natural PL answer
5. Optional `2: analysis` payload for the modal CTA

Demo uses local heuristics (exact starter-chip strings first) + template answers; same analysis payload shape.

---

## 4. AnalysisPlan (tool)

- `operation`: `list | aggregate | group`
- `scopeAnalysisId`: restrict to prior matched set
- `filterLogic`: `and | or`
- filters: numeric (`spend|revenue|profit|margin|stock`) or text `contains` (`name|brand|category|sku`) or `segment`
- `aggregations`, `groupBy`, `sort`, `limit`, `criteriaSummary`, `interpretationNote`

Field registry (margin = percent 0–100) is injected into the system prompt with a catalog digest.

---

## 5. Copilot UI

- Empty chips: ujemny zysk / marża &lt; 20% (backend exact-matches the same PL strings)
- **One CTA** under an assistant turn, only if `showCta` (list with N≥1, or aggregate/group with results)
- CTA opens **that turn’s** `analysisId` snapshot — never the latest global analysis
- Chat answers stay short (count + up to 3 names); full table/chart live in the modal. Assistant text supports light markdown.
- Modal: criteria (`criteriaSummary` only in the title), KPIs / aggregations / groups, optional chart, matched table
- **`/copilot`** always opens a blank draft (Copilot nav active). First send creates a conversation with a short id (`c_…`), navigates to `/copilot/c/:id` with `location.state.skipHydrateFor`, deactivates Copilot nav, and activates the new history item.
- **Session ownership:** `ConversationNavProvider` wraps the app shell (history + nav actions on every route). `CopilotWorkspaceProvider` mounts only under `/copilot` and `/copilot/c/:id` and exposes `useChatRuntime` (messages/stream), `useComposer`, and `useInsights`. Products/Settings do not keep an active chat stream.
- **Historia** in the left sidebar (card below a divider). Hidden when empty; single-line titles with ellipsis; delete via labeled action (keyboard/focus) or right-click → **Usuń** (localStorage + `DELETE /api/conversations/:id`). Active nav items ignore clicks (`pointer-events: none`).
- Switching history items loads details via `GET /api/conversations/:id` with optimistic `localStorage` (`pa-copilot-conversations-v2`); analyses stay in that conversation snapshot. Backend store is process-lifetime — see [ADR-002](./adr/002-ephemeral-conversation-store.md).
- Brand mark / Copilot nav **start new**: from a conversation route → navigate to `/copilot` (workspace resets via routing); already on draft → bump draft reset so composer/chat clear without remounting the shell.
- On stream/API failure (`status === error`): the failed **user** bubble is muted/grayed with inline **Analiza niedostępna** + **Ponów**. No top-level failure banner for chat errors.
- HTTP and stream payloads are Zod-validated at the client edge ([ADR-003](./adr/003-openapi-zod-contracts.md)). Invalid analysis parts soft-fail (ignored); failed HTTP parse surfaces as the existing API error path.

---

## 6. Products

Independent full catalog. **No segment filter tabs.** **No period query** on `GET /api/products` (windowing is `AnalysisResult.periodDays` in insights). Search max-width 300px. Segment column / badges are passive metadata (labels such as „Wstrzymaj wydatki” may appear in the table — that is not a tab).

---

## 7. Stream contract

| Part | Meaning |
|------|---------|
| `0:` | Assistant prose |
| `2:` `status` | Progress |
| `2:` `analysis` | Snapshot (`showCta`, `matchedProducts`, …) — camelCase wire |
| `2:` `unsupported` | Demo fallback only — payload is `{ type: "unsupported" }` (no intent/confidence fields) |
| `d:` | Finish |

`AnalysisResult` is slim: no `intent`, `intentLabel`, `confidence`, `minimumStock`, `segments`, or `totalSpendWithoutRevenue` on the analysis DTO. Nested `plan` is a typed `AnalysisPlan` (not an opaque map).

---

## 8. Responsiveness

No mandatory 1s typing delay. No character-by-character backend delay. Stream in chunks; show status immediately.

---

## Changelog

| Rev | Notes |
|-----|-------|
| 19 | Drop always-null `totalSpendWithoutRevenue`; `ChatStatus` typed end-to-end; sync errors logged; README plan-based wording; stricter Ruff |
| 18 | Slim `unsupported` part; typed `AnalysisPlan` on wire; FE naming (queryKeys, errorCopy, catalogProductFilters, analysisListCount); health model/router extract; no `period` on `GET /api/products` |
| 17 | Docs catch-up: E2E coverage (history/Ponów/catalog/settings), latest-ref session pattern, Historia vs API list merge |
| 16 | Contracts/Zod edges; storage v2; skipHydrateFor; slim AnalysisResult; classify_catalog; no segment tabs clarification |
| 15 | Session split: ConversationNav vs CopilotWorkspace; ADR-002 link; draft reset / route-scoped chat |
| 14 | History polish, short URL ids, delete, CTA open fix |
| 13 | Fix CTA binding race; short answers; chat markdown |
| 12 | Sidebar conversation history; draft `/copilot`; GET details from backend |
| 11 | Architecture clarity: classify=segments only; FE chart/insights/workspace; voice helpers |
| 10 | Failed turn: muted user bubble + Ponów replay |
| 9 | Tool-calling analysis, scope follow-ups, per-turn CTA, history rail, Products catalog-only |
| 8 | Polish UI |
| 7 | Read-only analytics rewrite |
