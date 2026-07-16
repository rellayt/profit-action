from __future__ import annotations

from app.models.analysis import (
    AnalysisKpi,
    AnalysisPlan,
    AnalysisResult,
    ChartPoint,
)
from app.models.catalog import ClassifiedProduct
from app.services.analysis.filters import match_filter
from app.services.analysis.product_metrics import money_tuple, sum_spend_profit

CHART_CAPTION = "Każda kropka to dopasowany produkt. Kliknij, aby zobaczyć dowody."


def filter_reason(product: ClassifiedProduct, plan: AnalysisPlan) -> str:
    parts: list[str] = []
    for plan_filter in plan.filters:
        if match_filter(product, plan_filter):
            parts.append(f"{plan_filter.field} {plan_filter.operator} {plan_filter.value}")
    if plan.scope_analysis_id:
        parts.append("w zakresie poprzedniej analizy")
    return "; ".join(parts) if parts else "dopasowano do planu"


def list_kpis(matched: list[ClassifiedProduct], analyzed: int) -> list[AnalysisKpi]:
    spend, profit = sum_spend_profit(matched)
    return [
        AnalysisKpi(
            key="matched",
            label="Dopasowane produkty",
            value=len(matched),
            format="number",
        ),
        AnalysisKpi(
            key="spend",
            label="Suma wydatków",
            value=round(spend, 2),
            format="currency",
        ),
        AnalysisKpi(
            key="profit",
            label="Suma zysku",
            value=round(profit, 2),
            format="currency",
        ),
        AnalysisKpi(
            key="analyzed",
            label="Produkty w zakresie",
            value=analyzed,
            format="number",
        ),
    ]


def build_chart_points(classified: list[ClassifiedProduct]) -> list[ChartPoint]:
    points: list[ChartPoint] = []
    for product in classified:
        spend, revenue, profit = money_tuple(product)
        points.append(
            ChartPoint(
                productId=product.id,
                name=product.name,
                spend=spend,
                revenue=revenue,
                profit=profit,
                stock=product.stock,
                segment=product.segment,
                recommendation=product.recommendation,
            )
        )
    return points


def template_answer(result: AnalysisResult) -> str:
    note = f" {result.interpretation_note}" if result.interpretation_note else ""
    if result.operation == "aggregate":
        parts = ", ".join(f"**{row.label}**: {row.value}" for row in result.aggregations)
        return f"{result.criteria_summary or 'Agregacja'}.{note}\n\n{parts}"
    if result.operation == "group":
        top = ", ".join(f"`{row.key}` ({row.count})" for row in result.group_rows[:5])
        return (
            f"{result.criteria_summary or 'Grupowanie'}.{note}\n\n"
            f"Największe grupy: {top or 'brak'}."
        )
    n = result.summary.matched_products
    if n == 0:
        return (
            f"{result.criteria_summary or 'Analiza'}.{note} "
            f"Nie znaleziono produktów spełniających te warunki."
        )
    names = ", ".join(f"**{item.name}**" for item in result.top_products[:3])
    cta_hint = " Szczegóły, wykres i pełna lista są pod przyciskiem **Zobacz analizę**."
    return (
        f"{result.criteria_summary or 'Analiza'}.{note} "
        f"Dopasowano **{n}** produktów."
        + (f" Wśród nich: {names}." if names else "")
        + (cta_hint if result.show_cta else "")
    )
