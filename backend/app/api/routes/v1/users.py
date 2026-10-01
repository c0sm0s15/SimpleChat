from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/")
async def list_users() -> dict[str, list[dict[str, str]]]:
    return {"users": []}
