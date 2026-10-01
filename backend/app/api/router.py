from fastapi import APIRouter

from .routes.v1 import items, users

api_router = APIRouter()
api_router.include_router(users.router)
api_router.include_router(items.router)
