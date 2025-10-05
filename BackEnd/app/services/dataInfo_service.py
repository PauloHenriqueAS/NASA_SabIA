from datetime import date as dt_date, datetime, timedelta
from typing import List
from app.models import DataSearch,WeatherData
from app.repositorys.dataInfo_repository import dataInfo_repository

class DataInfoService:

    async def get_all_data(self):
        return await dataInfo_repository.load_data_info()

    async def get_data_location(self, data: DataSearch) -> List[WeatherData]:
        print(data)
        rows = await dataInfo_repository.load_data_info()

        items: List[WeatherData] = [
            r if isinstance(r, WeatherData) else WeatherData(**r) for r in rows
        ]

        target_date = data.date_wanted or dt_date.today()
        
        date_range = [target_date + timedelta(days=i) for i in range(7)]

        def to_date(d):
            return d.date() if isinstance(d, datetime) else d

        filtered = [w for w in items if to_date(w.date) in date_range]

        if data.name_city:
            filtered = [w for w in filtered if w.city_name.lower() == data.name_city.lower()]
        if data.latitude is not None and data.longitude is not None:
            filtered = [
                w for w in filtered
                if round(w.latitude, 4) == round(data.latitude, 4)
                and round(w.longitude, 4) == round(data.longitude, 4)
            ]

            print(filtered)
        return filtered

dataInfo_service = DataInfoService()