from fastapi import APIRouter, HTTPException

from app.models.conversation import ConversationDetail, ConversationSummary, ConversationUpsert
from app.services.conversation_store import (
    delete_conversation,
    get_conversation,
    list_conversations,
    upsert_conversation,
)

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


@router.get("", response_model=list[ConversationSummary])
def get_conversation_list() -> list[ConversationSummary]:
    return list_conversations()


@router.get("/{conversation_id}", response_model=ConversationDetail)
def get_conversation_detail(conversation_id: str) -> ConversationDetail:
    detail = get_conversation(conversation_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return detail


@router.put("/{conversation_id}", response_model=ConversationDetail)
def put_conversation(
    conversation_id: str,
    body: ConversationUpsert,
) -> ConversationDetail:
    if body.id != conversation_id:
        raise HTTPException(status_code=400, detail="Conversation id mismatch")
    return upsert_conversation(body)


@router.delete("/{conversation_id}", status_code=204)
def remove_conversation(conversation_id: str) -> None:
    if not delete_conversation(conversation_id):
        raise HTTPException(status_code=404, detail="Conversation not found")
