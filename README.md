# SimpleChat

SimpleChat is a small full-stack AI chat app. The React + Vite frontend sends the current conversation to a FastAPI backend, which streams replies from the OpenAI Responses API.

## Configure OpenAI

Copy `backend/.env.example` to `backend/.env` and add your API key:

```env
OPENAI_API_KEY=your-api-key
OPENAI_MODEL=gpt-5.6-luna
```

The key is read only by the backend. Do not put it in a `VITE_*` variable or commit `backend/.env`. `OPENAI_MODEL` is optional; the default is `gpt-5.6-luna`.

## Install dependencies

Install [uv](https://docs.astral.sh/uv/) and Node.js with npm, then run:

```powershell
uv sync --project backend
npm ci --prefix frontend
```

## Start both apps

From the repository root in PowerShell, start each service:

```powershell
.\manage-uvicorn.ps1 start
.\manage-vite.ps1 start
```

Open [http://127.0.0.1:5173/](http://127.0.0.1:5173/). The FastAPI API is at `http://127.0.0.1:8000`; interactive docs are at `/docs`. The manager scripts accept `start`, `stop`, `restart`, and `status`, and write logs under `logs/`.

## Conversation and privacy

The current conversation exists only in frontend memory. It is sent to OpenAI to generate replies and clears when you start a new chat or refresh the page. SimpleChat does not save conversation history. OpenAI’s data controls and API policies still apply to requests sent to OpenAI.
