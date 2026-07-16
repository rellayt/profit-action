"""FIELD_META must cover every PlanField Literal."""

from typing import get_args

from app.models.analysis import PlanField
from app.services.field_registry import FIELD_META, field_registry_prompt


def test_field_registry_covers_plan_fields():
    assert set(FIELD_META.keys()) == set(get_args(PlanField))


def test_field_registry_prompt_lists_all_fields():
    prompt = field_registry_prompt()
    for field in get_args(PlanField):
        assert field in prompt
