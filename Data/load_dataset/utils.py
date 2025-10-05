import datetime as dt
import math
import requests
from typing import Optional


def _to_yyyymmdd(d: dt.date | dt.datetime | str) -> str:
    if isinstance(d, str):
        return d
    if isinstance(d, dt.datetime):
        d = d.date()
    return d.strftime("%Y%m%d")


def _to_iso_z(dt_like: dt.date | dt.datetime | str) -> str:
    if isinstance(dt_like, str):
        # best-effort parse
        if len(dt_like) == 8 and dt_like.isdigit():
            return f"{dt_like[:4]}-{dt_like[4:6]}-{dt_like[6:]}T00:00:00Z"
        return f"{dt_like}"
    if isinstance(dt_like, dt.date) and not isinstance(dt_like, dt.datetime):
        return dt_like.strftime("%Y-%m-%dT00:00:00Z")
    if isinstance(dt_like, dt.datetime):
        return dt_like.strftime("%Y-%m-%dT%H:%M:%SZ")
    raise ValueError("Unsupported date type")


def _safe_get(url: str, timeout: int = 60) -> Optional[requests.Response]:
    try:
        r = requests.get(url, timeout=timeout)
        r.raise_for_status()
        return r
    except Exception:
        return None


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c
