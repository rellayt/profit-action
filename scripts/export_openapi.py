"""Export FastAPI OpenAPI schema and inject stream data-part components."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BACKEND = ROOT / "backend"
sys.path.insert(0, str(BACKEND))

from app.main import app  # noqa: E402
from app.models.chat import AnalysisDataPart, StatusDataPart, UnsupportedDataPart  # noqa: E402


def _schema(model: type) -> dict:
    return model.model_json_schema(by_alias=True, mode="serialization", ref_template="#/components/schemas/{model}")


def main() -> None:
    openapi = app.openapi()
    components = openapi.setdefault("components", {}).setdefault("schemas", {})

    for model in (StatusDataPart, AnalysisDataPart, UnsupportedDataPart):
        schema = _schema(model)
        # Flatten $defs from nested models into components
        defs = schema.pop("$defs", {})
        for name, definition in defs.items():
            components.setdefault(name, definition)
        components[model.__name__] = schema

    out = ROOT / "contracts" / "openapi.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(openapi, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
