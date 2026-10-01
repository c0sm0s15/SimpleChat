# SimpleChat OpenAI Chat Design

## Goal

Replace the starter hello page with a usable, single-conversation AI chat. The React client talks to the existing FastAPI backend, which calls the OpenAI API. Conversation history is temporary: it lives in browser memory, clears when the user starts a new chat or reloads the page, and is never written to an application database.

## Approved product behavior

- Use the selected prompt-rail layout: a narrow left rail with **New chat** and a few starter prompts, plus a main conversation pane.
- Show an initial welcome state and starter prompts. Clicking a starter prompt sends it as the first user message.
- Render user and assistant turns as distinct messages. Stream the assistant response into its message as text arrives.
- Enter sends a message; Shift+Enter inserts a newline.
- Keep the current transcript in frontend memory and send the recent transcript with each turn so the assistant has context. Starting a new chat clears it. Do not show saved conversations or persist messages across reloads.
- Keep the API key on the backend. Show a concise privacy note that messages are sent to OpenAI and are not saved by SimpleChat.
- When a request fails, preserve the user message, display a readable error, and let the user retry that turn without duplicating the message.

## Architecture

### Frontend

Replace the sample screen in `frontend/src/App.tsx` with the chat interface. Keep conversation state and stream assembly in the client. Add a chat API module under `frontend/src/features/chat/` and extend `frontend/src/lib/api-client.ts` or use `fetch` there to POST the transcript to the backend and parse Server-Sent Events (SSE).

Use a single active conversation. Do not add client routing, user accounts, local storage, saved threads, or a database-backed history. The New chat action cancels any active response, clears the in-memory transcript, and restores the welcome state. The composer should prevent empty sends, disable duplicate sends while a response is active, and retain the draft after a failure. Send no more than the most recent 20 messages with each turn.

### Backend

Add a versioned `POST /api/v1/chat` route under `backend/app/api/routes/v1/` and register it in the existing API router. The request contains no more than 20 recent `user` and `assistant` messages, each with non-empty content of at most 8,000 characters. Reject invalid roles, empty messages, oversize messages, and oversize request bodies before making an upstream request.

Use the official asynchronous OpenAI Python SDK and the Responses API. Configure `AsyncOpenAI` from the server-side `OPENAI_API_KEY`. Make `OPENAI_MODEL` configurable, defaulting to `gpt-5.6-luna` as the currently documented cost-sensitive model. Send the supplied transcript for each turn, stream text deltas to the browser as SSE, and set `store=False` so the Responses API does not retain response application state.

The API route does not create or read conversation records. It forwards the in-memory transcript to OpenAI for each response and relays generated text to the client as `delta` events, followed by `done`; after a stream has started, report failures with an `error` event and close the stream. Do not log API keys, prompts, or generated text.

### Configuration and setup

- Add `openai` to `backend/pyproject.toml` using `uv add` so `uv.lock` remains package-manager generated.
- Add a backend environment example documenting `OPENAI_API_KEY` and `OPENAI_MODEL`; never include an actual key in the repository.
- Read configuration from the backend process environment or `backend/.env`, which is ignored by Git. Ensure the managed Uvicorn script starts from `backend/`, as it does now.
- Document how to configure the key, install dependencies, start both services, and use the chat in the root README.

## Errors and privacy

- If the API key is missing, return HTTP 503 with an actionable server configuration message without attempting the upstream call.
- Map upstream authentication/configuration errors to a generic HTTP 502, rate limits to HTTP 429, and timeouts to HTTP 504. Return safe, actionable client messages. Never send raw SDK exception details, traces, or credentials to the browser.
- Before streaming begins, use an appropriate HTTP error status. After streaming begins, send a structured SSE error event and close the stream cleanly.
- Include a short UI note that messages are sent to OpenAI to generate replies, while SimpleChat does not save conversation history.
- `store=False` disables Responses API application-state storage. OpenAI’s separate data-control and abuse-monitoring policies still apply to API traffic; the UI must not promise that OpenAI itself retains no data.

## Verification

- Build the frontend with the existing production build command and start it through the existing Vite manager.
- Check the backend route and configuration behavior locally. A real AI reply requires a valid `OPENAI_API_KEY` with API access and billing enabled; no key is present in this repository.
- Manually confirm that multi-turn context works within one browser session, New chat clears it, refresh clears it, streaming errors are readable, and no transcript appears in database or logs.

## Out of scope

- Persisted chat history, multiple saved conversations, authentication, sharing, file uploads, tools, web search, voice, and conversation management.
- Streaming Markdown rendering beyond safe plain-text display in the initial version.

## References

- [OpenAI API quickstart](https://platform.openai.com/docs/quickstart/make-your-first-api-request)
- [OpenAI Responses API data controls](https://platform.openai.com/docs/models/default-usage-policies-by-endpoint)
- [OpenAI models](https://platform.openai.com/docs/models/gpt-4-turbo-and-gpt-4)
