import json

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _data_parts(body: str) -> list[dict]:
    parts: list[dict] = []
    for line in body.splitlines():
        if not line.startswith("2:"):
            continue
        payload = json.loads(line[2:])
        if isinstance(payload, list):
            parts.extend(item for item in payload if isinstance(item, dict))
        elif isinstance(payload, dict):
            parts.append(payload)
    return parts


def test_chat_stream_demo_negative_profit():
    from app.config import settings

    original = settings.demo_mode
    settings.demo_mode = True
    try:
        response = client.post(
            "/api/chat",
            json={
                "messages": [
                    {
                        "role": "user",
                        "content": "Które produkty mają ujemny zysk?",
                    }
                ]
            },
        )
        assert response.status_code == 200
        body = response.text
        assert '"type": "analysis"' in body
        analysis_part = next(part for part in _data_parts(body) if part.get("type") == "analysis")
        analysis = analysis_part["analysis"]
        assert analysis["showCta"] is True
        assert analysis["summary"]["matchedProducts"] >= 1
        assert analysis["analysisId"]
        assert isinstance(analysis.get("plan"), dict)
        assert analysis["plan"].get("operation") == "list"
    finally:
        settings.demo_mode = original


def test_chat_stream_unknown_returns_unsupported():
    from app.config import settings

    original = settings.demo_mode
    settings.demo_mode = True
    try:
        response = client.post(
            "/api/chat",
            json={"messages": [{"role": "user", "content": "Opowiedz suchara"}]},
        )
        assert response.status_code == 200
        unsupported = next(
            part for part in _data_parts(response.text) if part.get("type") == "unsupported"
        )
        assert unsupported == {"type": "unsupported"}
    finally:
        settings.demo_mode = original


def test_products_returns_classified_catalog():
    response = client.get("/api/products")
    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] >= 80
    assert payload["segmentCounts"]["all"] == payload["total"]
    assert "segment" in payload["items"][0]
    assert "periodDays" not in payload


def test_products_ignores_legacy_period_query():
    """Removed query param must not 422; catalog shape stays period-free."""
    response = client.get("/api/products", params={"period": "30d"})
    assert response.status_code == 200
    assert "periodDays" not in response.json()


def test_health_includes_live_flag():
    response = client.get("/health")
    assert response.status_code == 200
    payload = response.json()
    assert "liveAiAvailable" in payload
    assert "demoMode" in payload
