from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator

from app.models.analysis import AnalysisResult


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str = ""

    model_config = {"extra": "ignore"}

    @field_validator("content", mode="before")
    @classmethod
    def normalize_content(cls, value: Any) -> str:
        if value is None:
            return ""
        if isinstance(value, str):
            return value
        if isinstance(value, list):
            chunks: list[str] = []
            for part in value:
                if isinstance(part, str):
                    chunks.append(part)
                elif isinstance(part, dict):
                    text = part.get("text")
                    if isinstance(text, str):
                        chunks.append(text)
            return " ".join(chunks).strip()
        return str(value)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(default_factory=list)

    model_config = {"extra": "ignore"}


class StatusDataPart(BaseModel):
    type: Literal["status"] = "status"
    message: str


class AnalysisDataPart(BaseModel):
    type: Literal["analysis"] = "analysis"
    analysis: AnalysisResult


class UnsupportedDataPart(BaseModel):
    type: Literal["unsupported"] = "unsupported"
