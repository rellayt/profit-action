from app.models.analysis import AnalysisPlan, PlanAggregation, PlanFilter, PlanSort
from app.services.analysis import run_product_analysis
from app.services.analysis_store import clear_analyses
from app.services.classify import classify_products
from app.services.repository import load_products


def setup_function():
    clear_analyses()


def test_negative_profit_list():
    result = run_product_analysis(
        AnalysisPlan(
            operation="list",
            filters=[PlanFilter(field="profit", operator="lt", value=0)],
            criteriaSummary="Ujemny zysk",
        )
    )
    assert result.summary.matched_products >= 1
    assert result.show_cta is True
    assert all(row.profit < 0 for row in result.matched_products)


def test_margin_below_10():
    result = run_product_analysis(
        AnalysisPlan(
            operation="list",
            filters=[PlanFilter(field="margin", operator="lt", value=10)],
            criteriaSummary="Marża < 10",
        )
    )
    assert all(row.margin < 10 for row in result.matched_products)


def test_margin_fraction_coercion():
    result = run_product_analysis(
        AnalysisPlan(
            operation="list",
            filters=[PlanFilter(field="margin", operator="lt", value=0.1)],
            criteriaSummary="Marża fraction",
        )
    )
    assert all(row.margin < 10 for row in result.matched_products)


def test_contains_cars_empty_no_cta():
    result = run_product_analysis(
        AnalysisPlan(
            operation="list",
            filters=[PlanFilter(field="name", operator="contains", value="samochód")],
            criteriaSummary="Samochody",
        )
    )
    assert result.summary.matched_products == 0
    assert result.show_cta is False


def test_aggregate_sum_spend():
    result = run_product_analysis(
        AnalysisPlan(
            operation="aggregate",
            aggregations=[PlanAggregation(fn="sum", field="spend")],
            criteriaSummary="Suma wydatków",
        )
    )
    assert result.operation == "aggregate"
    assert result.aggregations[0].fn == "sum"
    assert result.aggregations[0].value > 0
    assert result.show_cta is True


def test_group_by_category():
    result = run_product_analysis(
        AnalysisPlan(
            operation="group",
            groupBy="category",
            criteriaSummary="Kategorie",
        )
    )
    assert result.group_rows
    assert result.show_cta is True


def test_scope_analysis_narrows_set():
    parent = run_product_analysis(
        AnalysisPlan(
            operation="list",
            filters=[PlanFilter(field="profit", operator="lt", value=0)],
            criteriaSummary="Ujemny zysk",
            limit=50,
        )
    )
    child = run_product_analysis(
        AnalysisPlan(
            operation="list",
            scopeAnalysisId=parent.analysis_id,
            sort=PlanSort(field="profit", direction="asc"),
            limit=1,
            criteriaSummary="Najgorszy z zakresu",
        )
    )
    assert child.summary.matched_products == 1
    assert len(child.matched_products) == 1
    assert child.matched_products[0].id in parent.matched_product_ids
    assert child.show_cta is True


def test_list_limit_drives_cta_and_table_size():
    result = run_product_analysis(
        AnalysisPlan(
            operation="list",
            sort=PlanSort(field="profit", direction="desc"),
            limit=5,
            criteriaSummary="Top 5 zysk",
        )
    )
    assert result.summary.matched_products == 5
    assert len(result.matched_product_ids) == 5
    assert len(result.matched_products) == 5
    assert len(result.chart_points) == 5
    assert result.show_cta is True


def test_analysis_result_consistency_stop_spending():
    result = run_product_analysis(
        AnalysisPlan(
            operation="list",
            filters=[PlanFilter(field="segment", operator="eq", value="stop_spending")],
            criteriaSummary="stop_spending",
        )
    )
    assert result.summary.matched_products == len(result.matched_product_ids)
    catalog_ids = {product.id for product in load_products()}
    assert set(result.matched_product_ids).issubset(catalog_ids)
    assert len(result.chart_points) == result.summary.matched_products
    assert set(point.product_id for point in result.chart_points) == set(result.matched_product_ids)
    assert result.show_cta is (result.summary.matched_products >= 1)
    assert result.summary.matched_products >= 1
    assert "Wśród nich" in result.answer_text or result.summary.matched_products == 0


def test_scale_with_minimum_stock_filters_matches():
    unrestricted = run_product_analysis(
        AnalysisPlan(
            operation="list",
            filters=[PlanFilter(field="segment", operator="eq", value="scale")],
            criteriaSummary="scale",
        )
    )
    restricted = run_product_analysis(
        AnalysisPlan(
            operation="list",
            filters=[
                PlanFilter(field="segment", operator="eq", value="scale"),
                PlanFilter(field="stock", operator="gte", value=20),
            ],
            filterLogic="and",
            criteriaSummary="scale stock>=20",
        )
    )
    assert restricted.summary.matched_products <= unrestricted.summary.matched_products
    classified = {product.id: product for product in classify_products()}
    for product_id in restricted.matched_product_ids:
        assert classified[product_id].stock >= 20
        assert classified[product_id].segment == "scale"
