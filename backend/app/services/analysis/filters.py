from __future__ import annotations

from app.models.analysis import AnalysisPlan, PlanFilter
from app.models.catalog import ClassifiedProduct

NUMERIC_ATTR = {
    "spend": "google_ads_spend",
    "revenue": "net_revenue",
    "profit": "profit",
    "margin": "margin_percent",
    "stock": "stock",
}

TEXT_ATTR = {
    "name": "name",
    "brand": "brand",
    "category": "category",
    "sku": "sku",
}


def _as_float(value: object) -> float | None:
    if isinstance(value, bool):
        return float(value)
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        try:
            return float(value)
        except ValueError:
            return None
    return None


def _coerce_margin_value(field: str, value: object) -> object:
    if field != "margin":
        return value
    number = _as_float(value)
    if number is None:
        return value
    if 0 < number <= 1:
        return number * 100
    return number


def numeric_value(product: ClassifiedProduct, field: str) -> float:
    attr = NUMERIC_ATTR[field]
    return float(getattr(product, attr))


def _text_value(product: ClassifiedProduct, field: str) -> str:
    return str(getattr(product, TEXT_ATTR[field])).lower()


def match_filter(product: ClassifiedProduct, plan_filter: PlanFilter) -> bool:
    field = plan_filter.field
    op = plan_filter.operator
    raw = plan_filter.value

    if field == "segment":
        target = str(raw).lower()
        if op in {"eq", "contains"}:
            return product.segment == target or target in product.segment
        return False

    if field in TEXT_ATTR:
        if op != "contains":
            return False
        return str(raw).lower() in _text_value(product, field)

    if field not in NUMERIC_ATTR:
        return False

    threshold = _as_float(_coerce_margin_value(field, raw))
    if threshold is None:
        return False
    actual = numeric_value(product, field)
    if op == "lt":
        return actual < threshold
    if op == "lte":
        return actual <= threshold
    if op == "gt":
        return actual > threshold
    if op == "gte":
        return actual >= threshold
    if op == "eq":
        return abs(actual - threshold) < 1e-9
    return False


def apply_filters(
    products: list[ClassifiedProduct],
    plan: AnalysisPlan,
) -> list[ClassifiedProduct]:
    if not plan.filters:
        return list(products)

    matched: list[ClassifiedProduct] = []
    for product in products:
        flags = [match_filter(product, plan_filter) for plan_filter in plan.filters]
        ok = all(flags) if plan.filter_logic == "and" else any(flags)
        if ok:
            matched.append(product)
    return matched
