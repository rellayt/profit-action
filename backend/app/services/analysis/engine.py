"""Execute declarative AnalysisPlan on the classified product catalog."""

from __future__ import annotations

from functools import lru_cache
from uuid import uuid4

from app.constants import DEFAULT_PERIOD_DAYS
from app.models.analysis import (
    AggregationRow,
    AnalysisKpi,
    AnalysisPlan,
    AnalysisResult,
    AnalysisSummaryCounts,
    AnalysisTopProduct,
    GroupRow,
    MatchedProductRow,
)
from app.models.catalog import ClassifiedProduct
from app.services.analysis.aggregate import aggregate_rows, group_rows, sort_products
from app.services.analysis.filters import NUMERIC_ATTR, TEXT_ATTR, apply_filters
from app.services.analysis.present import (
    CHART_CAPTION,
    build_chart_points,
    filter_reason,
    list_kpis,
    template_answer,
)
from app.services.analysis.product_metrics import money_tuple
from app.services.analysis_store import get_analysis, put_analysis
from app.services.classify import classify_catalog
from app.services.repository import load_products


@lru_cache(maxsize=1)
def catalog_digest() -> str:
    products = load_products()
    categories = sorted({p.category for p in products})
    name_tokens: set[str] = set()
    for product in products:
        first_word = product.name.split()[0] if product.name else ""
        if first_word:
            name_tokens.add(first_word)
    sample = ", ".join(sorted(name_tokens)[:24])
    return (
        f"Catalog has {len(products)} products. "
        f"Categories: {', '.join(categories)}. "
        f"Sample name tokens: {sample}."
    )


def run_product_analysis(plan: AnalysisPlan) -> AnalysisResult:
    classified = list(classify_catalog())
    universe = list(classified)

    if plan.scope_analysis_id:
        prior = get_analysis(plan.scope_analysis_id)
        if prior is not None and prior.matched_product_ids:
            allowed = set(prior.matched_product_ids)
            universe = [p for p in classified if p.id in allowed]

    filtered = apply_filters(universe, plan)
    sorted_products = sort_products(filtered, plan)

    operation = plan.operation
    group_row_list: list[GroupRow] = []
    aggregations: list[AggregationRow] = []
    listed: list[ClassifiedProduct] = []

    if operation == "group":
        group_row_list = group_rows(sorted_products, plan)
    elif operation == "aggregate":
        aggregations = aggregate_rows(sorted_products, plan)
    else:
        limit = plan.limit if plan.limit is not None else 25
        listed = sorted_products[: max(0, min(limit, 100))]

    result_products = listed if operation == "list" else sorted_products
    matched_ids = [p.id for p in result_products]

    matched_rows: list[MatchedProductRow] = []
    for product in listed:
        spend, revenue, profit = money_tuple(product)
        matched_rows.append(
            MatchedProductRow(
                id=product.id,
                name=product.name,
                spend=spend,
                revenue=revenue,
                profit=profit,
                stock=product.stock,
                margin=product.margin_percent,
                segment=product.segment,
                matchReason=filter_reason(product, plan),
            )
        )

    top_source = listed if listed else sorted_products
    top = []
    for product in top_source[:3]:
        spend, revenue, profit = money_tuple(product)
        top.append(
            AnalysisTopProduct(
                id=product.id,
                name=product.name,
                spend=spend,
                revenue=revenue,
                profit=profit,
            )
        )

    if operation == "list":
        kpis = list_kpis(listed, len(universe))
    elif operation == "aggregate":
        kpis = [
            AnalysisKpi(
                key=f"{row.fn}_{row.field or 'n'}",
                label=row.label,
                value=row.value,
                format="currency" if row.field in {"spend", "revenue", "profit"} else "number",
            )
            for row in aggregations
        ]
    else:
        kpis = [
            AnalysisKpi(
                key="groups",
                label="Liczba grup",
                value=len(group_row_list),
                format="number",
            )
        ]

    has_numeric = any(f.field in NUMERIC_ATTR for f in plan.filters)
    show_chart = operation == "list" and (
        has_numeric or any(f.field == "segment" for f in plan.filters) or len(listed) >= 3
    )
    only_text = bool(plan.filters) and all(f.field in TEXT_ATTR for f in plan.filters)
    if only_text and len(listed) < 3:
        show_chart = False

    if operation == "list":
        show_cta = len(listed) >= 1
        summary_matched = len(listed)
    elif operation == "aggregate":
        show_cta = len(aggregations) >= 1
        summary_matched = len(sorted_products)
    else:
        show_cta = len(group_row_list) >= 1
        summary_matched = len(sorted_products)

    label = plan.criteria_summary or "Wynik analizy"
    result = AnalysisResult(
        analysisId=f"analysis_{uuid4().hex[:10]}",
        operation=operation,
        periodDays=DEFAULT_PERIOD_DAYS,
        answerText="",
        criteriaSummary=label,
        interpretationNote=plan.interpretation_note,
        showChart=show_chart,
        showCta=show_cta,
        plan=plan,
        summary=AnalysisSummaryCounts(
            productsAnalyzed=len(universe),
            matchedProducts=summary_matched,
        ),
        kpis=kpis,
        topProducts=top,
        matchedProductIds=matched_ids,
        matchedProducts=matched_rows if operation == "list" else [],
        groupRows=group_row_list,
        aggregations=aggregations,
        chartPoints=build_chart_points(listed) if show_chart else [],
        chartCaption=CHART_CAPTION if show_chart else "",
    )
    result.answer_text = template_answer(result)
    put_analysis(result)
    return result
