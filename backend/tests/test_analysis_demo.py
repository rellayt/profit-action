from app.services.analysis_demo import STARTER_CHIP_PLANS, parse_demo_plan, run_demo_question


def test_parse_negative_profit():
    plan = parse_demo_plan("Które produkty mają ujemny zysk?")
    assert plan is not None
    assert plan.operation == "list"
    assert any(f.field == "profit" and f.operator == "lt" for f in plan.filters)


def test_parse_wasting_ad_spend():
    plan = parse_demo_plan("Które produkty przepalają budżet reklamowy?")
    assert plan is not None
    assert any(f.field == "segment" and f.value == "stop_spending" for f in plan.filters)


def test_parse_scale_with_stock_filter():
    plan = parse_demo_plan("Które produkty skalować przy wykluczeniu niskiego stanu magazynowego?")
    assert plan is not None
    assert any(f.field == "segment" and f.value == "scale" for f in plan.filters)
    assert any(f.field == "stock" and f.operator == "gte" for f in plan.filters)


def test_unknown_question_returns_fallback():
    result, answer = run_demo_question("What is the weather in Berlin?")
    assert result is None
    assert "Nie udało mi się" in answer


def test_starter_chips_resolve_to_plans():
    assert len(STARTER_CHIP_PLANS) == 2
    for chip, expected in STARTER_CHIP_PLANS.items():
        plan = parse_demo_plan(chip)
        assert plan is not None, chip
        assert plan.operation == expected.operation
        assert plan.criteria_summary == expected.criteria_summary


def test_najlepiej_before_category_group_precedence():
    """Locked rule order: generic 'najlepiej' wins over category group phrasing."""
    plan = parse_demo_plan("która kategoria wypada najlepiej")
    assert plan is not None
    assert plan.operation == "list"
    assert plan.sort is not None
    assert plan.sort.field == "profit"
