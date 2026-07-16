#!/usr/bin/env python3
"""Append synthetic products p-019+ to products.json. Preserves p-001..p-018."""

from __future__ import annotations

import json
import random
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parents[1] / "app" / "data" / "products.json"
TARGET_COUNT = 100

CATEGORIES = [
    ("Elektronika", "TechNova"),
    ("Akcesoria", "WireBase"),
    ("Wearables", "PulseOne"),
    ("Dom", "HomeCraft"),
    ("Sport", "ActiveLine"),
    ("Beauty", "GlowLab"),
    ("Biuro", "DeskPro"),
    ("Ogród", "GreenPatch"),
]

NAMES = [
    "Słuchawki",
    "Kabel",
    "Ładowarka",
    "Etui",
    "Powerbank",
    "Głośnik",
    "Kamera",
    "Monitor",
    "Klawiatura",
    "Mysz",
    "Router",
    "Lampa",
    "Torba",
    "Butelka",
    "Rękawice",
    "Krem",
    "Serum",
    "Mata",
    "Hantle",
    "Rower stacjonarny",
]


def freshness() -> list[dict]:
    return [
        {"source": "ga4", "label": "GA4", "updatedAt": "2026-07-15T02:10:00+02:00"},
        {"source": "google_ads", "label": "Google Ads", "updatedAt": "2026-07-15T01:45:00+02:00"},
        {"source": "inventory", "label": "Magazyn", "updatedAt": "2026-07-15T16:02:00+02:00"},
    ]


def make_product(index: int, rng: random.Random) -> dict:
    category, brand = rng.choice(CATEGORIES)
    base_name = rng.choice(NAMES)
    variant = rng.choice(["Pro", "Lite", "Max", "Eco", "Plus", "X", "360", "Air"])
    spend = rng.randint(40, 1200)
    profile = rng.random()

    if profile < 0.28:
        revenue = 0
        margin = rng.randint(8, 45)
    elif profile < 0.55:
        revenue = rng.randint(int(spend * 0.4), int(spend * 1.1))
        margin = rng.randint(10, 35)
    else:
        revenue = rng.randint(int(spend * 1.2), int(spend * 3.5))
        margin = rng.randint(18, 55)

    profit = round(revenue * (margin / 100) - spend, 2)
    stock = rng.randint(0, 600)
    if stock < 8:
        stock = rng.randint(8, 120)

    return {
        "id": f"p-{index:03d}",
        "sku": f"SKU-{8800 + index}",
        "name": f"{base_name} {variant} {index % 17}",
        "brand": brand,
        "category": category,
        "googleAdsSpend": spend,
        "netRevenue": revenue,
        "marginPercent": margin,
        "addToCartRate": round(rng.uniform(0.5, 12.0), 1),
        "conversionRate": round(rng.uniform(0.1, 4.5), 1),
        "impressions": rng.randint(2500, 42000),
        "stock": stock,
        "profit": profit,
        "freshness": freshness(),
    }


def main() -> None:
    rng = random.Random(42)
    products: list[dict] = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    existing_ids = {item["id"] for item in products}

    for index in range(19, TARGET_COUNT + 1):
        product_id = f"p-{index:03d}"
        if product_id in existing_ids:
            continue
        products.append(make_product(index, rng))

    DATA_PATH.write_text(
        json.dumps(products, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(products)} products to {DATA_PATH}")


if __name__ == "__main__":
    main()
