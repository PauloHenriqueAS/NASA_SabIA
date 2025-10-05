import pandas as pd
import numpy as np
import io
from endpoints import Endpoints # Importar Endpoints de endpoints.py

def fetch_soi_data(endpoints: Endpoints = Endpoints()) -> pd.DataFrame:
    """
    Carrega apenas a segunda seção do arquivo SOI (Dados Padronizados),
    que é o Índice de Oscilação Sul (SOI) que deve ser usado para forecasting.
    """
    url_data = endpoints.soi_data
    
    # 1. Leitura Inicial (Ajustada):
    # O skiprows foi ajustado para pular o cabeçalho, a primeira tabela e o texto intermediário.
    df_soi = pd.read_csv(
        url_data,
        sep='\s+',             
        skiprows=31,           # Salta o cabeçalho e a primeira tabela inteira (aprox. 31 linhas)
        header=None,           
        engine='python',
        skipfooter=6,          # Salta o lixo final e as linhas de média anual
        names=['YEAR', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    )
    
    # 2. Derreter (melt) o DataFrame:
    df_soi = df_soi.melt(
        id_vars=['YEAR'],
        var_name='MON_NAME',
        value_name='SOI'
    )
    
    # 3. Limpeza, Coerção e Filtragem (Lógica idêntica à anterior, mas mais limpa):
    df_soi['SOI'] = pd.to_numeric(df_soi['SOI'], errors='coerce')
    df_soi = df_soi[df_soi['SOI'] != -999.9] # Remove valores ausentes (-999.9)

    df_soi['YEAR'] = pd.to_numeric(df_soi['YEAR'], errors='coerce')
    df_soi = df_soi.dropna(subset=['YEAR', 'SOI'])
    df_soi['YEAR'] = df_soi['YEAR'].astype(int)
    
    # Mapeamento e Data
    month_mapping = {
        'JAN': 1, 'FEB': 2, 'MAR': 3, 'APR': 4, 'MAY': 5, 'JUN': 6,
        'JUL': 7, 'AUG': 8, 'SEP': 9, 'OCT': 10, 'NOV': 11, 'DEC': 12
    }
    df_soi['MON'] = df_soi['MON_NAME'].map(month_mapping)
    
    df_soi['Date_String'] = (
        df_soi['YEAR'].astype(str) + '-' + 
        df_soi['MON'].astype(int).astype(str).str.zfill(2) + '-01'
    )
    df_soi['Data'] = pd.to_datetime(df_soi['Date_String'], format="%Y-%m-%d")
    
    # 4. Finalização do DataFrame:
    df_final = df_soi.set_index('Data')[['SOI']].sort_index()
    
    print("✅ Dados do Índice de Oscilação Sul (SOI Padronizado) carregados com sucesso:")
    print(df_final.tail(12)) # Exibe os últimos 12 meses
    return df_final
