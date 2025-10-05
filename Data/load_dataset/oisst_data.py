import io
import pandas as pd
import datetime as dt

from endpoints import Endpoints
from .utils import _to_iso_z, _safe_get

def _build_oisst_url(base: str, dsid: str, lat: float, lon: float, start_iso: str, end_iso: str) -> str:
    # griddap CSV query for point time series
    # Format: {base}/griddap/{dsid}.csv?sst[(start):1:(end)][(lat)][(lon)]
    # Time must be ISO8601 Z; lat/lon numeric selects nearest grid
    return f"{base}/griddap/{dsid}.csv?time,lat,lon,sst[{start_iso}:1:{end_iso}][({lat})][({lon})]"


def fetch_oisst_sst(
    lat: float,
    lon: float,
    start: dt.date | dt.datetime | str,
    end: dt.date | dt.datetime | str,
    endpoints: Endpoints = Endpoints(),
) -> pd.DataFrame:
    """
    Busca dados de temperatura da superfície do mar (SST) do NOAA ERDDAP OISST.

    Args:
        lat (float): Latitude do ponto de interesse.
        lon (float): Longitude do ponto de interesse.
        start (dt.date | dt.datetime | str): Data de início da busca.
        end (dt.date | dt.datetime | str): Data de fim da busca.
        endpoints (Endpoints): Objeto contendo os URLs dos endpoints das APIs.

    Returns:
        pd.DataFrame: DataFrame com os dados de SST.
    """
    start_iso = _to_iso_z(start)
    end_iso = _to_iso_z(end)
    for base in endpoints.erddap_bases:
        for dsid in endpoints.oisst_ids:
            url = _build_oisst_url(base, dsid, lat, lon, start_iso, end_iso)
            r = _safe_get(url)
            if r is None:
                continue
            try:
                df = pd.read_csv(io.StringIO(r.text))
                cols_lower = {c.lower(): c for c in df.columns}
                # Find time column flexibly (e.g., 'time', 'time (utc)')
                time_col = None
                for c in df.columns:
                    cl = c.lower()
                    if cl.startswith("time"):
                        time_col = c
                        break
                # Find sst column (e.g., 'sst', 'sst (degree_c)')
                sst_col = None
                for c in df.columns:
                    cl = c.lower()
                    if cl.startswith("sst"):
                        sst_col = c
                        break
                if time_col is None or sst_col is None:
                    continue
                df["date"] = pd.to_datetime(df[time_col], errors="coerce").dt.tz_localize(None).dt.normalize()
                df = df.dropna(subset=["date"]).set_index("date").sort_index()
                out = df[[sst_col]].rename(columns={sst_col: "SST_OISST"})
                # Convert from Kelvin if needed; OISST is in °C already
                return out
            except Exception:
                continue
    return pd.DataFrame(index=pd.to_datetime([]), columns=["SST_OISST"]).astype(float)
