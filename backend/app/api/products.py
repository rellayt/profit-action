from fastapi import APIRouter, HTTPException

from app.models.catalog import ProductsResponse
from app.services.classify import classify_catalog, segment_counts
from app.services.repository import ProductDataError, load_products

router = APIRouter(prefix="/api", tags=["products"])


def _load_products_or_503():
    try:
        return load_products()
    except ProductDataError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.get("/products", response_model=ProductsResponse)
def get_products() -> ProductsResponse:
    _load_products_or_503()
    classified = list(classify_catalog())
    counts = segment_counts(classified)
    return ProductsResponse(
        items=classified,
        total=len(classified),
        segmentCounts=counts,
    )
