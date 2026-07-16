"""Local heuristics for DEMO_MODE — weaker than Live tool calling."""

from __future__ import annotations

import re

from app.models.analysis import AnalysisPlan, PlanAggregation, PlanFilter, PlanSort
from app.services.analysis import run_product_analysis

FALLBACK_ANSWER = (
    "Nie udało mi się połączyć tego pytania z dostępnymi analizami produktów. "
    "Spróbuj zapytać, które produkty przepalają budżet, wymagają ratunku albo są gotowe do skalowania."
)

# Keep in sync with frontend STARTER_QUERY_CHIPS (copilotConstants.ts).
STARTER_CHIP_PLANS: dict[str, AnalysisPlan] = {
    "Które produkty mają ujemny zysk?": AnalysisPlan(
        operation="list",
        filters=[PlanFilter(field="profit", operator="lt", value=0)],
        sort=PlanSort(field="profit", direction="asc"),
        criteriaSummary="Produkty z ujemnym zyskiem",
        limit=50,
    ),
    "Które produkty mają marżę poniżej 20%?": AnalysisPlan(
        operation="list",
        filters=[PlanFilter(field="margin", operator="lt", value=20)],
        sort=PlanSort(field="margin", direction="asc"),
        criteriaSummary="Marża poniżej 20%",
        limit=50,
    ),
}


def parse_demo_plan(question: str) -> AnalysisPlan | None:
    """Map a demo question to an AnalysisPlan.

    Rule order is intentional and locked by tests (including starter chips).
    Exact starter-chip strings are matched first; fuzzy heuristics follow.
    More specific category-group phrasing is checked *after* generic “najlepiej”
    top-profit — do not reorder without updating tests and chip expectations.
    """
    stripped = question.strip()
    if not stripped:
        return None

    chip_plan = STARTER_CHIP_PLANS.get(stripped)
    if chip_plan is not None:
        return chip_plan

    normalized = re.sub(r"\s+", " ", stripped.lower())

    if any(token in normalized for token in ("samochod", "auto ", "autach", "cars")):
        return AnalysisPlan(
            operation="list",
            filters=[PlanFilter(field="name", operator="contains", value="samochód")],
            criteriaSummary="Szukanie samochodów w katalogu",
            limit=25,
        )

    if "monitor" in normalized:
        return AnalysisPlan(
            operation="list",
            filters=[PlanFilter(field="name", operator="contains", value="Monitor")],
            criteriaSummary="Produkty związane z monitorem",
            limit=25,
        )

    if any(
        token in normalized
        for token in ("ujemn", "negative profit", "profit < 0", "zysk poniżej 0")
    ):
        return AnalysisPlan(
            operation="list",
            filters=[PlanFilter(field="profit", operator="lt", value=0)],
            sort=PlanSort(field="profit", direction="asc"),
            criteriaSummary="Produkty z ujemnym zyskiem",
            limit=50,
        )

    if "marż" in normalized or "margin" in normalized:
        if "20" in normalized or "poniżej" in normalized or "below" in normalized:
            return AnalysisPlan(
                operation="list",
                filters=[PlanFilter(field="margin", operator="lt", value=20)],
                sort=PlanSort(field="margin", direction="asc"),
                criteriaSummary="Marża poniżej 20%",
                limit=50,
            )

    if any(
        token in normalized
        for token in ("przepal", "wasting", "bez przychod", "stop spending", "budżet reklam")
    ):
        return AnalysisPlan(
            operation="list",
            filters=[PlanFilter(field="segment", operator="eq", value="stop_spending")],
            sort=PlanSort(field="spend", direction="desc"),
            criteriaSummary="Produkty przepalające budżet reklamowy",
            limit=50,
        )

    if "skalowa" in normalized or "scale" in normalized or "skaluj" in normalized:
        filters = [PlanFilter(field="segment", operator="eq", value="scale")]
        if any(
            token in normalized
            for token in ("niski stan", "niskiego stanu", "low stock", "stanu magazyn")
        ):
            filters.append(PlanFilter(field="stock", operator="gte", value=20))
        return AnalysisPlan(
            operation="list",
            filters=filters,
            filterLogic="and",
            sort=PlanSort(field="profit", direction="desc"),
            criteriaSummary="Produkty gotowe do skalowania",
            limit=50,
        )

    if "ratunk" in normalized or "rescue" in normalized or "ratuj" in normalized:
        return AnalysisPlan(
            operation="list",
            filters=[PlanFilter(field="segment", operator="eq", value="rescue")],
            criteriaSummary="Produkty wymagające ratunku",
            limit=50,
        )

    if any(
        token in normalized for token in ("najlepiej", "best perform", "top produkt", "spisują")
    ):
        return AnalysisPlan(
            operation="list",
            filters=[],
            sort=PlanSort(field="profit", direction="desc"),
            limit=10,
            criteriaSummary="Produkty z najwyższym zyskiem",
            interpretationNote="„Najlepiej” = najwyższy zysk (okres 30 dni).",
        )

    if "kategori" in normalized and (
        "najlepiej" in normalized or "best" in normalized or "wypada" in normalized
    ):
        return AnalysisPlan(
            operation="group",
            groupBy="category",
            criteriaSummary="Kategorie według sumy zysku",
        )

    if any(
        token in normalized
        for token in ("łącznie wyd", "ile wydali", "suma wydat", "total spend", "sum spend")
    ):
        return AnalysisPlan(
            operation="aggregate",
            aggregations=[PlanAggregation(fn="sum", field="spend")],
            criteriaSummary="Suma wydatków reklamowych",
        )

    return None


def run_demo_question(question: str):
    plan = parse_demo_plan(question)
    if plan is None:
        return None, FALLBACK_ANSWER
    result = run_product_analysis(plan)
    return result, result.answer_text
