"""OpenAI tool parameters for analyze_products — enums from AnalysisPlan Literals."""

from __future__ import annotations

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

TOOL_NAME = "analyze_products"

OPERATION_ENUM = list(get_args(AnalysisOperation))
FILTER_LOGIC_ENUM = list(get_args(FilterLogic))
PLAN_FIELD_ENUM = list(get_args(PlanField))
FILTER_OPERATOR_ENUM = list(get_args(FilterOperator))
NUMERIC_FIELD_ENUM = list(get_args(NumericField))
SORT_DIRECTION_ENUM = list(get_args(SortDirection))
AGG_FN_ENUM = list(get_args(AggFn))
GROUP_BY_ENUM = list(get_args(GroupByField))


def build_analyze_tool() -> dict:
    """Hand-shaped OpenAI tool JSON; enums stay synced with Pydantic Literals."""
    return {
        "type": "function",
        "function": {
            "name": TOOL_NAME,
            "description": (
                "Run deterministic analysis on the product catalog. "
                "Use for filters, search, aggregates, grouping, and follow-ups via scopeAnalysisId."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "operation": {
                        "type": "string",
                        "enum": list(OPERATION_ENUM),
                    },
                    "scopeAnalysisId": {"type": ["string", "null"]},
                    "filterLogic": {
                        "type": "string",
                        "enum": list(FILTER_LOGIC_ENUM),
                    },
                    "filters": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "field": {
                                    "type": "string",
                                    "enum": list(PLAN_FIELD_ENUM),
                                },
                                "operator": {
                                    "type": "string",
                                    "enum": list(FILTER_OPERATOR_ENUM),
                                },
                                "value": {},
                            },
                            "required": ["field", "operator", "value"],
                        },
                    },
                    "sort": {
                        "type": ["object", "null"],
                        "properties": {
                            "field": {
                                "type": "string",
                                "enum": list(NUMERIC_FIELD_ENUM),
                            },
                            "direction": {
                                "type": "string",
                                "enum": list(SORT_DIRECTION_ENUM),
                            },
                        },
                    },
                    "limit": {"type": ["integer", "null"]},
                    "aggregations": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "fn": {
                                    "type": "string",
                                    "enum": list(AGG_FN_ENUM),
                                },
                                "field": {
                                    "type": "string",
                                    "enum": list(NUMERIC_FIELD_ENUM),
                                },
                            },
                            "required": ["fn"],
                        },
                    },
                    "groupBy": {
                        "type": "string",
                        "enum": list(GROUP_BY_ENUM),
                    },
                    "criteriaSummary": {"type": "string"},
                    "interpretationNote": {"type": ["string", "null"]},
                },
                "required": ["operation", "criteriaSummary"],
            },
        },
    }


ANALYZE_TOOL = build_analyze_tool()
