"""OpenAI Responses API integration for chat streaming."""

from collections.abc import AsyncIterator

from openai import AsyncOpenAI
from openai.types.responses import ResponseStreamEvent

from ..schemas.chat import ChatMessage


async def start_openai_stream(
    messages: list[ChatMessage], *, api_key: str, model: str
) -> tuple[AsyncOpenAI, AsyncIterator[ResponseStreamEvent]]:
    """Start a non-stored streamed response and return its live resources."""
    client = AsyncOpenAI(api_key=api_key.strip())
    try:
        stream = await client.responses.create(
            model=model,
            input=[
                {"role": message.role, "content": message.content}
                for message in messages
            ],
            stream=True,
            store=False,
        )
    except Exception:
        await client.close()
        raise

    return client, stream
