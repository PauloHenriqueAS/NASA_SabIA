from typing import Dict, List, Tuple
import pandas as pd
import numpy as np

from endpoints import Endpoints
from .utils import _safe_get, _haversine_km


def fetch_nhc_current_storms(endpoints: Endpoints = Endpoints()) -> pd.DataFrame:
    """
    Busca informações sobre tempestades tropicais ativas do NHC (National Hurricane Center).

    Args:
        endpoints (Endpoints): Objeto contendo os URLs dos endpoints das APIs.

    Returns:
        pd.DataFrame: DataFrame com informações sobre as tempestades ativas e seus pontos de previsão.
    """
    r = _safe_get(endpoints.nhc_current_storms)
    if r is None:
        return pd.DataFrame()
    try:
        data = r.json()
    except Exception:
        return pd.DataFrame()
    # Structure: list of storms with forecast track points
    rows: List[Dict[str, object]] = []
    for storm in data.get("activeStorms", []):
        sid = storm.get("id")
        name = storm.get("name")
        basin = storm.get("basin")
        for pt in storm.get("forecast", []):
            # Fields may include lat, lon, time, wind, pressure, stage
            try:
                rows.append(
                    {
                        "storm_id": sid,
                        "storm_name": name,
                        "basin": basin,
                        "time": pd.to_datetime(pt.get("time")),
                        "lat": float(pt.get("lat")),
                        "lon": float(pt.get("lon")),
                        "wind_kt": float(pt.get("wind", np.nan)),
                        "pressure_mb": float(pt.get("pressure", np.nan)),
                        "stage": pt.get("stage"),
                    }
                )
            except Exception:
                continue
    if not rows:
        return pd.DataFrame()
    df = pd.DataFrame(rows).sort_values("time")
    return df


def nhc_forecast_horizon_distances(
    lat: float,
    lon: float,
    storms: pd.DataFrame,
    horizons_days: Tuple[int, ...] = (1, 2, 3, 4, 5),
) -> pd.Series:
    """
    Dado os pontos de previsão de tempestades do NHC, calcula a distância mínima
    para cada horizonte (D+1 a D+5) em relação à localização atual.

    Args:
        lat (float): Latitude do ponto de interesse.
        lon (float): Longitude do ponto de interesse.
        storms (pd.DataFrame): DataFrame contendo os pontos de previsão das tempestades (com 'time','lat','lon').
        horizons_days (Tuple[int, ...]): Tupla de dias de horizonte para cálculo da distância.

    Returns:
        pd.Series: Série com as distâncias mínimas para cada horizonte,
                   com chaves como 'NHC_distance_km_D1'.
                   Retorna NaNs se não houver tempestades ou pontos de previsão.
    """
    out: Dict[str, float] = {}
    if storms is None or storms.empty or "time" not in storms:
        for h in horizons_days:
            out[f"NHC_distance_km_D{h}"] = np.nan
        return pd.Series(out)
    now = pd.Timestamp.utcnow().tz_localize(None)
    df = storms.copy()
    df["time"] = pd.to_datetime(df["time"]).dt.tz_localize(None)
    for h in horizons_days:
        target = (now + pd.Timedelta(days=h)).normalize()
        # pick points within target day
        mask = (df["time"] >= target) & (df["time"] < target + pd.Timedelta(days=1))
        sub = df.loc[mask]
        if sub.empty:
            out[f"NHC_distance_km_D{h}"] = np.nan
        else:
            dmins = [
                _haversine_km(lat, lon, float(r["lat"]), float(r["lon"])) for _, r in sub.iterrows()
            ]
            out[f"NHC_distance_km_D{h}"] = float(np.min(dmins)) if dmins else np.nan
    return pd.Series(out)
