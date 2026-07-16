import json
from functools import lru_cache
from pathlib import Path

from app.models.catalog import ProductRecord
from app.services.metrics import calculate_profit

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "products.json"


class ProductDataError(Exception):
    pass


@lru_cache(maxsize=1)
def load_products() -> list[ProductRecord]:
    try:
        raw = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise ProductDataError("Product data file is missing.") from exc
    except json.JSONDecodeError as exc:
        raise ProductDataError("Product data file is invalid JSON.") from exc

    products = [ProductRecord.model_validate(item) for item in raw]
    return [
        product.model_copy(update={"profit": calculate_profit(product)}) for product in products
    ]
