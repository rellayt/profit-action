# Frontend

React 19 · Vite · Mantine · TanStack Query · Vercel AI SDK (`@ai-sdk/react`) · Zod (generated contracts).

## Structure

```text
src/
├── contracts/generated/  Zod schemas from OpenAPI (do not hand-edit)
├── features/copilot/
│   ├── session/          providers, contexts/, public hooks, routes, store API
│   ├── hooks/session/    routing (skipHydrateFor), persistence, deferred apply, registry, store
│   ├── components/       workspace, insights, chart, catalog, ui
│   ├── api/              fetchJson, queryKeys, errorCopy + TanStack Query hooks (Zod at edges)
│   ├── types/            thin aliases over generated schemas (AnalysisResult, ConversationSummary, …)
│   ├── pages/            copilot, products, settings
│   └── lib/              pure helpers (chat, conversation, voice, analysis incl. analysisListCount)
├── design/               tokens + Mantine theme
└── main.tsx
test/
├── mocks/                MSW handlers + fixtures
└── renderWithProviders.tsx
e2e/                      Playwright smoke (demo, history, Ponów, catalog, settings)
```

Session model (see [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)):

- **App shell** → `ConversationNavProvider` (history on every route; one conversation store).
- **`/copilot*` only** → `CopilotWorkspaceProvider` (messages + composer + insights). Unmounts on Products/Settings.

Conversation durability: in-memory API store + optimistic `localStorage` (`pa-copilot-conversations-v2`) — [ADR-002](../docs/adr/002-ephemeral-conversation-store.md).

API contracts: [ADR-003](../docs/adr/003-openapi-zod-contracts.md). Regenerate from repo root with `npm run contracts:generate`.

## Scripts

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
npm run knip
npm run test                 # Vitest + Testing Library + MSW (includes session orchestration)
npm run storybook
npm run test:playwright      # e2e smoke
```

From repo root: `npm run ci` / `npm run ci:full` / `npm run contracts:*`.

Vite proxies `/api` and `/health` → `http://127.0.0.1:8000`.

## Server state

| Resource         | Hook                                             |
| ---------------- | ------------------------------------------------ |
| Products         | `useProductsQuery`                               |
| Health / Live AI | `useHealthQuery`                                 |
| Conversations    | `useConversationsQuery`, upsert/delete mutations |

Chat streaming stays on AI SDK `useChat` (not Query) — that matches the stream lifecycle. UI reads it through `useChatRuntime` / `useComposer` / `useInsights`, not a single god session context. Stream data parts and HTTP JSON are Zod-parsed; AI SDK `Message` shapes are mapped from wire `ConversationMessage` after parse.
