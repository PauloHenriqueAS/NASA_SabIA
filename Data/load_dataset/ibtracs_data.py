from typing import List, Tuple
import io
import pandas as pd
import numpy as np
import datetime as dt

from endpoints import Endpoints
from .utils import _safe_get, _haversine_km, _to_iso_z


def fetch_ibtracs_all(endpoints: Endpoints = Endpoints()) -> pd.DataFrame:
    """
    Busca o arquivo CSV completo do IBTrACS v04r00 (todas as bacias).

    Args:
        endpoints (Endpoints): Objeto contendo os URLs dos endpoints das APIs.

    Returns:
        pd.DataFrame: DataFrame com informações sobre as tempestades históricas (id/nome, tempo, lat, lon, vento, pressão).
    """
    r = _safe_get(endpoints.ibtracs_all_csv, timeout=120)
    if r is None:
        return pd.DataFrame()
    try:
        df = pd.read_csv(io.StringIO(r.text))
    except Exception:
        return pd.DataFrame()
    # Columns vary; try common fields
    # Time field can be 'ISO_TIME' or 'ISO_TIME' like 'YYYY-MM-DD HH:MM:SS'
    time_col = "ISO_TIME" if "ISO_TIME" in df.columns else None
    if time_col is None:
        # Try fallback
        for c in df.columns:
            if "ISO_TIME" in c.upper():
                time_col = c
                break
    if time_col is None:
        return pd.DataFrame()
    # Normalize fields
    out = pd.DataFrame()
    out["time"] = pd.to_datetime(df[time_col], errors="coerce")
    # storm id/name
    if "SID" in df.columns:
        out["storm_id"] = df["SID"]
    elif "USA_ATCF_ID" in df.columns:
        out["storm_id"] = df["USA_ATCF_ID"]
    else:
        out["storm_id"] = np.nan
    if "NAME" in df.columns:
        out["storm_name"] = df["NAME"]
    else:
        out["storm_name"] = np.nan
    # position
    lat_col = "LAT" if "LAT" in df.columns else None
    lon_col = "LON" if "LON" in df.columns else None
    if lat_col is None or lon_col is None:
        return pd.DataFrame()
    out["lat"] = pd.to_numeric(df[lat_col], errors="coerce")
    out["lon"] = pd.to_numeric(df[lon_col], errors="coerce")
    # intensity (optional)
    if "WMO_WIND" in df.columns:
        out["wind_kt"] = pd.to_numeric(df["WMO_WIND"], errors="coerce")
    elif "USA_WIND" in df.columns:
        out["wind_kt"] = pd.to_numeric(df["USA_WIND"], errors="coerce")
    else:
        out["wind_kt"] = np.nan
    if "WMO_PRES" in df.columns:
        out["pressure_mb"] = pd.to_numeric(df["WMO_PRES"], errors="coerce")
    elif "USA_PRES" in df.columns:
        out["pressure_mb"] = pd.to_numeric(df["USA_PRES"], errors="coerce")
    else:
        out["pressure_mb"] = np.nan
    out = out.dropna(subset=["time", "lat", "lon"]).sort_values("time")
    return out


def compute_min_distance_to_ibtracs(
    lat: float, lon: float, ib: pd.DataFrame, start: dt.date | dt.datetime | str, end: dt.date | dt.datetime | str
) -> pd.DataFrame:
    """
    Calcula a distância mínima diária para qualquer tempestade IBTrACS dentro da
    janela de data solicitada.

    Args:
        lat (float): Latitude do ponto de interesse.
        lon (float): Longitude do ponto de interesse.
        ib (pd.DataFrame): DataFrame com os dados das tempestades IBTrACS.
        start (dt.date | dt.datetime | str): Data de início da janela de busca.
        end (dt.date | dt.datetime | str): Data de fim da janela de busca.

    Returns:
        pd.DataFrame: DataFrame indexado por data com a coluna 'IBTRACS_min_distance_km'.
    """
    if ib is None or ib.empty:
        return pd.DataFrame(index=pd.to_datetime([]), columns=["IBTRACS_min_distance_km"]).astype(float)
    start_dt = pd.to_datetime(_to_iso_z(start)).tz_localize(None)
    end_dt = pd.to_datetime(_to_iso_z(end)).tz_localize(None)
    mask = (ib["time"] >= start_dt) & (ib["time"] <= end_dt)
    sub = ib.loc[mask].copy()
    if sub.empty:
        return pd.DataFrame(index=pd.to_datetime([]), columns=["IBTRACS_min_distance_km"]).astype(float)
    sub["date"] = sub["time"].dt.normalize()
    rows: List[Tuple[pd.Timestamp, float]] = []
    for d, g in sub.groupby("date"):
        vals = []
        for _, r in g.iterrows():
            vals.append(_haversine_km(lat, lon, float(r["lat"]), float(r["lon"]))) 
        rows.append((d, float(np.min(vals)) if vals else np.nan))
    out = pd.DataFrame(rows, columns=["date", "IBTRACS_min_distance_km"]).set_index("date").sort_index()
    return out
