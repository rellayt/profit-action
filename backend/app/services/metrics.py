"""Canonical product metric definitions for catalog and analysis.

- Spend: advertising cost over the last 30 days (google_ads_spend)
- Revenue: revenue attributed to the product (net_revenue)
- Profit: gross margin amount minus ad spend
- Margin: commercial margin percent (margin_percent)
- Stock: available inventory units
"""

from app.models.catalog import ProductRecord


def calculate_profit(product: ProductRecord) -> float:
    gross_profit = product.net_revenue * (product.margin_percent / 100)
    return gross_profit - product.google_ads_spend
