# Synthetic catalog data

## Source

- File: `backend/app/data/products.json` (~100 products, `p-001` … `p-100`)
- Loader: `backend/app/services/repository.py` — validates with Pydantic, recalculates `profit`, caches the catalog
- Generator: `backend/scripts/generate_products.py` (RNG seed 42; preserves hand-tuned early IDs)

## Why ~100 products

Enough segment diversity for demo chips, chart, and catalog UX without virtualization or a database. Growing raw SKU count without pagination does not improve the demo story.

## Profit formula

Canonical definition in `backend/app/services/metrics.py`:

```text
profit = netRevenue * (marginPercent / 100) - googleAdsSpend
```

The generator and JSON file use the same formula. The repository still recalculates on load so a stale seed cannot poison API numbers.

## Fields (camelCase wire)

`id`, `sku`, `name`, `brand`, `category`, `googleAdsSpend`, `netRevenue`, `marginPercent`, `addToCartRate`, `conversionRate`, `impressions`, `stock`, `profit`, `freshness[]`.

## Segments

Assigned at read time by `classify.py` (not stored in JSON): `stop_spending`, `rescue`, `scale`, `neutral`.

- `classify_catalog()` — no-arg, `@lru_cache(maxsize=1)`, used by the analysis engine and `GET /api/products`.
- `classify_products(explicit_list)` — uncached path when an explicit product list is passed.

See Application Guide and Architecture for the ownership rule: Python owns labels and KPIs; analysis assembly lives in `services/analysis`, not in `classify.py`.
