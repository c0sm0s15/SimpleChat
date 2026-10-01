"""Request models for the in-memory chat endpoint."""

from typing import Annotated, Literal

from pydantic import BaseModel, Field, StringConstraints


class ChatMessage(BaseModel):
    """One user or assistant message supplied as model context."""

    role: Literal["user", "assistant"]
    content: Annotated[
        str,
        StringConstraints(strip_whitespace=True, min_length=1, max_length=8_000),
    ]


class ChatRequest(BaseModel):
    """The recent transcript to send to the assistant."""

    messages: list[ChatMessage] = Field(min_length=1, max_length=20)
