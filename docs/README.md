# Documentation

| Doc | Role |
|-----|------|
| [LOCAL-RUN.md](./LOCAL-RUN.md) | Setup, reload, Live AI env, tests |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System boundaries, contracts, session |
| [APPLICATION-GUIDE.md](./APPLICATION-GUIDE.md) | UI contracts and flows (source of truth for agents) |
| [BACKEND-API.md](./BACKEND-API.md) | HTTP surface and stream parts |
| [DATA.md](./DATA.md) | Synthetic catalog, generator, segments |
| [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) | Tokens, surfaces, chart colors |
| [adr/001-deterministic-analysis-engine.md](./adr/001-deterministic-analysis-engine.md) | Why Python owns numbers |
| [adr/002-ephemeral-conversation-store.md](./adr/002-ephemeral-conversation-store.md) | In-memory API store + localStorage v2 |
| [adr/003-openapi-zod-contracts.md](./adr/003-openapi-zod-contracts.md) | OpenAPI SoT + generated Zod schemas |

Committed contract artifacts (not prose docs):

| Path | Role |
|------|------|
| [`contracts/openapi.json`](../contracts/openapi.json) | Exported OpenAPI snapshot |
| [`frontend/src/contracts/generated/schemas.ts`](../frontend/src/contracts/generated/schemas.ts) | Generated Zod (do not hand-edit) |

Storybook (component gallery):

```bash
cd frontend && npm run storybook
```
