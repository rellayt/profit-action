# Contributing

## Setup

Follow [docs/LOCAL-RUN.md](./docs/LOCAL-RUN.md). Use Node.js 22 and Python 3.12+.

## Checks

From the repo root:

```bash
npm run ci
```

That runs backend Ruff + pytest, contracts drift check, frontend ESLint, Knip, TypeScript, and Vitest (parity with GitHub Actions unit jobs).

```bash
npm run ci:full   # ci + Playwright smoke
npm run test:e2e  # Playwright only (starts backend + frontend)
```

After changing Pydantic models or stream data parts:

```bash
npm run contracts:generate   # refresh contracts/openapi.json + Zod schemas
npm run contracts:check      # CI gate — fails on drift
```

Commit both `contracts/openapi.json` and `frontend/src/contracts/generated/schemas.ts` with the model change.

Optional local Storybook:

```bash
cd frontend && npm run storybook
```

## Conventions

- Prefer small, focused PRs.
- Keep product UI copy and analysis answers in Polish; keep repo docs in English.
- Do not invent KPIs or catalog numbers in the LLM path — Python `classify` + `analysis` engine own the math.
- Do not hand-edit `frontend/src/contracts/generated/` — regenerate from Pydantic ([ADR-003](./docs/adr/003-openapi-zod-contracts.md)).
- Thin FE type aliases live in `features/copilot/types/` (indexed from generated schemas); do not re-hand-duplicate wire DTOs.
- Co-locate Storybook stories next to components (`*.stories.tsx`).
- Update [docs/APPLICATION-GUIDE.md](./docs/APPLICATION-GUIDE.md) when UI contracts change.
- Frontend session: keep **ConversationNav** (shell) and **CopilotWorkspace** (`/copilot*` only) separate — compose root wires named hooks in `hooks/session/*` (no god bag of state). Composer context is separate from messages/stream so keystrokes do not re-render the transcript. Persistence semantics: [ADR-002](./docs/adr/002-ephemeral-conversation-store.md).
- Offline-first conversation sync: UI keeps working when the API is down; log sync failures with `discardUnavailableBackendError` (do not toast for every offline write in this demo).
- Wire/domain literals (`user`/`assistant`, chat status, stream part types, catalog match-reason fallback) live as `as const` in `lib/chat/*` and `lib/analysis/matchReasons` — do not scatter raw role/status strings in production logic. Prefer the `ChatStatus` type over bare `string`.
- Name files by role: `queryKeys`, `errorCopy`, `catalogProductFilters`, `analysisListCount`, `discardUnavailableBackendError` — avoid misleading names (`messages` for error strings, `Query` for pure filter/sort).
- Accessibility: labeled composer, polite live region for stream/voice/typing, keyboard delete in history, keyboard-selectable catalog/matched rows; `eslint-plugin-jsx-a11y` in CI. Scatter stays pointer-first — tables are the accessible path into evidence.
- Prefer orchestration/edge tests under `frontend/src/features/copilot/session/` when changing routing, persistence, or draft/conversation switches. Do not duplicate those races in Playwright.
- Playwright is browser smoke only (`frontend/e2e/`): demo CTA, history roundtrip/delete, Ponów recovery, catalog drawer, settings. Keep the suite small; run with one worker (shared in-memory backend). Helpers wipe API conversations + `localStorage` between tests.
- Session effects that must not re-run on callback identity use a **latest-ref** pattern (`useConversationRouting` / `useConversationPersistence`) — prefer that over `eslint-disable` for `exhaustive-deps`.
- Prefer `RefObject` over deprecated `MutableRefObject` (React 19 types).
