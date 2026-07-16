"""Segment each catalog product (stop_spending / rescue / scale / neutral).

Precedence (first matching branch wins after low-stock exclusion):
1. stock below min_stock_to_include → neutral (excluded)
2. no revenue with high spend AND not rescue → stop_spending
3. rescue candidate AND not scale → rescue
4. scale candidate → scale
5. else → neutral

Analysis plans are executed in ``app.services.analysis`` on this classified catalog.
"""

from dataclasses import dataclass
from functools import lru_cache

from app.models.catalog import ClassifiedProduct, ProductRecord, ProductSegment
from app.services.metrics import calculate_profit
from app.services.repository import load_products


@dataclass(frozen=True)
class ClassificationThresholds:
    min_ad_spend_for_stop: float = 120
    min_margin_for_rescue: float = 25
    min_stock_for_rescue: int = 20
    min_add_to_cart_rate_for_rescue: float = 4
    max_conversion_rate_for_rescue: float = 1.2
    min_impressions_for_rescue: int = 800
    min_margin_for_scale: float = 30
    min_conversion_rate_for_scale: float = 1.5
    min_stock_for_scale: int = 15
    max_relative_ad_share_for_scale: float = 0.35
    min_stock_to_include: int = 5


DEFAULT_THRESHOLDS = ClassificationThresholds()


def _with_profit(product: ProductRecord) -> ProductRecord:
    return product.model_copy(update={"profit": calculate_profit(product)})


def _median(values: list[float]) -> float:
    if not values:
        return 0.0
    sorted_values = sorted(values)
    mid = len(sorted_values) // 2
    if len(sorted_values) % 2 == 0:
        return (sorted_values[mid - 1] + sorted_values[mid]) / 2
    return sorted_values[mid]


def classify_product(
    product: ProductRecord,
    median_ad_spend: float,
    thresholds: ClassificationThresholds = DEFAULT_THRESHOLDS,
) -> ClassifiedProduct:
    product = _with_profit(product)
    base = product.model_dump(by_alias=True)

    if product.stock < thresholds.min_stock_to_include:
        return ClassifiedProduct(
            **base,
            segment="neutral",
            recommendation="Wykluczono: zbyt niski stan magazynowy do wiarygodnej rekomendacji.",
            evidence=[f"Stan magazynowy: {product.stock} szt."],
        )

    no_revenue_with_spend = (
        product.google_ads_spend >= thresholds.min_ad_spend_for_stop and product.net_revenue <= 0
    )
    rescue_candidate = (
        (
            product.impressions >= thresholds.min_impressions_for_rescue
            or product.add_to_cart_rate >= thresholds.min_add_to_cart_rate_for_rescue
        )
        and product.margin_percent >= thresholds.min_margin_for_rescue
        and product.stock >= thresholds.min_stock_for_rescue
        and product.conversion_rate <= thresholds.max_conversion_rate_for_rescue
    )
    scale_candidate = (
        product.margin_percent >= thresholds.min_margin_for_scale
        and product.conversion_rate >= thresholds.min_conversion_rate_for_scale
        and product.stock >= thresholds.min_stock_for_scale
        and product.google_ads_spend <= median_ad_spend * thresholds.max_relative_ad_share_for_scale
    )

    segment: ProductSegment = "neutral"
    recommendation = "Brak skupionego działania w tym oknie. Monitoruj trend przez kolejne 7 dni."
    evidence = [
        f"Wydatki Google Ads: {product.google_ads_spend:.0f} PLN",
        f"Przychód netto: {product.net_revenue:.0f} PLN",
        f"Marża: {product.margin_percent}%",
        f"Wskaźnik dodania do koszyka: {product.add_to_cart_rate}%",
        f"Stan magazynowy: {product.stock} szt.",
    ]

    if no_revenue_with_spend and not rescue_candidate:
        segment = "stop_spending"
        recommendation = "Wysokie wydatki reklamowe bez odnotowanego przychodu."
    elif rescue_candidate and not scale_candidate:
        segment = "rescue"
        recommendation = (
            "Zainteresowanie klientów wygląda zdrowo, ale konwersja zakupowa pozostaje słaba."
        )
    elif scale_candidate:
        segment = "scale"
        recommendation = (
            "Dodatni zysk, dostępny stan magazynowy i relatywnie niski spend reklamowy."
        )

    return ClassifiedProduct(
        **base,
        segment=segment,
        recommendation=recommendation,
        evidence=evidence,
    )


def classify_products(
    products: list[ProductRecord] | None = None,
    thresholds: ClassificationThresholds = DEFAULT_THRESHOLDS,
) -> list[ClassifiedProduct]:
    source = products if products is not None else load_products()
    median_ad_spend = _median([product.google_ads_spend for product in source])
    return [classify_product(product, median_ad_spend, thresholds) for product in source]


@lru_cache(maxsize=1)
def classify_catalog() -> tuple[ClassifiedProduct, ...]:
    """Cached classification of the process-lifetime products.json catalog."""
    return tuple(classify_products())


def segment_counts(classified: list[ClassifiedProduct]) -> dict[str, int]:
    counts = {
        "all": len(classified),
        "stop_spending": 0,
        "rescue": 0,
        "scale": 0,
        "neutral": 0,
    }
    for product in classified:
        counts[product.segment] = counts.get(product.segment, 0) + 1
    return counts
