from dataclasses import dataclass
from typing import Tuple

@dataclass
class Endpoints:
    power_base: str = "https://power.larc.nasa.gov/api/temporal/daily/point"
    # Try multiple ERDDAP mirrors/datasets for OISST
    erddap_bases: Tuple[str, ...] = (
        "https://www.ncei.noaa.gov/erddap",  # NCEI ERDDAP
        "https://coastwatch.pfeg.noaa.gov/erddap",  # CoastWatch fallback
        "https://upwell.pfeg.noaa.gov/erddap",
        "https://oceanwatch.pifsc.noaa.gov/erddap",
    )
    # Common OISST dataset ids
    oisst_ids: Tuple[str, ...] = (
        "nceiOisst2Agg",       # reprocessed
        "nceiOisst2NrtAgg",    # near-real-time
        "ncdcOisst2Agg",       # legacy id on some servers
    )
    nhc_current_storms: str = "https://www.nhc.noaa.gov/CurrentStorms.json"
    # IBTrACS v04r00 CSV (ALL basins)
    ibtracs_all_csv: str = (
        "https://www.ncei.noaa.gov/data/international-best-track-archive-for-"
        "climate-stewardship-ibtracs/v04r00/access/csv/ibtracs.ALL.list.v04r00.csv"
    )
    # Open-Meteo forecast (GFS/ICON/ECMWF blends) - no key required
    open_meteo_base: str = "https://api.open-meteo.com/v1/forecast"
    open_meteo_marine_base: str = "https://marine-api.open-meteo.com/v1/marine"
    soi_data: str = "https://www.cpc.ncep.noaa.gov/data/indices/soi"
    mei_v2_data: str = "https://psl.noaa.gov/enso/mei/data/meiv2.data"
    nino34_oni_data: str = "https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt"
