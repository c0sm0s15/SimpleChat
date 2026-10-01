"""Versioned chat endpoint that streams OpenAI responses to the client."""

import asyncio
import json
import logging
from collections.abc import AsyncIterator
from typing import Any

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from openai import (
    APITimeoutError,
    OpenAIError,
    RateLimitError,
)
from openai.types.responses import ResponseStreamEvent

from ....core.config import get_settings
from ....schemas.chat import ChatMessage, ChatRequest
from ....services.chat import start_openai_stream


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["chat"])


def _sse_event(event: str, payload: dict[str, Any]) -> str:
    data = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    return f"event: {event}\ndata: {data}\n\n"


async def _stream_events(
    stream: AsyncIterator[ResponseStreamEvent],
) -> AsyncIterator[str]:
    completed = False
    try:
        async for event in stream:
            if event.type == "response.output_text.delta":
                yield _sse_event("delta", {"text": event.delta})
            elif event.type == "response.completed":
                completed = True
                yield _sse_event("done", {})
            elif event.type in {"response.failed", "error"}:
                logger.warning("OpenAI response stream ended with an upstream error")
                yield _sse_event(
                    "error",
                    {"message": "The assistant could not finish this reply. Try again."},
                )
                return

        if not completed:
            yield _sse_event(
                "error",
                {"message": "The assistant response ended unexpectedly. Try again."},
            )
    except asyncio.CancelledError:
        raise
    except Exception:
        logger.warning("OpenAI response stream failed")
        yield _sse_event(
            "error",
            {"message": "The assistant connection was interrupted. Try again."},
        )


async def _close_stream_resources(client: Any, stream: Any) -> None:
    """Close upstream resources without logging request or response data."""
    try:
        await stream.close()
    except Exception:
        logger.debug("OpenAI response stream cleanup failed")
    try:
        await client.close()
    except Exception:
        logger.debug("OpenAI client cleanup failed")


@router.post(
    "",
    response_class=StreamingResponse,
    responses={
        429: {"description": "The OpenAI API rate limit was reached."},
        502: {"description": "The OpenAI service could not process the request."},
        503: {"description": "The server is missing OPENAI_API_KEY."},
        504: {"description": "The OpenAI request timed out."},
    },
)
async def chat(request: ChatRequest) -> StreamingResponse:
    """Stream a response for the recent in-memory conversation."""
    settings = get_settings()
    if not settings.openai_api_key or not settings.openai_api_key.strip():
        raise HTTPException(
            status_code=503,
            detail="The server is missing OPENAI_API_KEY. Configure it in backend/.env and restart the API.",
        )

    try:
        client, upstream_stream = await start_openai_stream(
            request.messages,
            api_key=settings.openai_api_key,
            model=settings.openai_model,
        )
    except APITimeoutError as exc:
        raise HTTPException(
            status_code=504,
            detail="The assistant request timed out. Please try again.",
        ) from exc
    except RateLimitError as exc:
        raise HTTPException(
            status_code=429,
            detail="The assistant is temporarily busy. Please try again shortly.",
        ) from exc
    except OpenAIError as exc:
        raise HTTPException(
            status_code=502,
            detail="The assistant service is unavailable. Check the server configuration and try again.",
        ) from exc

    async def response_events() -> AsyncIterator[str]:
        try:
            async for frame in _stream_events(upstream_stream):
                yield frame
        finally:
            await _close_stream_resources(client, upstream_stream)

    return StreamingResponse(
        response_events(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
