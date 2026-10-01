from fastapi import APIRouter

from .routes.v1 import chat, items, users

api_router = APIRouter()
api_router.include_router(users.router)
api_router.include_router(items.router)
api_router.include_router(chat.router)
