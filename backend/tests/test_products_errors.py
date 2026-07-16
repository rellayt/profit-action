from fastapi.testclient import TestClient

from app.main import app
from app.services.repository import ProductDataError

client = TestClient(app)


def test_products_returns_503_on_data_error(monkeypatch):
    def boom():
        raise ProductDataError("Product data file is missing.")

    monkeypatch.setattr("app.api.products.load_products", boom)
    response = client.get("/api/products")
    assert response.status_code == 503
    assert "missing" in response.json()["detail"].lower()
