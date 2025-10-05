# Projeto de Previsão Climática para Uberlândia (MG)

Este repositório contém notebooks e scripts desenvolvidos para a previsão de variáveis climáticas para a cidade de Uberlândia, Minas Gerais, utilizando modelos de Machine Learning. O projeto é dividido em etapas de estudo e validação de modelos e, posteriormente, na produtização para gerar bases de dados futuras para uso em aplicações.

---

## 1. Estudo das Soluções: Construção e Avaliação de Modelos com Dados Históricos

Nesta fase inicial, o foco foi na construção e avaliação de diferentes abordagens de modelagem para prever variáveis climáticas. Os notebooks `train_and_forecast_diario.ipynb` e `train_and_forecast_longo_prazo.ipynb` detalham este processo.

### Preparação e Engenharia de Atributos

Ambos os modelos (curto e longo prazo) compartilham uma fase robusta de preparação e engenharia de atributos:

- **Aquisição de Dados**: Coleta de dados climáticos históricos do NASA POWER (MultiLocation) e índices climáticos como SOI (Southern Oscillation Index) e ONI (Oceanic Niño Index).
- **Lags Temporais**: Criação de variáveis defasadas (lags) para as variáveis climáticas e os índices SOI/ONI, permitindo que o modelo capture dependências temporais.
- **Sazonalidade**: Extração de atributos de tempo como mês, dia do ano, dia da semana, semana do ano, e suas representações senoidais e cossenoidais para modelar padrões sazonais anuais e semanais.
- **Filtragem por Localização**: O dataset é filtrado para incluir apenas os dados de Uberlândia, mas a metodologia pode ser replicada para outras cidades.

---

## 2. Produtização e Geração de Base Futura

O notebook `gerar_base_uberlandia.ipynb` é a fase de "produtização". Ele utiliza o modelo treinado com a maior quantidade de dados históricos disponível para gerar previsões futuras que serão consumidas por uma aplicação (APP).

- **Treinamento Abrangente**: Os modelos são treinados com dados até a data mais recente disponível (e.g., 2 de outubro de 2025), garantindo que a previsão seja baseada no conhecimento mais atualizado.
- **Previsão Recorrente**: Para a geração da base futura, a previsão é feita de forma recorrente/recursiva. A previsão de um dia é usada como entrada para a previsão do dia seguinte, permitindo gerar uma série de previsões para os próximos meses (e.g., seis meses).
- **Saída para o APP**: As previsões geradas são salvas em arquivos CSV na pasta `forecast/` para serem facilmente integradas a aplicações externas.

---

## 3. Modelagem de Curto Prazo (Previsão Diária)

O notebook `train_and_forecast_diario.ipynb` explora a previsão de variáveis climáticas com um foco em **curto prazo**, tipicamente prevendo as condições para o próximo dia.

- **Objetivo**: Simular um cenário operacional real de previsão diária.
- **Metodologia**: Utiliza modelos XGBoost treinados para cada variável alvo (temperatura máxima, mínima e média, umidade relativa e velocidade do vento). O dataset é dividido em base de treino (2020-2024) e validação (Janeiro-Junho 2025).
- **Avaliação**: A performance é avaliada usando métricas como o Root Mean Squared Error (RMSE).

### Resultados do Modelo Diário

Abaixo estão exemplos de gráficos gerados pelo `train_and_forecast_diario.ipynb` que comparam os valores reais com as previsões para as variáveis climáticas:

#### Temperatura Média (T2M)
![Comparação de Temperatura Média (T2M) - Curto Prazo](versao_atualizada/daily_forecast_t2m.png)
_Substituir pela imagem real do gráfico de T2M_

#### Temperatura Máxima (T2M_MAX)
![Comparação de Temperatura Máxima (T2M_MAX) - Curto Prazo](versao_atualizada/daily_forecast_t2m_max.png)
_Substituir pela imagem real do gráfico de T2M_MAX_

#### Temperatura Mínima (T2M_MIN)
![Comparação de Temperatura Mínima (T2M_MIN) - Curto Prazo](versao_atualizada/daily_forecast_t2m_min.png)
_Substituir pela imagem real do gráfico de T2M_MIN_

#### Umidade Relativa (RH2M)
![Comparação de Umidade Relativa (RH2M) - Curto Prazo](versao_atualizada/daily_forecast_rh2m.png)
_Substituir pela imagem real do gráfico de RH2M_

#### Velocidade do Vento (WS2M)
![Comparação de Velocidade do Vento (WS2M) - Curto Prazo](versao_atualizada/daily_forecast_ws2m.png)
_Substituir pela imagem real do gráfico de WS2M_

---

## 4. Modelagem de Longo Prazo

O notebook `train_and_forecast_longo_prazo.ipynb` e `gerar_base_uberlandia.ipynb` são dedicados à previsão de **longo prazo**, projetando as condições climáticas para os próximos meses.

- **Objetivo**: Prever as condições para um período estendido (e.g., seis meses à frente).
- **Metodologia**: Assim como no modelo de curto prazo, utiliza XGBoost com feature engineering avançado. A diferença crucial é o horizonte de previsão e a estratégia recorrente. O modelo é treinado até um ponto no tempo (e.g., final de 2024) e, em seguida, gera previsões para o período seguinte (e.g., primeiros seis meses de 2025) de forma recursiva, onde cada previsão é realimentada como entrada para a próxima.
- **Aplicação**: Essas previsões são a base para a criação de uma base de dados futura que alimenta o APP, permitindo a visualização antecipada das condições climáticas.

---

Este projeto demonstra uma abordagem completa para o desenvolvimento de modelos de previsão climática, desde o estudo e validação até a produtização para uso em aplicações.
