from app.models.catalog import ProductRecord
from app.services.classify import (
    ClassificationThresholds,
    classify_catalog,
    classify_product,
    classify_products,
    segment_counts,
)
from app.services.metrics import calculate_profit
from app.services.repository import load_products

_FRESHNESS = [
    {"source": "ga4", "label": "GA4", "updatedAt": "2026-07-15T02:10:00+02:00"},
]


def _record(**overrides: object) -> ProductRecord:
    base = {
        "id": "t-1",
        "sku": "SKU-T",
        "name": "Test Product",
        "brand": "Brand",
        "category": "Elektronika",
        "googleAdsSpend": 200,
        "netRevenue": 0,
        "marginPercent": 30,
        "addToCartRate": 5.0,
        "conversionRate": 0.5,
        "impressions": 1000,
        "stock": 40,
        "profit": 0,
        "freshness": _FRESHNESS,
    }
    base.update(overrides)
    return ProductRecord.model_validate(base)


def test_stop_spending_classification():
    products = load_products()
    product = next(item for item in products if item.id == "p-002")
    result = classify_product(product, 250.0)
    assert result.segment == "stop_spending"


def test_low_stock_is_neutral():
    products = load_products()
    product = next(item for item in products if item.id == "p-003")
    result = classify_product(product, 250.0)
    assert result.segment == "neutral"


def test_catalog_has_scaled_product_count():
    products = load_products()
    assert len(products) >= 80


def test_profit_formula_matches_metrics():
    products = load_products()
    product = products[0]
    expected = product.net_revenue * (product.margin_percent / 100) - product.google_ads_spend
    assert abs(product.profit - expected) < 0.01
    assert abs(calculate_profit(product) - expected) < 0.01


def test_rescue_classification():
    product = _record(
        googleAdsSpend=100,
        netRevenue=200,
        marginPercent=28,
        addToCartRate=5.0,
        conversionRate=0.8,
        impressions=900,
        stock=40,
    )
    result = classify_product(product, median_ad_spend=500.0)
    assert result.segment == "rescue"


def test_scale_classification():
    product = _record(
        googleAdsSpend=50,
        netRevenue=800,
        marginPercent=40,
        addToCartRate=6.0,
        conversionRate=2.0,
        impressions=5000,
        stock=40,
    )
    result = classify_product(product, median_ad_spend=500.0)
    assert result.segment == "scale"


def test_stop_and_rescue_prefers_rescue():
    """High spend + no revenue that also qualifies as rescue → rescue wins."""
    product = _record(
        googleAdsSpend=200,
        netRevenue=0,
        marginPercent=30,
        addToCartRate=5.0,
        conversionRate=0.5,
        impressions=1000,
        stock=40,
    )
    result = classify_product(product, median_ad_spend=250.0)
    assert result.segment == "rescue"


def test_rescue_and_scale_prefers_scale():
    product = _record(
        googleAdsSpend=50,
        netRevenue=800,
        marginPercent=40,
        addToCartRate=5.0,
        conversionRate=2.0,
        impressions=1000,
        stock=40,
    )
    result = classify_product(product, median_ad_spend=500.0)
    assert result.segment == "scale"


def test_impressions_threshold_field_used():
    thresholds = ClassificationThresholds(min_impressions_for_rescue=10_000)
    product = _record(
        googleAdsSpend=100,
        netRevenue=200,
        marginPercent=28,
        addToCartRate=1.0,
        conversionRate=0.8,
        impressions=900,
        stock=40,
    )
    result = classify_product(product, 500.0, thresholds)
    assert result.segment == "neutral"


def test_segment_counts_sum_to_catalog():
    classified = classify_products()
    counts = segment_counts(classified)
    assert counts["all"] == len(classified)
    assert (
        counts["stop_spending"] + counts["rescue"] + counts["scale"] + counts["neutral"]
        == counts["all"]
    )


def test_classify_catalog_is_cached():
    classify_catalog.cache_clear()
    first = classify_catalog()
    second = classify_catalog()
    assert first is second
    assert len(first) == len(load_products())

