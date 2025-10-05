from dataclasses import dataclass
import pandas as pd
import datetime as dt
from typing import Optional, List, Tuple

from endpoints import Endpoints

# Importar as funções de busca de dados
from load_dataset.soi_data import fetch_soi_data
from load_dataset.power_data import fetch_power_daily
from load_dataset.oisst_data import fetch_oisst_sst
from load_dataset.nhc_data import fetch_nhc_current_storms, nhc_forecast_horizon_distances
from load_dataset.ibtracs_data import fetch_ibtracs_all, compute_min_distance_to_ibtracs
from load_dataset.open_meteo_data import fetch_open_meteo_daily_forecast, fetch_open_meteo_marine_sst
from load_dataset.mei_data import fetch_mei_v2_data
from load_dataset.nino_oni_data import fetch_nino34_oni_data


class DataLoader:
    """
    Classe responsável por carregar diferentes tipos de dados meteorológicos e climáticos
    a partir de diversas fontes. Cada método corresponde a um tipo específico de dado
    e utiliza as funções de busca de dados apropriadas.
    """
    def __init__(self, endpoints: Endpoints = Endpoints()):
        """
        Inicializa o DataLoader com os endpoints das APIs.

        Args:
            endpoints (Endpoints): Objeto contendo os URLs dos endpoints das APIs.
        """
        self.endpoints = endpoints

    def load_soi_data(self) -> pd.DataFrame:
        """
        Carrega os dados do Índice de Oscilação Sul (SOI).

        Returns:
            pd.DataFrame: DataFrame contendo os dados do SOI.
        """
        return fetch_soi_data(endpoints=self.endpoints)

    def load_mei_v2_data(self) -> pd.DataFrame:
        """
        Carrega o Índice Multivariado do ENSO (MEI.v2).

        Returns:
            pd.DataFrame: DataFrame contendo os dados do MEI.v2.
        """
        return fetch_mei_v2_data(endpoints=self.endpoints)

    def load_power_daily_data(
        self,
        lat: float,
        lon: float,
        start: dt.date | dt.datetime | str,
        end: dt.date | dt.datetime | str,
        params: Optional[List[str]] = None,
    ) -> pd.DataFrame:
        """
        Carrega os dados diários da NASA POWER.

        Args:
            lat (float): Latitude do ponto de interesse.
            lon (float): Longitude do ponto de interesse.
            start (dt.date | dt.datetime | str): Data de início da busca.
            end (dt.date | dt.datetime | str): Data de fim da busca.
            params (Optional[List[str]]): Lista de parâmetros a serem buscados.

        Returns:
            pd.DataFrame: DataFrame com os dados diários da NASA POWER.
        """
        return fetch_power_daily(lat, lon, start, end, params, endpoints=self.endpoints)

    def load_oisst_sst_data(
        self,
        lat: float,
        lon: float,
        start: dt.date | dt.datetime | str,
        end: dt.date | dt.datetime | str,
    ) -> pd.DataFrame:
        """
        Carrega os dados de temperatura da superfície do mar (SST) do NOAA ERDDAP OISST.

        Args:
            lat (float): Latitude do ponto de interesse.
            lon (float): Longitude do ponto de interesse.
            start (dt.date | dt.datetime | str): Data de início da busca.
            end (dt.date | dt.datetime | str): Data de fim da busca.

        Returns:
            pd.DataFrame: DataFrame com os dados de SST.
        """
        return fetch_oisst_sst(lat, lon, start, end, endpoints=self.endpoints)

    def load_nhc_current_storms_data(self) -> pd.DataFrame:
        """
        Carrega informações sobre tempestades tropicais ativas do NHC.

        Returns:
            pd.DataFrame: DataFrame com informações sobre as tempestades ativas.
        """
        return fetch_nhc_current_storms(endpoints=self.endpoints)

    def load_nhc_forecast_horizon_distances(
        self,
        lat: float,
        lon: float,
        storms: pd.DataFrame,
        horizons_days: Tuple[int, ...] = (1, 2, 3, 4, 5),
    ) -> pd.Series:
        """
        Calcula a distância mínima para cada horizonte de previsão de tempestades do NHC.

        Args:
            lat (float): Latitude do ponto de interesse.
            lon (float): Longitude do ponto de interesse.
            storms (pd.DataFrame): DataFrame com os pontos de previsão das tempestades.
            horizons_days (Tuple[int, ...]): Tupla de dias de horizonte para cálculo da distância.

        Returns:
            pd.Series: Série com as distâncias mínimas para cada horizonte.
        """
        return nhc_forecast_horizon_distances(lat, lon, storms, horizons_days)

    def load_ibtracs_all_data(self) -> pd.DataFrame:
        """
        Carrega o arquivo CSV completo do IBTrACS v04r00 (todas as bacias).

        Returns:
            pd.DataFrame: DataFrame com informações sobre as tempestades históricas.
        """
        return fetch_ibtracs_all(endpoints=self.endpoints)

    def compute_ibtracs_min_distance(
        self,
        lat: float,
        lon: float,
        ib: pd.DataFrame,
        start: dt.date | dt.datetime | str,
        end: dt.date | dt.datetime | str,
    ) -> pd.DataFrame:
        """
        Calcula a distância mínima diária para qualquer tempestade IBTrACS.

        Args:
            lat (float): Latitude do ponto de interesse.
            lon (float): Longitude do ponto de interesse.
            ib (pd.DataFrame): DataFrame com os dados das tempestades IBTrACS.
            start (dt.date | dt.datetime | str): Data de início da janela de busca.
            end (dt.date | dt.datetime | str): Data de fim da janela de busca.

        Returns:
            pd.DataFrame: DataFrame indexado por data com a coluna 'IBTRACS_min_distance_km'.
        """
        return compute_min_distance_to_ibtracs(lat, lon, ib, start, end)

    def load_open_meteo_daily_forecast(
        self,
        lat: float,
        lon: float,
        days: int = 7,
    ) -> pd.DataFrame:
        """
        Carrega a previsão diária de variáveis meteorológicas enriquecidas via Open-Meteo.

        Args:
            lat (float): Latitude do ponto de interesse.
            lon (float): Longitude do ponto de interesse.
            days (int): Número de dias para a previsão.

        Returns:
            pd.DataFrame: DataFrame indexado por data UTC com colunas de previsão diária.
        """
        return fetch_open_meteo_daily_forecast(lat, lon, days, endpoints=self.endpoints)

    def load_open_meteo_marine_sst_forecast(
        self,
        lat: float,
        lon: float,
        days: int = 7,
    ) -> pd.DataFrame:
        """
        Carrega a temperatura da superfície do mar (SST) da previsão marinha do Open-Meteo.

        Args:
            lat (float): Latitude do ponto de interesse.
            lon (float): Longitude do ponto de interesse.
            days (int): Número de dias para a previsão.

        Returns:
            pd.DataFrame: DataFrame indexado por data com a coluna SST_FC.
        """
        return fetch_open_meteo_marine_sst(lat, lon, days, endpoints=self.endpoints)

    def load_nino34_oni_data(self) -> pd.DataFrame:
        """
        Carrega o Índice Oceânico Niño (ONI) - anomalia de TSM na região Niño 3.4.

        Returns:
            pd.DataFrame: DataFrame com as anomalias de TSM do ONI.
        """
        return fetch_nino34_oni_data(endpoints=self.endpoints)
