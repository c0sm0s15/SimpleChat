# Project instructions

## Project layout

- Keep the React/Vite frontend in `frontend/` and the FastAPI backend in `backend/`.
- Follow the more specific `backend/AGENTS.md` instructions for Python and FastAPI work.
- For persistence, model, repository, or migration changes, also read `backend/app/db/AGENTS.md`.
- Keep dependencies in their project manifests and lockfiles; do not edit lockfiles by hand.
- Never commit secrets or local `.env` files. Values prefixed with `VITE_` are exposed to the browser and must not contain secrets.

## Frontend

- Follow `frontend/AGENTS.md` for frontend conventions.

## Local server scripts

- Run the PowerShell scripts from the project root: `manage-uvicorn.ps1` controls FastAPI and `manage-vite.ps1` controls Vite.
- Pass `start`, `stop`, `restart`, or `status` as the script argument.
- Both scripts write logs to the root `logs/` folder.
