from fastapi import APIRouter

router = APIRouter()


@router.get("/health", tags=["admin"])
async def health() -> dict[str, str]:
    return {"status": "ok"}
