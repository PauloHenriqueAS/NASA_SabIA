# NASA_SabIA

# 🐦 SabIA – Will it rain on my parade
## 🌤️ About the project
SabIA is a web and mobile application that transforms meteorological information into a visual, educational, and entertaining experience.

The idea is simple: an intelligent thrush bird reacts to real-time weather conditions, changing its appearance and behavior according to the detected climate.

More than just displaying numerical data, SabIA helps the user understand what the weather really means — whether the day is too hot, too cold, too humid, or simply uncomfortable.

💬 “It’s very hot today! Drink plenty of water and wear sunscreen!”

SabIA aims to bring convenience to the hectic urban life as well as to the cyclical life in the countryside. In large cities, even a small change in the weather can delay traffic, cause flooding, and disrupt outdoor events. In rural areas, however, the weather governs the entire production cycle it is crucial to know in advance when the rainy season will begin in order to plan the best time to plant and harvest, as well as to organize the logistics of purchasing seeds and transporting the crops.

To achieve this goal, the heart of SabIA is powered by an AI agent trained on historical climate data collected by NASA’s high-tech equipment. This intelligent agent is capable of predicting future weather conditions all that’s needed is to provide the date you want to forecast.

### Our Mascot – The SabIA 🐦

|![Sabia](https://github.com/user-attachments/assets/f17adcef-048a-41be-887a-dd4872725bd8)|A wise and curious little bird, native to Parque do Sabiá, who has always observed nature and the weather around him. One day, he decided to learn about Machine Learning to forecast the weather and help the residents of Uberlândia — and now, people all over the world. It represents the harmony between nature and artificial intelligence, combining reliable data from NASA satellites with an intuitive and secure interface designed to take care of you.|
|---------------------------------|----------------------------------------------------------------------------|

---

## 📱 Platforms

### 🌐 Web App – accessible via browser on any device.

### 📲 Mobile App – ersion adapted for Android and iOS (PWA or native app).
---

## 🎯 Objectives

→ Make weather monitoring more human and intuitive by combining

→ Data science and AI (for classifying weather types and forecasting temperatures up to 6 months ahead).

→ Empathetic design (animated character).

→ Accessibility and natural language.

---

## 🌎 Main Features

| Feature                          | Description                                                                 |
|---------------------------------|----------------------------------------------------------------------------|
| 🔍 **Location search**       | Allows searching for cities, neighborhoods, or tourist attractions.                  |
| 🌡️ **Current weather display**   | Displays temperature, thermal sensation, humidity, and wind.                    |
| 🌡️ **Future weather display**   | Uses an AI-powered model to predict future weather data. |
| 🐦 **Interactive character (SabIA)** | Changes appearance according to the detected weather type.                    |
| 💬 **Contextual message**       | Dynamic message according to the weather type.            |
| 🎨 **Dynamic theme**             | Colors and icons adapt to the weather type.                          |
| 📱 **Responsive layout**         | Seamless experience on desktop and mobile devices.                       |

---

## 🐦 Weather types and SabIA’s behavior

| Weather Type       | SabIA’s Appearance                         | Example Message                                    |
|----------------------|---------------------------------------------|--------------------------------------------------------|
| ☀️ **Very Hot**       | Wearing sunglasses and sweating | “It’s very hot stay hydrated!”            |
| ❄️ **old**      |Wearing a scarf and beanie                       |“It’s cold! Dress warmly and avoid staying out in the open.”    |
| 💨 **Windy**     | Disheveled, holding a hat           | “Windy day  be careful with light objects!”               |
| 🌧️ **Humid**       | Casual clothes with a towel                  | “It’s going to rain don’t forget your umbrella!”              |
| 😓 **Uncomfortable** | Sweating and exhausted                       | “The weather is tough today take some rest and cool down.”    |
| 😎 **Summer Hot** | Beachwear and holding a cup                      | “It’s going to be very hot today make sure to stay hydrated and protect yourself from the sun!”   |
| 🌧️ **Rain** | Holding an umbrella                        | “It’s cloudy and it might rain! Take an umbrella and don’t forget to close your windows before leaving.”   |

 | ![Gif 1](./frontend/img/gifs/bird-cold.gif) | ![Gif 2](./frontend/img/gifs/bird-humid.gif) | ![Gif 3](./frontend/img/gifs/bird-rain.gif) | ![Gif 4](./frontend/img/gifs/bird-summer-heat.gif) |
|----------------------------------------|----------------------------------------|----------------------------------------|----------------------------------------|
| ![Gif 5](./frontend/img/gifs/bird-uncomfortable.gif) | ![Gif 6](./frontend/img/gifs/bird-very-hot.gif) | ![Gif 7](./frontend/img/gifs/bird-windy.gif) |                                        |

---

## 🧠 Weather Classification (example logic)

| Weather Type        | Simplified Criterion                                       |
|--------------------------|--------------------------------------------------------------|
| ☀️ **Very Hot**          | Temperature > 35 °C and humidity < 60 %                       |
| ❄️ **Cold**         | Temperature < 10 °C                                      |
| 🌧️ **Humid**          | Humidity > 80 %                |
| 💨 **Windy**        | Wind speed > 60 km/h                                |
| 😓 **Uncomfortable**| High heat index (high temperature + high humidity)    |
| 😎 **Summer Hot**| Moderate temperature and no precipitation    
| 🌧️ **Rain**| High rainfall precipitation   

These criteria are defined based on a global consensus.

---

## 🧩 Front-End
abIA’s front end is entirely built using HTML, CSS, and JavaScript, enabling a responsive, user-friendly, and easily accessible experience.

The front end is responsive; our mascot adapts to the current weather by dressing appropriately and giving tips to the user.

The platform is available in three languages  **Portuguese**, **English**, and **Spanish** and allows users to check the weather for any location on the planet. Our front end provides all the basic weather forecast data such as maximum and minimum temperature, relative humidity, wind speed, and probability of precipitation.

The frontend is integrated with an AI-powered API capable of making predictions of future climate data. In addition, the API also provides current climate data that are displayed by default on the interface panel.

---

## 🛠️ Front-End Technologies

→ Html

→ CSS

→Javascript

→ PWA (Progressive Web App) for offline use and mobile installation

---

## 🧩 Back-End

SabIA's backend consists of two main blocks: the first is the prediction model, fed with [NASA data] containing historical climatic data such as precipitation, events like _El Niño_ and _La Niña_, and tropical cyclones. The model construction is described in the next section.

The other block is an API system capable of fetching real-time climatic data, as well as requesting future weather predictions from the machine learning model at the heart of SabIA.

The API is entirely built in Python using the FastAPI framework, exposing the following endpoints to the frontend, which are used to build the tool's panel.

[list of endpoints]

---

## 🛠️ Back-End Technologies

→ Python.

→ FastAPI.

→ [AI tools].

---

## 📊 Data Science Study: Weather Forecasting

This section delves into the core data science initiatives driving SabIA's predictive capabilities, specifically focusing on building robust Machine Learning models for time series forecasting of key climatic variables such as Temperature (mean, max, min), Humidity, and Wind speed for Uberlândia, Minas Gerais.

The project encompasses several crucial stages:

*   **Model Construction and Evaluation**: Initial phase focused on building and validating diverse modeling approaches using historical data.
*   **Data Preparation and Feature Engineering**: A robust phase involving the acquisition of historical climatic data from sources like NASA POWER, along with climatic indices (SOI, ONI). This includes creating temporal lags to capture dependencies and extracting seasonality features (month, day of year, week of year, etc.).
*   **Short-Term Modeling (Daily Forecast)**: Utilizes XGBoost models to predict daily conditions, simulating real operational scenarios.
*   **Long-Term Modeling**: Focuses on projecting climatic conditions several months ahead using a recurrent forecasting strategy, where each day's prediction informs the next.

For a comprehensive overview of the models, detailed data preparation, and evaluation metrics, please refer to the [Data README](./Data/README.md).

---

## 📸 Visual Example

City: São Paulo - Brazil
![Minha imagem](./image.png)








