# SimpleChat

Full-stack project with a React + Vite frontend and a FastAPI backend. The backend follows FastAPI's [Bigger Applications](https://fastapi.tiangolo.com/tutorial/bigger-applications/) approach with routers split into modules.

## Backend

From `backend/`, install [uv](https://docs.astral.sh/uv/) and run:

```sh
uv sync
uv run fastapi dev
```

The API is served at `http://127.0.0.1:8000`; interactive docs are at `/docs`.
API routes are under `/api/v1`; the root and `/hello` endpoints remain at the root.

The database folders are ready for configuration. The database engine, ORM, and migration dependencies have not been selected or added yet.

## Frontend

From `frontend/`, install Node.js (including npm) and run:

```sh
npm install
npm run dev
```

The frontend uses React, Vite, and shadcn/ui. Copy `.env.example` to `.env.local` to configure the API URL.

## Run both apps

In PowerShell, run either script with `start`, `stop`, `restart`, or `status` as its argument. For example:

```powershell
.\manage-uvicorn.ps1 start
.\manage-vite.ps1 start
```

Both scripts write logs under `logs/`. Vite runs with hot reload at `http://127.0.0.1:5173/`.
