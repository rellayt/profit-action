from __future__ import annotations

from app.models.analysis import AggregationRow, AnalysisPlan, GroupRow
from app.models.catalog import ClassifiedProduct
from app.services.analysis.filters import NUMERIC_ATTR, numeric_value
from app.services.analysis.product_metrics import sum_money


def sort_products(
    products: list[ClassifiedProduct],
    plan: AnalysisPlan,
) -> list[ClassifiedProduct]:
    if not plan.sort:
        return products
    field = plan.sort.field
    reverse = plan.sort.direction != "asc"
    return sorted(
        products,
        key=lambda item: numeric_value(item, field),
        reverse=reverse,
    )


def aggregate_rows(
    products: list[ClassifiedProduct],
    plan: AnalysisPlan,
) -> list[AggregationRow]:
    rows: list[AggregationRow] = []
    if not plan.aggregations:
        rows.append(
            AggregationRow(
                fn="count",
                field=None,
                value=len(products),
                label="Liczba produktów",
            )
        )
        return rows

    for agg in plan.aggregations:
        if agg.fn == "count":
            rows.append(
                AggregationRow(
                    fn="count",
                    field=None,
                    value=len(products),
                    label="Liczba produktów",
                )
            )
            continue
        if not agg.field or agg.field not in NUMERIC_ATTR:
            continue
        values = [numeric_value(p, agg.field) for p in products]
        if not values:
            value: float | int = 0
        elif agg.fn == "sum":
            value = round(sum(values), 2)
        elif agg.fn == "avg":
            value = round(sum(values) / len(values), 2)
        elif agg.fn == "min":
            value = round(min(values), 2)
        else:
            value = round(max(values), 2)
        label_map = {
            "sum": "Suma",
            "avg": "Średnia",
            "min": "Minimum",
            "max": "Maksimum",
        }
        field_pl = {
            "spend": "wydatków",
            "revenue": "przychodu",
            "profit": "zysku",
            "margin": "marży",
            "stock": "stanu",
        }
        rows.append(
            AggregationRow(
                fn=agg.fn,
                field=agg.field,
                value=value,
                label=f"{label_map.get(agg.fn, agg.fn)} {field_pl.get(agg.field, agg.field)}",
            )
        )
    return rows


def group_rows(
    products: list[ClassifiedProduct],
    plan: AnalysisPlan,
) -> list[GroupRow]:
    key_field = plan.group_by or "category"
    buckets: dict[str, list[ClassifiedProduct]] = {}
    for product in products:
        if key_field == "segment":
            key = product.segment
        elif key_field == "brand":
            key = product.brand
        else:
            key = product.category
        buckets.setdefault(key, []).append(product)

    rows: list[GroupRow] = []
    for key, items in buckets.items():
        spend, revenue, profit = sum_money(items)
        avg_margin = sum(p.margin_percent for p in items) / len(items) if items else 0.0
        rows.append(
            GroupRow(
                key=key,
                count=len(items),
                spend=round(spend, 2),
                revenue=round(revenue, 2),
                profit=round(profit, 2),
                avgMargin=round(avg_margin, 1),
            )
        )
    rows.sort(key=lambda row: row.profit, reverse=True)
    return rows
