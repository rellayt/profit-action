from __future__ import annotations

from collections import OrderedDict
from threading import Lock

from app.models.analysis import AnalysisResult

_MAX_ENTRIES = 50
_lock = Lock()
_store: OrderedDict[str, AnalysisResult] = OrderedDict()


def put_analysis(result: AnalysisResult) -> None:
    with _lock:
        _store[result.analysis_id] = result
        while len(_store) > _MAX_ENTRIES:
            _store.popitem(last=False)


def get_analysis(analysis_id: str) -> AnalysisResult | None:
    with _lock:
        return _store.get(analysis_id)


def clear_analyses() -> None:
    with _lock:
        _store.clear()
