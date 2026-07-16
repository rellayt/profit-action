"""Ensure OpenAI tool enums stay aligned with AnalysisPlan Literals."""

from typing import get_args

from app.models.analysis import (
    AggFn,
    AnalysisOperation,
    FilterLogic,
    FilterOperator,
    GroupByField,
    NumericField,
    PlanField,
    SortDirection,
)
from app.services.plan_tool_schema import ANALYZE_TOOL, TOOL_NAME


def _tool_props() -> dict:
    return ANALYZE_TOOL["function"]["parameters"]["properties"]


def test_tool_name_and_required():
    assert ANALYZE_TOOL["function"]["name"] == TOOL_NAME
    required = set(ANALYZE_TOOL["function"]["parameters"]["required"])
    assert required == {"operation", "criteriaSummary"}


def test_operation_enum_matches_literal():
    assert set(_tool_props()["operation"]["enum"]) == set(get_args(AnalysisOperation))


def test_filter_logic_enum_matches_literal():
    assert set(_tool_props()["filterLogic"]["enum"]) == set(get_args(FilterLogic))


def test_plan_field_enum_matches_literal():
    field_enum = _tool_props()["filters"]["items"]["properties"]["field"]["enum"]
    assert set(field_enum) == set(get_args(PlanField))


def test_operator_enum_matches_literal():
    op_enum = _tool_props()["filters"]["items"]["properties"]["operator"]["enum"]
    assert set(op_enum) == set(get_args(FilterOperator))


def test_numeric_and_sort_enums():
    sort_field = _tool_props()["sort"]["properties"]["field"]["enum"]
    sort_dir = _tool_props()["sort"]["properties"]["direction"]["enum"]
    assert set(sort_field) == set(get_args(NumericField))
    assert set(sort_dir) == set(get_args(SortDirection))


def test_agg_and_group_enums():
    agg_fn = _tool_props()["aggregations"]["items"]["properties"]["fn"]["enum"]
    agg_field = _tool_props()["aggregations"]["items"]["properties"]["field"]["enum"]
    group_by = _tool_props()["groupBy"]["enum"]
    assert set(agg_fn) == set(get_args(AggFn))
    assert set(agg_field) == set(get_args(NumericField))
    assert set(group_by) == set(get_args(GroupByField))
