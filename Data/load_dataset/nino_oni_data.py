import pandas as pd
import numpy as np
import io
from endpoints import Endpoints


def fetch_nino34_oni_data(endpoints: Endpoints = Endpoints()) -> pd.DataFrame:
    """
    Carrega o Índice Oceânico Niño (ONI), que é a anomalia de TSM na região Niño 3.4.
    
    O ONI é o componente oceânico (calor) do El Niño e é a métrica oficial de classificação.
    O índice é dado como uma média móvel de 3 meses.
    
    Fonte de Dados: NOAA Climate Prediction Center (CPC).
    
    Args:
        endpoints (Endpoints): Objeto contendo os URLs dos endpoints das APIs.

    Returns:
        pd.DataFrame: DataFrame indexado por data com a coluna 'ANOM' (anomalia em °C).
        
    Colunas de Saída Chave:
        - Data (Index): O ponto central da média de 3 meses.
        - ANOM: Anomalia da TSM na região Niño 3.4 (o sinal preditivo).
    """
    
    # URL: Arquivo de texto do Índice Niño 3.4 (ONI)
    url_data = endpoints.nino34_oni_data

    # 1. Leitura e Limpeza Inicial:
    # O arquivo ONI é limpo no cabeçalho e rodapé.
    df_nino = pd.read_csv(
        url_data,
        sep='\s+',             
        skiprows=1,            # Pula a linha inicial de cabeçalho
        header=None,           
        engine='python',
        skipfooter=2,          # Pula notas de rodapé
        names=['SEAS', 'YR', 'TOTAL', 'ANOM'] # Nomes baseados no formato que você visualizou
    )
    
    # 2. Coerção e Remoção de Lixo:
    df_nino['YR'] = pd.to_numeric(df_nino['YR'], errors='coerce')
    df_nino['ANOM'] = pd.to_numeric(df_nino['ANOM'], errors='coerce')

    df_nino = df_nino.dropna(subset=['YR', 'ANOM'])
    df_nino['YR'] = df_nino['YR'].astype(int)
    
    # 3. Mapeamento de Mês (Criação do Ponto Central da Data):
    # ONI é uma média de 3 meses. A data é convencionalmente mapeada para o mês central.
    month_mapping = {
        'DJF': 1, 'JFM': 2, 'FMA': 3, 'MAM': 4, 'AMJ': 5, 'MJJ': 6,
        'JJA': 7, 'JAS': 8, 'ASO': 9, 'SON': 10, 'OND': 11, 'NDJ': 12
    }
    df_nino['MON'] = df_nino['SEAS'].map(month_mapping)
    
    # 4. Construção da Data (Robusta):
    df_nino['Date_String'] = (
        df_nino['YR'].astype(str) + '-' + 
        df_nino['MON'].astype(str).str.zfill(2) + '-01'
    )
    df_nino['Data'] = pd.to_datetime(df_nino['Date_String'], format="%Y-%m-%d")
    
    # 5. Finalização do DataFrame:
    df_final = df_nino.set_index('Data')[['ANOM']].sort_index()
    
    return df_final
