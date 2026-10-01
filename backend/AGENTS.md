# Python and FastAPI

- Manage backend dependencies with `uv` from `backend/`. Use `uv add` or `uv remove`, and keep `pyproject.toml` and `uv.lock` in sync.
- From `backend/`, use `uv sync` to install dependencies and `uv run fastapi dev` for the foreground development server. From the project root, use `manage-uvicorn.ps1` when the managed server is needed.
- In the Codex sandbox on Windows, start or restart the managed Uvicorn server with elevated execution (`require_escalated`): the sandbox can deny Python reads from `backend/.venv/Lib/site-packages`, causing Uvicorn to exit even when the manager prints a PID. After starting, run `manage-uvicorn.ps1 status` with elevated execution and confirm it reports running and `/hello` returns HTTP 200. If startup fails, inspect `logs/uvicorn.stderr.log`; do not treat the initial “Started” message as proof that the server stayed up.
- Follow the FastAPI application structure already in `app/`: keep versioned routes in `app/api/routes/v1/` and register them through `app/api/router.py`. They are served under `/api/v1`.
- Keep root endpoints such as `/hello` and admin endpoints under `/admin` intentional; do not move them under the versioned API prefix without a requirement.
- Use Pydantic schemas for public API request and response shapes. Keep route handlers focused; add service or repository layers when they serve a real responsibility.
- Use four spaces, descriptive `snake_case` names, and type hints on function signatures. Avoid wildcard imports, mutable default arguments, and bare `except` clauses.
- Use context managers for resources that need cleanup. Handle expected exceptions specifically; do not silently swallow failures.
- Use application logging for runtime diagnostics. Never log credentials, tokens, or personal data, and never commit secrets or local `.env` files.
- Add useful docstrings to public API functions and code with non-obvious behavior; avoid comments that merely restate the code.
- The backend does not currently configure a test framework, Ruff, or mypy. Do not assume those tools are available.
- For persistence, model, repository, or migration changes, read and follow `app/db/AGENTS.md` before making changes.
