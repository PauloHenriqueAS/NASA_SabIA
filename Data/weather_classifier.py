
import pandas as pd
import os

class WeatherClassifier:
    def __init__(self, forecast_folder="forecast/", city_name="Uberlândia", latitude=-18.9186, longitude=-48.2772):
        self.forecast_folder = forecast_folder
        self.data = {}
        self.city_name = city_name
        self.latitude = latitude
        self.longitude = longitude
        self._load_data()

    def _load_data(self):
        files = [
            "forecast_RH2M.csv",
            "forecast_T2M_MAX.csv",
            "forecast_T2M_MIN.csv",
            "forecast_T2M.csv",
            "forecast_WS2M.csv",
        ]
        for file in files:
            path = os.path.join(self.forecast_folder, file)
            if os.path.exists(path):
                df = pd.read_csv(path, index_col=0)
                # Extrair o nome da variável do nome do arquivo (ex: RH2M, T2M_MAX)
                var_name = file.replace("forecast_", "").replace(".csv", "")
                self.data[var_name] = df
            else:
                print(f"Aviso: O arquivo {path} não foi encontrado.")

    def classify_weather(self):
        # Esta função conterá a lógica para classificar o tempo
        # Com base nos dados carregados, definiremos as regras para:
        # "very hot", "very cold", "very windy", "very wet", "very uncomfortable"
        
        # Exemplo de como acessar os dados (você precisará desenvolver a lógica aqui)
        # if "T2M_MAX" in self.data:
        #     print("Temperatura Máxima (T2M_MAX):")
        #     print(self.data["T2M_MAX"].head())
        
        # Lógica de classificação será adicionada aqui
        results = pd.DataFrame(index=next(iter(self.data.values())).index) # Use o índice de um dos dataframes como base
        results['date'] = self.data['T2M']['date'] # Adiciona a coluna de data

        # Adicionar as colunas de previsão de temperatura, vento e umidade
        if 'T2M' in self.data:
            results['T2M_prediction'] = self.data['T2M']['prediction']
        if 'T2M_MAX' in self.data:
            results['T2M_MAX_prediction'] = self.data['T2M_MAX']['prediction']
        if 'T2M_MIN' in self.data:
            results['T2M_MIN_prediction'] = self.data['T2M_MIN']['prediction']
        if 'WS2M' in self.data:
            results['WS2M_prediction'] = self.data['WS2M']['prediction']
        if 'RH2M' in self.data:
            results['RH2M_prediction'] = self.data['RH2M']['prediction']

        if 'T2M_MAX' in self.data:
            results['very_hot'] = self.data['T2M_MAX']['prediction'].apply(self.is_very_hot)
        if 'T2M_MIN' in self.data:
            results['very_cold'] = self.data['T2M_MIN']['prediction'].apply(self.is_very_cold)
        if 'WS2M' in self.data:
            results['very_windy'] = self.data['WS2M']['prediction'].apply(self.is_very_windy)
        if 'RH2M' in self.data:
            results['very_wet'] = self.data['RH2M']['prediction'].apply(self.is_very_wet)
        if 'T2M' in self.data and 'RH2M' in self.data:
            results['very_uncomfortable'] = [
                self.is_very_uncomfortable(t2m_pred, rh2m_pred)
                for t2m_pred, rh2m_pred in zip(
                    self.data['T2M']['prediction'],
                    self.data['RH2M']['prediction']
                )
            ]

        # Adicionar a classe "Normal" se nenhuma das outras condições for verdadeira
        # Certifique-se de que todas as colunas de classificação existam para evitar KeyError
        classification_cols = ['very_hot', 'very_cold', 'very_windy', 'very_wet', 'very_uncomfortable']
        for col in classification_cols:
            if col not in results.columns:
                results[col] = False # Inicializa com False se a coluna não existe (ex: dados faltando)

        results['normal'] = ~results[classification_cols].any(axis=1)

        # Criar a nova coluna de classificação textual
        def get_classification_text(row):
            active_classifications = [col for col in classification_cols if row[col]]
            if row['normal']:
                active_classifications.append("normal")
            return ", ".join(active_classifications) if active_classifications else "Não Classificado"

        results['classification'] = results.apply(get_classification_text, axis=1)

        # Adicionar as novas colunas de cidade e coordenadas
        results['city_name'] = self.city_name
        results['latitude'] = self.latitude
        results['longitude'] = self.longitude

        # Selecionar as colunas 'date', 'classification', 'city_name', 'latitude', 'longitude' e as novas colunas de previsão para o retorno
        return results[['date', 'classification', 'city_name', 'latitude', 'longitude', 'T2M_prediction', 'T2M_MAX_prediction', 'T2M_MIN_prediction', 'WS2M_prediction', 'RH2M_prediction']]

    # Métodos para definir as condições específicas
    def is_very_hot(self, t2m_max):
        # Exemplo: Muito quente se T2M_MAX > 30
        return t2m_max > 30

    def is_very_cold(self, t2m_min):
        # Exemplo: Muito frio se T2M_MIN < 10
        return t2m_min < 10

    def is_very_windy(self, ws2m):
        # Exemplo: Muito ventoso se WS2M > 10
        return ws2m > 10

    def is_very_wet(self, rh2m):
        # Exemplo: Muito úmido se RH2M > 90
        return rh2m > 90

    def is_very_uncomfortable(self, t2m, rh2m):
        # Exemplo: Muito desconfortável se T2M > 28 e RH2M > 80
        return t2m > 28 and rh2m > 80


# Exemplo de uso (opcional, pode ser removido ou movido para um script de teste)
if __name__ == "__main__":
    classifier = WeatherClassifier()
    
    print("\nClassificando o tempo com base nas previsões:")
    classified_results = classifier.classify_weather()
    print(classified_results.head())

    # Exemplo de acesso aos dados carregados
    if "T2M_MAX" in classifier.data:
        print("Dados de Temperatura Máxima carregados:")
        print(classifier.data["T2M_MAX"].head())
    
    if "RH2M" in classifier.data:
        print("\nDados de Umidade Relativa carregados:")
        print(classifier.data["RH2M"].head())

    # Exemplo de uso das funções de classificação (com valores de exemplo)
    print(f"É muito quente (32C)? {classifier.is_very_hot(32)}")
    print(f"É muito frio (5C)? {classifier.is_very_cold(5)}")
    print(f"Está muito ventoso (12m/s)? {classifier.is_very_windy(12)}")
    print(f"Está muito úmido (95%)? {classifier.is_very_wet(95)}")
    print(f"Está muito desconfortável (30C, 85%)? {classifier.is_very_uncomfortable(30, 85)}")
