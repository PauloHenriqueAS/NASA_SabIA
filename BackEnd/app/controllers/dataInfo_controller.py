from typing import List
from fastapi import APIRouter
from app.models import DataSearch, WeatherData
from app.services import dataInfo_service

router = APIRouter()

@router.get("/GetAllDataInfo")
async def get_all_data_info():
    return await dataInfo_service.get_all_data()

@router.post("/GetDataLocation", response_model=List[WeatherData])
async def get_data_location(data: DataSearch):
    return await dataInfo_service.get_data_location(data)