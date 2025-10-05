from datetime import datetime
import pandas as pd
from typing import List
from app.models import WeatherData

class DataInfoRepository:

    async def load_data_info(self) -> List[WeatherData]:
      
        df = pd.read_csv('app/repositorys/classified_weather_forecast.csv', encoding='utf-8')

        infosCsv = []
        for index, row in df.iterrows():
            try:
                info_data = WeatherData(
                    classification=row['classification'],
                    city_name=row['city_name'],
                    latitude=float(row['latitude']),
                    longitude=float(row['longitude']),
                    T2M_prediction=float(row['T2M_prediction']),
                    T2M_MAX_prediction=float(row['T2M_MAX_prediction']),
                    T2M_MIN_prediction=float(row['T2M_MIN_prediction']),
                    WS2M_prediction=float(row['WS2M_prediction']),
                    RH2M_prediction=float(row['RH2M_prediction']),
                    date=pd.to_datetime(row['date']).date(),
                    sabia_message_en=row['sabia_message_en']
                )
                infosCsv.append(info_data)
            except Exception as e:
                print(f"Error processing the line {index}: {e}")

        return infosCsv

dataInfo_repository = DataInfoRepository()