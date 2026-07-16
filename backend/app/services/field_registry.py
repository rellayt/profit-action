"""Catalog field registry for prompts — meta keyed by PlanField Literals."""

from __future__ import annotations

from dataclasses import dataclass
from typing import get_args

from app.models.analysis import PlanField


@dataclass(frozen=True)
class FieldMeta:
    unit: str
    blurb: str


FIELD_META: dict[PlanField, FieldMeta] = {
    "spend": FieldMeta("PLN", 'Google Ads cost → filter field "spend"'),
    "revenue": FieldMeta("PLN", 'net attributed revenue → "revenue"'),
    "profit": FieldMeta("PLN", 'revenue * margin/100 - spend → "profit"'),
    "margin": FieldMeta("percent 0–100", 'commercial margin → "margin" (never use 0.1 for 10%)'),
    "stock": FieldMeta("units", 'available inventory → "stock"'),
    "name": FieldMeta("text", 'product name → operator "contains"'),
    "brand": FieldMeta("text", 'brand → operator "contains"'),
    "category": FieldMeta("text", 'category → operator "contains"'),
    "sku": FieldMeta("text", 'SKU → operator "contains"'),
    "segment": FieldMeta(
        "enum",
        "optional classify preset: stop_spending | rescue | scale | neutral",
    ),
}


def field_registry_prompt() -> str:
    lines = [
        "Available product fields (synthetic 30-day catalog, ~100 products):",
    ]
    for field in get_args(PlanField):
        meta = FIELD_META[field]
        lines.append(f"- {field} ({meta.unit}): {meta.blurb}")
    lines.extend(
        [
            "",
            "You cannot answer about returns, ROAS, CPL, or any field not listed. "
            "Say so clearly in Polish.",
            'Default: "best performing" / "najlepiej się spisują" = highest profit; '
            "state that interpretation.",
        ]
    )
    return "\n".join(lines)
