"""In-memory conversation store for the local demo (survives only process lifetime)."""

from __future__ import annotations

from collections import OrderedDict
from threading import Lock

from app.models.conversation import ConversationDetail, ConversationSummary, ConversationUpsert

_MAX_ENTRIES = 40
_lock = Lock()
_store: OrderedDict[str, ConversationDetail] = OrderedDict()


def list_conversations() -> list[ConversationSummary]:
    with _lock:
        items = [
            ConversationSummary(
                id=item.id,
                title=item.title,
                createdAt=item.created_at,
                updatedAt=item.updated_at,
            )
            for item in _store.values()
        ]
    items.sort(key=lambda item: item.updated_at, reverse=True)
    return items


def get_conversation(conversation_id: str) -> ConversationDetail | None:
    with _lock:
        return _store.get(conversation_id)


def upsert_conversation(payload: ConversationUpsert) -> ConversationDetail:
    detail = ConversationDetail.model_validate(payload.model_dump(by_alias=True))
    with _lock:
        if detail.id in _store:
            _store.move_to_end(detail.id)
        _store[detail.id] = detail
        while len(_store) > _MAX_ENTRIES:
            _store.popitem(last=False)
    return detail


def delete_conversation(conversation_id: str) -> bool:
    with _lock:
        if conversation_id not in _store:
            return False
        del _store[conversation_id]
        return True


def clear_conversations() -> None:
    with _lock:
        _store.clear()
