import datetime
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_health_check_api():
    return datetime.datetime.now()
