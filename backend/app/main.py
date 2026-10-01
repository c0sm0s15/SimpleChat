from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.router import api_router
from .internal import admin

app = FastAPI(title="SimpleChat API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")
app.include_router(admin.router, prefix="/admin")


@app.get("/", tags=["root"])
async def root() -> dict[str, str]:
    return {"message": "SimpleChat API"}


@app.get("/hello", tags=["root"])
async def hello() -> dict[str, str]:
    return {"message": "Hello, World!"}
