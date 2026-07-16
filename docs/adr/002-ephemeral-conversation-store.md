# ADR-002: Ephemeral conversation store + client cache

## Status

Accepted

## Context

The demo keeps conversation history for a single-user local session. A durable database would overstate production readiness without improving the core learning signal (LLM plans, Python owns numbers).

## Decision

1. Backend conversation and analysis stores are **in-memory** and live only for the API process lifetime (restart clears them).
2. The frontend keeps an optimistic **`localStorage` cache** for list/detail UX across reloads while the browser tab/profile remains.
3. That cache **may outlive** an API restart — intentional demo trade-off, not a consistency bug to “fix” with wipe banners or CRDTs.
4. Auth, multi-tenant ownership, and Dockerized durable storage stay out of scope for this demo.

## Consequences

- Multi-tab / reload against a live API still merge via TanStack Query + local cache as today.
- **Merge policy (demo-grade, intentional):** remote messages win when non-empty; otherwise keep local. Per-analysis id, prefer the richer snapshot (`matchedProducts` / ids / chartPoints / `showCta`). Not multi-device sync. Named unit tests describe these rules; do not “fix” richness in product PRs without an explicit decision.
- Client conversation cache key is versioned (`pa-copilot-conversations-v2`). Breaking AnalysisResult contract bumps the key (no migration of stale shapes / no copy from `…-v1`).
- First draft submit navigates with `location.state.skipHydrateFor` so the route hydrate effect does not clobber the optimistic turn (see [ARCHITECTURE.md](../ARCHITECTURE.md)).
- Frontend mounts chat only under `/copilot*` (`CopilotWorkspaceProvider`); history/nav stays in the app shell (`ConversationNavProvider`).
- Interview narrative: ephemeral server store by product choice; client cache for demo UX.
- Follow-up work in a real product would introduce durable storage and auth before hardening sync semantics.
