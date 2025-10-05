from datetime import date
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class WeatherData(BaseModel):
    date: date 
    classification: str 
    city_name: str 
    latitude: float
    longitude: float
    T2M_prediction: float 
    T2M_MAX_prediction: float 
    T2M_MIN_prediction: float 
    WS2M_prediction: float 
    RH2M_prediction: float 
    sabia_message_en: str

class DataSearch(BaseModel):
    model_config = ConfigDict(extra="forbid")
    date_wanted: Optional[date] = Field(default=None)
    latitude: Optional[float] = Field(default=None)
    longitude: Optional[float] = Field(default=None)
    name_city: Optional[str] = Field(default=None)
    