import pandas as pd
import numpy as np

from endpoints import Endpoints

def fetch_mei_v2_data(endpoints: Endpoints = Endpoints()) -> pd.DataFrame:
    """
    Carrega o Índice Multivariado do ENSO (MEI.v2) da NOAA/PSL do arquivo de dados direto.
    Utiliza uma lógica de leitura ultra-robusta com filtragem de NaNs, sem try/except.

    Args:
        endpoints (Endpoints): Objeto contendo os URLs dos endpoints das APIs.

    Returns:
        pd.DataFrame: DataFrame com os dados do MEI.v2.
    """
    url_data = endpoints.mei_v2_data

    # 1. Leitura Inicial Robusta:
    # Usamos delim_whitespace e engine='python' para lidar com o formato de texto.
    df_mei = pd.read_csv(
        url_data,
        sep='\s+', # Usa espaço como delimitador (substitui delim_whitespace)
        header=None,
        skiprows=1,
        engine='python',
        skipfooter=15
    )

    # 2. Renomear e Derreter (melt) o DataFrame:
    # O arquivo tem 13 colunas: Ano + Meses (1 a 12).
    col_names = ['YEAR'] + [str(i).zfill(2) for i in range(1, 13)]

    # Forçamos a atribuição dos nomes, ignorando colunas extras se houver (o melt vai ignorá-las).
    df_mei.columns = col_names[:df_mei.shape[1]]

    # Derreter o DataFrame para ter uma coluna de 'Mês' e uma de 'Valor'.
    df_mei = df_mei.melt(
        id_vars=['YEAR'],
        var_name='MON',
        value_name='MEI_V2'
    )

    # 3. Coerção e Remoção de Lixo (Filtro Principal):
    # Coerça o valor para número. Qualquer lixo de texto (que causou o erro) vira NaN.
    df_mei['MEI_V2'] = pd.to_numeric(df_mei['MEI_V2'], errors='coerce')
    df_mei = df_mei.dropna(subset=['MEI_V2'])

    # Garante que os valores de Mês e Ano sejam válidos e converte para int
    df_mei['MON'] = pd.to_numeric(df_mei['MON'], errors='coerce')
    df_mei = df_mei.dropna(subset=['MON'])
    df_mei = df_mei[df_mei['MON'].between(1, 12, inclusive='both')]

    df_mei['YEAR'] = df_mei['YEAR'].astype(int)
    df_mei['MON'] = df_mei['MON'].astype(int)

    # 4. Construção da Data:
    df_mei['Date_String'] = (
        df_mei['YEAR'].astype(str) + '-' +
        df_mei['MON'].astype(str).str.zfill(2) + '-01'
    )
    df_mei['Data'] = pd.to_datetime(df_mei['Date_String'], format="%Y-%m-%d")

    # 5. Finalização do DataFrame:
    df_final = df_mei.set_index('Data')[['MEI_V2']].sort_index()

    print("✅ Dados do Índice MEI.v2 carregados com sucesso (Solução Final):")
    print(df_final.tail())
    return df_final
