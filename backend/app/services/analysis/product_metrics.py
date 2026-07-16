"""Shared money projections for analysis rows / KPIs (same field mapping as filters)."""

from __future__ import annotations

from app.models.catalog import ClassifiedProduct


def money_tuple(product: ClassifiedProduct) -> tuple[float, float, float]:
    return product.google_ads_spend, product.net_revenue, product.profit


def sum_spend_profit(products: list[ClassifiedProduct]) -> tuple[float, float]:
    spend = sum(p.google_ads_spend for p in products)
    profit = sum(p.profit for p in products)
    return spend, profit


def sum_money(products: list[ClassifiedProduct]) -> tuple[float, float, float]:
    spend = sum(p.google_ads_spend for p in products)
    revenue = sum(p.net_revenue for p in products)
    profit = sum(p.profit for p in products)
    return spend, revenue, profit
