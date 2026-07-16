from app.models.chat import ChatMessage, ChatRequest
from app.services.stream_orchestrator import extract_last_message


def test_extract_last_message_empty():
    assert extract_last_message(ChatRequest(messages=[])) == ""


def test_extract_last_message_string_content():
    request = ChatRequest(messages=[ChatMessage(role="user", content="Które produkty wstrzymać?")])
    assert extract_last_message(request) == "Które produkty wstrzymać?"


def test_extract_last_message_list_content():
    request = ChatRequest(
        messages=[
            ChatMessage(
                role="user",
                content=[{"type": "text", "text": "Hej"}, {"type": "text", "text": "świat"}],
            )
        ]
    )
    assert extract_last_message(request) == "Hej świat"
