from fastapi.testclient import TestClient

from app.main import app
from app.services.conversation_store import clear_conversations

client = TestClient(app)


def setup_function():
    clear_conversations()


def test_upsert_list_and_get_conversation():
    payload = {
        "id": "conv_1",
        "title": "Ujemny zysk",
        "createdAt": 1000,
        "updatedAt": 2000,
        "messages": [{"id": "m1", "role": "user", "content": "Które mają ujemny zysk?"}],
        "analysesById": {},
        "messageAnalysisIds": {},
    }
    put = client.put("/api/conversations/conv_1", json=payload)
    assert put.status_code == 200
    assert put.json()["title"] == "Ujemny zysk"

    listed = client.get("/api/conversations")
    assert listed.status_code == 200
    assert len(listed.json()) == 1
    assert listed.json()[0]["id"] == "conv_1"

    detail = client.get("/api/conversations/conv_1")
    assert detail.status_code == 200
    assert detail.json()["messages"][0]["content"] == "Które mają ujemny zysk?"


def test_missing_conversation_404():
    response = client.get("/api/conversations/missing")
    assert response.status_code == 404


def test_delete_conversation():
    payload = {
        "id": "c_del1",
        "title": "Do usunięcia",
        "createdAt": 1,
        "updatedAt": 2,
        "messages": [],
        "analysesById": {},
        "messageAnalysisIds": {},
    }
    assert client.put("/api/conversations/c_del1", json=payload).status_code == 200
    assert client.delete("/api/conversations/c_del1").status_code == 204
    assert client.get("/api/conversations/c_del1").status_code == 404


def test_upsert_with_typed_analysis():
    analysis = {
        "analysisId": "analysis_abc",
        "operation": "list",
        "periodDays": 30,
        "answerText": "Dopasowano 1.",
        "criteriaSummary": "profit < 0",
        "interpretationNote": None,
        "showChart": False,
        "showCta": True,
        "plan": {},
        "summary": {"productsAnalyzed": 10, "matchedProducts": 1},
        "kpis": [],
        "topProducts": [],
        "matchedProductIds": ["p-1"],
        "matchedProducts": [],
        "groupRows": [],
        "aggregations": [],
        "chartPoints": [],
        "chartCaption": "",
    }
    payload = {
        "id": "conv_typed",
        "title": "Typed",
        "createdAt": 1,
        "updatedAt": 2,
        "messages": [],
        "analysesById": {"analysis_abc": analysis},
        "messageAnalysisIds": {},
    }
    put = client.put("/api/conversations/conv_typed", json=payload)
    assert put.status_code == 200
    assert put.json()["analysesById"]["analysis_abc"]["analysisId"] == "analysis_abc"


def test_upsert_rejects_invalid_analysis():
    payload = {
        "id": "conv_bad",
        "title": "Bad",
        "createdAt": 1,
        "updatedAt": 2,
        "messages": [],
        "analysesById": {"x": {"not": "an analysis"}},
        "messageAnalysisIds": {},
    }
    put = client.put("/api/conversations/conv_bad", json=payload)
    assert put.status_code == 422
