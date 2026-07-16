from typing import Literal

from pydantic import BaseModel, Field

DataSourceId = Literal["ga4", "google_ads", "inventory", "shop"]
ProductSegment = Literal["stop_spending", "rescue", "scale", "neutral"]


class DataFreshness(BaseModel):
    source: DataSourceId
    label: str
    updated_at: str = Field(alias="updatedAt")

    model_config = {"populate_by_name": True}


class ProductRecord(BaseModel):
    id: str
    sku: str
    name: str
    brand: str
    category: str
    google_ads_spend: float = Field(alias="googleAdsSpend")
    net_revenue: float = Field(alias="netRevenue")
    margin_percent: float = Field(alias="marginPercent")
    add_to_cart_rate: float = Field(alias="addToCartRate")
    conversion_rate: float = Field(alias="conversionRate")
    impressions: int
    stock: int
    profit: float
    freshness: list[DataFreshness]

    model_config = {"populate_by_name": True}


class ClassifiedProduct(ProductRecord):
    segment: ProductSegment
    recommendation: str
    evidence: list[str]


class ProductsResponse(BaseModel):
    items: list[ClassifiedProduct]
    total: int
    segment_counts: dict[str, int] = Field(alias="segmentCounts")

    model_config = {"populate_by_name": True}
