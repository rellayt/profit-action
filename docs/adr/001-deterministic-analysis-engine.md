# ADR-001: Deterministic analysis engine owns numbers

## Status

Accepted

## Context

The product answers natural-language questions about a synthetic catalog and must show verifiable KPIs, chart points, and matched product IDs. An LLM can plan *what* to ask of the catalog, but inventing spend/profit/IDs would break trust and make the demo non-deterministic.

## Decision

1. OpenAI (Live) or local heuristics (Demo) produce a declarative `AnalysisPlan` only.
2. Python `services/analysis` executes the plan on the classified catalog and builds `AnalysisResult` (KPIs, tables, chartPoints, CTA flags).
3. The model may narrate from a constrained tool payload; it must not invent catalog numbers or product IDs.
4. Soft-fail Live paths still emit the analysis data part when the engine already ran.

## Consequences

- Segment labels live in `classify.py` (`classify_catalog()` cached); plan execution stays separate in `services/analysis`.
- Tool JSON enums are generated from Pydantic Literals (`plan_tool_schema.py`) and locked by `test_plan_schema_sync`.
- Frontend validates streamed/HTTP analysis with generated Zod ([ADR-003](./003-openapi-zod-contracts.md)) but treats backend numbers as authoritative — invalid parts soft-fail.
- Field prompt prose is keyed by `PlanField` in `field_registry.FIELD_META` (coverage test).
