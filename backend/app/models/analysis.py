from typing import Any, Literal

from pydantic import BaseModel, Field

from app.models.catalog import ProductSegment

AnalysisOperation = Literal["list", "aggregate", "group"]
KpiFormat = Literal["currency", "number", "text"]
FilterLogic = Literal["and", "or"]
NumericField = Literal["spend", "revenue", "profit", "margin", "stock"]
TextField = Literal["name", "brand", "category", "sku"]
PlanField = Literal[
    "spend", "revenue", "profit", "margin", "stock", "name", "brand", "category", "sku", "segment"
]
FilterOperator = Literal["lt", "lte", "gt", "gte", "eq", "contains"]
AggFn = Literal["count", "sum", "avg", "min", "max"]
GroupByField = Literal["category", "brand", "segment"]
SortDirection = Literal["asc", "desc"]


class AnalysisKpi(BaseModel):
    key: str
    label: str
    value: float | int | str
    format: KpiFormat = "number"


class AnalysisTopProduct(BaseModel):
    id: str
    name: str
    spend: float
    revenue: float
    profit: float


class ChartPoint(BaseModel):
    product_id: str = Field(alias="productId")
    name: str
    spend: float
    revenue: float
    profit: float
    stock: int
    segment: ProductSegment
    recommendation: str

    model_config = {"populate_by_name": True}


class AnalysisSummaryCounts(BaseModel):
    products_analyzed: int = Field(alias="productsAnalyzed")
    matched_products: int = Field(alias="matchedProducts")

    model_config = {"populate_by_name": True}


class PlanFilter(BaseModel):
    field: PlanField
    operator: FilterOperator
    value: Any


class PlanSort(BaseModel):
    field: NumericField
    direction: SortDirection = "desc"


class PlanAggregation(BaseModel):
    fn: AggFn
    field: NumericField | None = None


class AnalysisPlan(BaseModel):
    operation: AnalysisOperation = "list"
    scope_analysis_id: str | None = Field(default=None, alias="scopeAnalysisId")
    filter_logic: FilterLogic = Field(default="and", alias="filterLogic")
    filters: list[PlanFilter] = Field(default_factory=list)
    sort: PlanSort | None = None
    limit: int | None = 25
    aggregations: list[PlanAggregation] = Field(default_factory=list)
    group_by: GroupByField | None = Field(default=None, alias="groupBy")
    criteria_summary: str = Field(default="", alias="criteriaSummary")
    interpretation_note: str | None = Field(default=None, alias="interpretationNote")

    model_config = {"populate_by_name": True}


class MatchedProductRow(BaseModel):
    id: str
    name: str
    spend: float
    revenue: float
    profit: float
    stock: int
    margin: float
    segment: ProductSegment
    match_reason: str = Field(alias="matchReason")

    model_config = {"populate_by_name": True}


class GroupRow(BaseModel):
    key: str
    count: int
    spend: float
    revenue: float
    profit: float
    avg_margin: float = Field(alias="avgMargin")

    model_config = {"populate_by_name": True}


class AggregationRow(BaseModel):
    fn: AggFn
    field: str | None = None
    value: float | int
    label: str


class AnalysisResult(BaseModel):
    """Wire DTO for streamed analysis snapshots."""

    analysis_id: str = Field(alias="analysisId")
    operation: AnalysisOperation = "list"
    period_days: int = Field(default=30, alias="periodDays")
    answer_text: str = Field(default="", alias="answerText")
    criteria_summary: str = Field(default="", alias="criteriaSummary")
    interpretation_note: str | None = Field(default=None, alias="interpretationNote")
    show_chart: bool = Field(default=False, alias="showChart")
    show_cta: bool = Field(default=False, alias="showCta")
    plan: AnalysisPlan = Field(default_factory=AnalysisPlan)
    summary: AnalysisSummaryCounts
    kpis: list[AnalysisKpi] = Field(default_factory=list)
    top_products: list[AnalysisTopProduct] = Field(default_factory=list, alias="topProducts")
    matched_product_ids: list[str] = Field(default_factory=list, alias="matchedProductIds")
    matched_products: list[MatchedProductRow] = Field(default_factory=list, alias="matchedProducts")
    group_rows: list[GroupRow] = Field(default_factory=list, alias="groupRows")
    aggregations: list[AggregationRow] = Field(default_factory=list)
    chart_points: list[ChartPoint] = Field(default_factory=list, alias="chartPoints")
    chart_caption: str = Field(default="", alias="chartCaption")

    model_config = {"populate_by_name": True}
