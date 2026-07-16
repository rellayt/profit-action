from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.models.analysis import AnalysisResult


class ConversationMessage(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    role: Literal["user", "assistant", "system"]
    content: str


class ConversationSummary(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    title: str
    created_at: int = Field(alias="createdAt")
    updated_at: int = Field(alias="updatedAt")


class ConversationDetail(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    title: str
    created_at: int = Field(alias="createdAt")
    updated_at: int = Field(alias="updatedAt")
    messages: list[ConversationMessage] = Field(default_factory=list)
    analyses_by_id: dict[str, AnalysisResult] = Field(
        default_factory=dict,
        alias="analysesById",
    )
    message_analysis_ids: dict[str, str] = Field(
        default_factory=dict,
        alias="messageAnalysisIds",
    )


# PUT body is the same shape as the detail response (full replace upsert).
ConversationUpsert = ConversationDetail
