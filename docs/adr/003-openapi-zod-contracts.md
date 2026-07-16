# ADR-003: OpenAPI as contract source of truth + generated Zod schemas

## Status

Accepted

## Context

Frontend TypeScript DTOs were hand-duplicated from Pydantic models. Stream and HTTP edges used ad-hoc normalizers (`normalizeAnalysis`) that accepted snake_case aliases and invented defaults. Drift between backend wire shape and client types was invisible until runtime.

## Decision

1. **Pydantic / FastAPI OpenAPI** is the source of truth for API and stream data-part schemas.
2. `scripts/export_openapi.py` writes `contracts/openapi.json` (including injected stream data parts: `status`, `analysis`, `unsupported`).
3. `scripts/generate_zod_schemas.py` emits `frontend/src/contracts/generated/schemas.ts` used at HTTP and stream parse edges.
4. Root npm scripts: `contracts:export`, `contracts:generate`, `contracts:check`. Local `check` compares regenerated content to the previous files; GitHub Actions regenerates and runs `git diff --exit-code` on the committed outputs.
5. Do **not** hand-edit generated Zod. Do **not** generate a full HTTP client — schemas only.
6. Conversation `analysesById` is typed as `dict[str, AnalysisResult]` on the backend so OpenAPI and Zod validate nested analyses. `AnalysisResult.plan` is a nested `AnalysisPlan` (not an opaque map). Stream `unsupported` parts are `{ type: "unsupported" }` only.
7. FE feature types (`features/copilot/types/api.ts`) are thin aliases over generated shapes (`AnalysisResult['kpis'][number]`, etc.).

## Consequences

- Breaking `AnalysisResult` cleanups require regenerating contracts and bumping the client conversation storage key when the cached shape is incompatible (`pa-copilot-conversations-v2` today — see [ADR-002](./002-ephemeral-conversation-store.md)).
- `openapi-zod-client` was evaluated and rejected (tooling/ajv breakage); the Python emitter stays coupled to Pydantic imports so missing models fail generation.
- Soft-fail policy: Zod HTTP failures → existing `API_REQUEST_FAILED` / query error path; invalid stream analysis parts are ignored (no throw in UI).
- Knip ignores `src/contracts/generated/**`.

## How to regenerate

```bash
# From repo root (uses backend/.venv Python when present)
npm run contracts:generate
npm run contracts:check
```

Commit both:

- `contracts/openapi.json`
- `frontend/src/contracts/generated/schemas.ts`
