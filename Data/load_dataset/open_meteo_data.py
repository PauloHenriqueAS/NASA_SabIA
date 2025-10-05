import pandas as pd
import numpy as np
import requests

from endpoints import Endpoints
from .utils import _safe_get

def fetch_open_meteo_daily_forecast(
    lat: float,
    lon: float,
    days: int = 7,
    endpoints: Endpoints = Endpoints(),
) -> pd.DataFrame:
    """
    Busca a previsão diária de variáveis meteorológicas enriquecidas via Open-Meteo.

    Args:
        lat (float): Latitude do ponto de interesse.
        lon (float): Longitude do ponto de interesse.
        days (int): Número de dias para a previsão (máximo de 16 dias).
        endpoints (Endpoints): Objeto contendo os URLs dos endpoints das APIs.

    Returns:
        pd.DataFrame: DataFrame indexado por data UTC com colunas de previsão diária.
    """
    daily = [
        "temperature_2m_max",
        "temperature_2m_min",
        "apparent_temperature_max",
        "apparent_temperature_min",
        "precipitation_sum",
        "precipitation_probability_max",
        "precipitation_hours",
        "windspeed_10m_max",
        "windgusts_10m_max",
        "relative_humidity_2m_mean",
        "cloudcover_mean",
        "pressure_msl_mean",
        "uv_index_max",
        "shortwave_radiation_sum",
    ]
    params = {
        "latitude": lat,
        "longitude": lon,
        "forecast_days": max(1, min(16, days)),
        "daily": ",".join(daily),
        "timezone": "UTC",
        "models": "gfs_seamless",  # prefer GFS where available
    }
    url = endpoints.open_meteo_base + "?" + requests.compat.urlencode(params)
    r = _safe_get(url)
    if r is None:
        return pd.DataFrame(index=pd.to_datetime([]))
    try:
        data = r.json()
        daily_obj = data.get("daily", {})
        times = pd.to_datetime(daily_obj.get("time", []))
        df = pd.DataFrame(index=times)
        df.index.name = "date"
        mapping = {
        "temperature_2m_max": "T2M_MAX_FC",
        "temperature_2m_min": "T2M_MIN_FC",
        "apparent_temperature_max": "T2M_APPARENT_MAX_FC",
        "apparent_temperature_min": "T2M_APPARENT_MIN_FC",
        "precipitation_sum": "PRECIP_SUM_FC",
        "precipitation_probability_max": "PRECIP_PROB_MAX_FC",
        "precipitation_hours": "PRECIP_HOURS_FC",
        "windspeed_10m_max": "WIND_MAX10M_FC",
        "windgusts_10m_max": "WINDGUST_MAX10M_FC",
        "relative_humidity_2m_mean": "RH2M_MEAN_FC",
        "cloudcover_mean": "CLOUDCOVER_MEAN_FC",
        "pressure_msl_mean": "PRESSURE_MSL_MEAN_FC",
        "uv_index_max": "UV_INDEX_MAX_FC",
        "shortwave_radiation_sum": "SW_RADIATION_SUM_FC",
        }
        for src, dst in mapping.items():
            vals = daily_obj.get(src, [])
            if not vals:
                df[dst] = np.nan
            else:
                df[dst] = pd.Series(vals, index=times)
        return df
    except Exception:
        return pd.DataFrame(index=pd.to_datetime([]))


def fetch_open_meteo_marine_sst(
    lat: float,
    lon: float,
    days: int = 7,
    endpoints: Endpoints = Endpoints(),
) -> pd.DataFrame:
    """
    Busca a temperatura da superfície do mar (SST) da previsão marinha do Open-Meteo.

    Args:
        lat (float): Latitude do ponto de interesse.
        lon (float): Longitude do ponto de interesse.
        days (int): Número de dias para a previsão (máximo de 16 dias).
        endpoints (Endpoints): Objeto contendo os URLs dos endpoints das APIs.

    Returns:
        pd.DataFrame: DataFrame indexado por data com a coluna SST_FC.
    """
    daily = ["sea_surface_temperature_mean"]
    params = {
        "latitude": lat,
        "longitude": lon,
        "forecast_days": max(1, min(16, days)),
        "daily": ",".join(daily),
        "timezone": "UTC",
    }
    url = endpoints.open_meteo_marine_base + "?" + requests.compat.urlencode(params)
    r = _safe_get(url)
    if r is None:
        return pd.DataFrame(index=pd.to_datetime([]), columns=["SST_FC"]).astype(float)
    try:
        data = r.json()
        daily_obj = data.get("daily", {})
        times = pd.to_datetime(daily_obj.get("time", []))
        sst_vals = daily_obj.get("sea_surface_temperature_mean", [])
        if not sst_vals:
            return pd.DataFrame(index=pd.to_datetime([]), columns=["SST_FC"]).astype(float)
        df = pd.DataFrame({"SST_FC": sst_vals}, index=times)
        df.index.name = "date"
        return df
    except Exception:
        return pd.DataFrame(index=pd.to_datetime([]), columns=["SST_FC"]).astype(float)
