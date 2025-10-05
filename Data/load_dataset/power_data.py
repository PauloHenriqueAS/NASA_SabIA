from typing import List, Optional
import datetime as dt
import pandas as pd
import requests

from endpoints import Endpoints
from .utils import _to_yyyymmdd, _safe_get # Assumindo que essas utilidades estarão em um arquivo utils.py


DEFAULT_PARAMS_POWER = [
    "T2M_MAX",            # Temperatura máxima do ar a 2 m (°C)
    "T2M_MIN",            # Temperatura mínima do ar a 2 m (°C)
    "T2M",                # Temperatura média diária do ar a 2 m (°C)
    "RH2M",               # Umidade relativa média a 2 m (%)
    "WS2M",               # Velocidade média do vento a 2 m (m/s)
    "PRECTOTCORR",        # Precipitação total diária corrigida (mm/dia)
    # Extras solicitados
    "ALLSKY_SFC_SW_DWN",  # Radiação solar global incidente na superfície (MJ/m²/dia)
    "ALLSKY_SFC_LW_DWN",  # Radiação de onda longa descendente na superfície (MJ/m²/dia)
    "T2MDEW",             # Temperatura do ponto de orvalho a 2 m (°C)
    "PS",                 # Pressão atmosférica à superfície (kPa)
    "QV2M",               # Razão de mistura (umidade específica) a 2 m (g/kg)
    "ALLSKY_KT",          # Índice de claridade (rad global / rad no topo da atmosfera)
    "ALLSKY_SFC_SW_DIFF", # Radiação solar difusa na superfície (MJ/m²/dia)
    "TOA_SW_DWN",         # Irradiância solar no topo da atmosfera (MJ/m²/dia)
]

def build_power_url(
    lat: float,
    lon: float,
    start: str,
    end: str,
    params: Optional[List[str]] = None,
    endpoints: Endpoints = Endpoints(),
) -> str:
    if params is None:
        params = DEFAULT_PARAMS_POWER
    params_str = ",".join(params)
    return (
        f"{endpoints.power_base}?parameters={params_str}&community=AG&longitude={lon}&latitude={lat}"
        f"&start={start}&end={end}&format=JSON"
    )

def fetch_power_daily(
    lat: float,
    lon: float,
    start: dt.date | dt.datetime | str,
    end: dt.date | dt.datetime | str,
    params: Optional[List[str]] = None,
    endpoints: Endpoints = Endpoints(),
) -> pd.DataFrame:
    """
    Busca dados diários da NASA POWER para uma dada latitude/longitude e período.

    Args:
        lat (float): Latitude do ponto de interesse.
        lon (float): Longitude do ponto de interesse.
        start (dt.date | dt.datetime | str): Data de início da busca.
        end (dt.date | dt.datetime | str): Data de fim da busca.
        params (Optional[List[str]]): Lista de parâmetros a serem buscados. Se None, usa DEFAULT_PARAMS_POWER.
        endpoints (Endpoints): Objeto contendo os URLs dos endpoints das APIs.

    Returns:
        pd.DataFrame: DataFrame com os dados diários da NASA POWER.
    """
    start_str = _to_yyyymmdd(start)
    end_str = _to_yyyymmdd(end)
    url = build_power_url(lat, lon, start_str, end_str, params, endpoints)
    r = _safe_get(url)
    if r is None:
        return pd.DataFrame(index=pd.to_datetime([]))
    data = r.json()
    parameter = data.get("properties", {}).get("parameter", {})
    frames: List[pd.Series] = []
    for var, series in parameter.items():
        s = pd.Series(series, name=var)
        s.index = pd.to_datetime(s.index, format="%Y%m%d")
        frames.append(s)
    if not frames:
        return pd.DataFrame(index=pd.to_datetime([]))
    df = pd.concat(frames, axis=1).sort_index()
    df.index.name = "date"
    return df
