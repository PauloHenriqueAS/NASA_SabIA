// Usar configurações do arquivo config.js
const API_KEY = CONFIG.API_KEY;
const API_BASE_URL = CONFIG.API_BASE_URL;

// Estado da aplicação
let currentWeather = null;
let forecast = null;
let currentCity = CONFIG.DEFAULT_CITY;
let currentLocation = CONFIG.DEFAULT_LOCATION;

// Variáveis do mapa
let weatherMap = null;
let currentMapLayer = 'precipitation_new';
let currentLocationMarker = null;
let isChatOpen = false;
let currentLanguage = 'en';

// Elementos DOM
const elements = {
    citySearch: document.getElementById('citySearch'),
    searchBtn: document.getElementById('searchBtn'),
    currentLocation: document.getElementById('currentLocation'),
    weatherBird: document.getElementById('weatherBird'),
    alertMessage: document.getElementById('alertMessage'),
    currentTemp: document.getElementById('currentTemp'),
    feelsLike: document.getElementById('feelsLike'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('windSpeed'),
    uvIndex: document.getElementById('uvIndex'),
    visibility: document.getElementById('visibility'),
    sevenDayForecast: document.getElementById('sevenDayForecast'),
    precipitationMap: document.getElementById('precipitationMap'),
    togglePrecipitation: document.getElementById('togglePrecipitation'),
    toggleClouds: document.getElementById('toggleClouds'),
    toggleTemperature: document.getElementById('toggleTemperature'),
    aiChatContainer: document.getElementById('aiChatContainer'),
    aiChatBtn: document.getElementById('aiChatBtn'),
    closeChat: document.getElementById('closeChat'),
    chatInput: document.getElementById('chatInput'),
    sendMessage: document.getElementById('sendMessage'),
    chatMessages: document.getElementById('chatMessages'),
    scrollToBottom: document.getElementById('scrollToBottom'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    languageSelect: document.getElementById('languageSelect')
};

// Mapeamento de condições climáticas para emojis do passarinho
const weatherBirdMap = {
    '01d': '🐦', // céu limpo dia
    '01n': '🦉', // céu limpo noite
    '02d': '🐦', // poucas nuvens dia
    '02n': '🦉', // poucas nuvens noite
    '03d': '🐧', // nuvens dispersas
    '03n': '🐧',
    '04d': '🐧', // nuvens quebradas
    '04n': '🐧',
    '09d': '🐧', // chuva leve
    '09n': '🐧',
    '10d': '🐧', // chuva
    '10n': '🐧',
    '11d': '🐧', // tempestade
    '11n': '🐧',
    '13d': '🐧', // neve
    '13n': '🐧',
    '50d': '🐧'  // névoa
};

// Mapeamento de alertas climáticos (será atualizado dinamicamente)
const weatherAlerts = {
    hot: {
        icon: '🌡️',
        messageKey: 'hotAlert'
    },
    cold: {
        icon: '🧥',
        messageKey: 'coldAlert'
    },
    rain: {
        icon: '🌧️',
        messageKey: 'rainAlert'
    },
    storm: {
        icon: '⛈️',
        messageKey: 'stormAlert'
    },
    wind: {
        icon: '💨',
        messageKey: 'windAlert'
    },
    fog: {
        icon: '🌫️',
        messageKey: 'fogAlert'
    }
};

// Função para traduzir texto
function translateText(key, language = currentLanguage) {
    return getTranslation(key, language);
}

// Função para atualizar todos os textos da interface
function updateInterfaceLanguage(language = currentLanguage) {
    currentLanguage = language;
    
    // Atualizar placeholder do campo de busca com a localização atual
    elements.citySearch.placeholder = currentLocation || translateText('searchPlaceholder', language);
    
    // Atualizar todos os elementos com data-translate
    const elementsToTranslate = document.querySelectorAll('[data-translate]');
    elementsToTranslate.forEach(element => {
        const key = element.getAttribute('data-translate');
        const translation = translateText(key, language);
        element.textContent = translation;
    });
    
    // Atualizar placeholder do chat
    elements.chatInput.placeholder = translateText('chatPlaceholder', language);
    
    // Atualizar previsão se já carregada
    if (forecast) {
        updateForecast();
    }
    
    // Atualizar alerta se já carregado
    if (currentWeather) {
        updateWeatherAlert();
    }
}

// Mapeamento de cores de background baseadas no clima
const weatherBackgrounds = {
    'clear': {
        gradient: 'linear-gradient(135deg, #FFE4B5 0%, #FFD700 30%, #FFA500 60%, #FF7F50 100%)',
        description: 'sunny'
    },
    'clouds': {
        gradient: 'linear-gradient(135deg, #E6E6FA 0%, #B0C4DE 50%, #87CEEB 100%)',
        description: 'cloudy'
    },
    'rain': {
        gradient: 'linear-gradient(135deg, #4682B4 0%, #5F9EA0 50%, #708090 100%)',
        description: 'rainy'
    },
    'drizzle': {
        gradient: 'linear-gradient(135deg, #87CEEB 0%, #5F9EA0 50%, #A9A9A9 100%)',
        description: 'rainy'
    },
    'thunderstorm': {
        gradient: 'linear-gradient(135deg, #191970 0%, #2F4F4F 50%, #696969 100%)',
        description: 'stormy'
    },
    'snow': {
        gradient: 'linear-gradient(135deg, #E6F3FF 0%, #B0E0E6 30%, #87CEEB 70%, #4682B4 100%)',
        description: 'snowy'
    },
    'mist': {
        gradient: 'linear-gradient(135deg, #F5F5F5 0%, #DCDCDC 50%, #C0C0C0 100%)',
        description: 'foggy'
    },
    'fog': {
        gradient: 'linear-gradient(135deg, #F5F5F5 0%, #DCDCDC 50%, #C0C0C0 100%)',
        description: 'foggy'
    },
    'haze': {
        gradient: 'linear-gradient(135deg, #F5F5F5 0%, #DCDCDC 50%, #C0C0C0 100%)',
        description: 'foggy'
    },
    'dust': {
        gradient: 'linear-gradient(135deg, #DEB887 0%, #D2B48C 50%, #F4A460 100%)',
        description: 'dusty'
    },
    'sand': {
        gradient: 'linear-gradient(135deg, #F4A460 0%, #DEB887 50%, #D2B48C 100%)',
        description: 'sandy'
    },
    'ash': {
        gradient: 'linear-gradient(135deg, #696969 0%, #A9A9A9 50%, #C0C0C0 100%)',
        description: 'ashy'
    },
    'squall': {
        gradient: 'linear-gradient(135deg, #191970 0%, #2F4F4F 50%, #696969 100%)',
        description: 'stormy'
    },
    'tornado': {
        gradient: 'linear-gradient(135deg, #191970 0%, #2F4F4F 50%, #696969 100%)',
        description: 'stormy'
    },
    'humid': {
        gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 25%, #FF7F50 50%, #FF4500 75%, #DC143C 100%)',
        description: 'humid'
    },
    'cold': {
        gradient: 'linear-gradient(135deg, #B0E0E6 0%, #87CEEB 25%, #4682B4 50%, #2F4F4F 75%, #191970 100%)',
        description: 'cold'
    }
};

// Função para atualizar background baseado no clima
function updateWeatherBackground(weatherCondition, humidity = null, temperature = null) {
    const condition = weatherCondition.toLowerCase();
    
    // Verificar se deve usar background de alta umidade
    const isHighHumidity = humidity !== null && humidity > 70;
    const isWarmTemperature = temperature !== null && temperature > 20;
    const shouldUseHumidBackground = isHighHumidity && isWarmTemperature;
    
    // Verificar se deve usar background de frio
    const isColdTemperature = temperature !== null && temperature <= 10;
    
    let background;
    
    // Se for alta umidade com temperatura quente, usar background específico
    if (shouldUseHumidBackground) {
        background = weatherBackgrounds['humid'];
    }
    // Se for temperatura baixa, usar background de frio
    else if (isColdTemperature && !condition.includes('snow')) {
        background = weatherBackgrounds['cold'];
    } else {
        background = weatherBackgrounds[condition] || weatherBackgrounds['clear'];
    }
    
    // Aplicar gradiente ao body
    document.body.style.background = background.gradient;
    
    // Adicionar classe para referência
    document.body.className = `weather-${background.description}`;
}

// Função para atualizar o passarinho baseado no clima
function updateWeatherBird(weatherCondition, humidity = null, temperature = null, windSpeed = null) {
    const condition = weatherCondition.toLowerCase();
    
    // Limpar classes anteriores
    elements.weatherBird.className = 'bird';
    
    // Mapear condições climáticas para GIFs
    let birdGif = 'img/gifs/bird-summer-heat.gif'; // Padrão
    let birdClass = 'sunny';
    
    // Verificar se deve usar GIF de umidade (umidade > 70% E temperatura > 20°C)
    const isHighHumidity = humidity !== null && humidity > 70;
    const isWarmTemperature = temperature !== null && temperature > 20;
    const shouldUseHumidGif = isHighHumidity && isWarmTemperature;
    
    // PRIORIDADE 1: Verificar ventos fortes primeiro (acima de 60 km/h)
    if (windSpeed !== null && windSpeed > 60) {
        birdGif = 'img/gifs/bird-windy.gif';
        birdClass = 'windy';
    }
    // PRIORIDADE 2: Verificar temperatura muito alta (acima de 35°C)
    else if (temperature !== null && temperature > 35) {
        birdGif = 'img/gifs/bird-very-hot.gif';
        birdClass = 'very-hot';
    }
    // PRIORIDADE 3: Verificar temperatura baixa (frio)
    else if (temperature !== null && temperature <= 10) {
        birdGif = 'img/gifs/bird-cold.gif';
        birdClass = 'cold';
    }
    // PRIORIDADE 4: Verificar condições desconfortáveis (temperatura entre 25-35°C com alta umidade)
    else if (temperature !== null && temperature >= 25 && temperature <= 35 && humidity !== null && humidity > 60) {
        birdGif = 'img/gifs/bird-uncomfortable.gif';
        birdClass = 'uncomfortable';
    }
    // PRIORIDADE 5: Condições específicas de clima
    else if (condition.includes('rain') || condition.includes('drizzle')) {
        birdGif = 'img/gifs/bird-rain.gif';
        birdClass = 'rainy';
    } else if (condition.includes('storm') || condition.includes('thunder')) {
        birdGif = 'img/gifs/bird-windy.gif';
        birdClass = 'stormy';
    } else if (condition.includes('snow')) {
        birdGif = 'img/gifs/bird-cold.gif';
        birdClass = 'snowy';
    } else if (condition.includes('wind') || condition.includes('breeze')) {
        birdGif = 'img/gifs/bird-windy.gif';
        birdClass = 'windy';
    }
    // PRIORIDADE 6: Condições baseadas em umidade e temperatura
    else if (condition.includes('cloud')) {
        // Se for nublado mas com alta umidade e temperatura quente, usar GIF de umidade
        if (shouldUseHumidGif) {
            birdGif = 'img/gifs/bird-humid.gif';
            birdClass = 'humid';
        } else {
            birdGif = 'img/gifs/bird-summer-heat.gif';
            birdClass = 'cloudy';
        }
    } else if (condition.includes('humid') || condition.includes('mist') || condition.includes('fog')) {
        // Para condições de umidade/mist/fog, verificar se atende aos critérios
        if (shouldUseHumidGif) {
            birdGif = 'img/gifs/bird-humid.gif';
            birdClass = 'humid';
        } else {
            birdGif = 'img/gifs/bird-summer-heat.gif';
            birdClass = 'cloudy';
        }
    }
    // PRIORIDADE 7: Condições de céu limpo
    else if (condition.includes('clear') || condition.includes('sunny')) {
        birdGif = 'img/gifs/bird-summer-heat.gif';
        birdClass = 'sunny';
    }
    
    // Aplicar classe CSS
    elements.weatherBird.classList.add(birdClass);
    
    // Aplicar o GIF do pássaro
    elements.weatherBird.innerHTML = `
        <div class="bird-body">
            <img src="${birdGif}" alt="SabiA - ${condition}" class="bird-gif" />
        </div>
    `;
}

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    initializeWeatherMap();
    loadWeatherData();
});

// Configurar event listeners
function setupEventListeners() {
    // Busca de cidade
    elements.searchBtn.addEventListener('click', searchCity);
    elements.citySearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchCity();
        }
    });

    // Seletor de idioma
    elements.languageSelect.addEventListener('change', (e) => {
        const selectedLanguage = e.target.value;
        updateInterfaceLanguage(selectedLanguage);
        localStorage.setItem('sabia-language', selectedLanguage);
    });

    // Chat com IA
    elements.aiChatBtn.addEventListener('click', toggleChat);
    elements.closeChat.addEventListener('click', closeChat);
    elements.sendMessage.addEventListener('click', sendMessage);
    elements.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Botão de scroll
    elements.scrollToBottom.addEventListener('click', scrollToBottom);
}

// Inicializar aplicação
function initializeApp() {
    // Carregar idioma salvo
    const savedLanguage = localStorage.getItem('sabia-language') || 'en';
    currentLanguage = savedLanguage;
    elements.languageSelect.value = savedLanguage;
    updateInterfaceLanguage(savedLanguage);

    // Verificar se é PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(registration => console.log('SW registrado:', registration))
            .catch(error => console.log('Erro ao registrar SW:', error));
    }

    // Configurar geolocalização
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                getWeatherByCoords(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                console.log('Erro na geolocalização:', error);
                // Usar coordenadas do Parque do Sabiá como fallback
                getWeatherByCoords(CONFIG.DEFAULT_COORDS.lat, CONFIG.DEFAULT_COORDS.lon);
            }
        );
    } else {
        // Usar coordenadas do Parque do Sabiá como fallback
        getWeatherByCoords(CONFIG.DEFAULT_COORDS.lat, CONFIG.DEFAULT_COORDS.lon);
    }
}

// Carregar dados do clima
async function loadWeatherData() {
    showLoading(true);
    try {
        await Promise.all([
            getCurrentWeather(currentCity),
            getForecast(currentCity)
        ]);
        updateUI();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showError('Erro ao carregar dados do clima');
    } finally {
        showLoading(false);
    }
}

// Buscar cidade
async function searchCity() {
    const city = elements.citySearch.value.trim();
    if (!city) return;

    showLoading(true);
    try {
        await getCurrentWeather(city);
        await getForecast(city);
        currentCity = city;
        currentLocation = city;
        elements.citySearch.placeholder = city;
        elements.citySearch.value = '';
        updateUI();
    } catch (error) {
        console.error('Erro ao buscar cidade:', error);
        showError('Cidade não encontrada');
    } finally {
        showLoading(false);
    }
}

// Obter clima atual
async function getCurrentWeather(city) {
    const response = await fetch(`${API_BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric&lang=en`);
    if (!response.ok) throw new Error('Erro na API');
    currentWeather = await response.json();
}

// Obter previsão
async function getForecast(city) {
    const response = await fetch(`${API_BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=en`);
    if (!response.ok) throw new Error('Erro na API');
    const data = await response.json();
    forecast = data.list;
}

// Obter clima por coordenadas
async function getWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(`${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=en`);
        if (!response.ok) throw new Error('Erro na API');
        const data = await response.json();
        currentCity = data.name;
        currentLocation = `${data.name} - ${data.sys.country}`;
        elements.citySearch.placeholder = currentLocation;
        
        // Atualizar mapa com nova localização
        updateMapLocation([lat, lon]);
        
        await getCurrentWeather(data.name);
        await getForecast(data.name);
        updateUI();
    } catch (error) {
        console.error('Erro ao obter clima por coordenadas:', error);
        loadWeatherData(); // Fallback
    }
}

// Atualizar interface
function updateUI() {
    if (!currentWeather) return;

    // Atualizar background e passarinho baseado no clima
    const weatherCondition = currentWeather.weather[0].main;
    const humidity = currentWeather.main.humidity;
    const temperature = currentWeather.main.temp;
    const windSpeed = currentWeather.wind.speed * 3.6; // Converter m/s para km/h
    updateWeatherBackground(weatherCondition, humidity, temperature);
    updateWeatherBird(weatherCondition, humidity, temperature, windSpeed);
    
    updateWeatherAlert();
    updateCurrentWeather();
    updateForecast();
}


// Atualizar alerta climático
function updateWeatherAlert() {
    const temp = currentWeather.main.temp;
    const weather = currentWeather.weather[0].main.toLowerCase();
    const windSpeed = currentWeather.wind.speed * 3.6; // Converter m/s para km/h
    
    let alertType = 'hot';
    
    if (temp < 10) {
        alertType = 'cold';
    } else if (weather.includes('rain') || weather.includes('drizzle')) {
        alertType = 'rain';
    } else if (weather.includes('storm') || weather.includes('thunder')) {
        alertType = 'storm';
    } else if (windSpeed > 60) {
        alertType = 'wind';
    } else if (weather.includes('fog') || weather.includes('mist')) {
        alertType = 'fog';
    }
    
    const alert = weatherAlerts[alertType];
    const message = translateText(alert.messageKey, currentLanguage);
    elements.alertMessage.innerHTML = `
        <span class="alert-icon">${alert.icon}</span>
        ${message}
    `;
}

// Atualizar informações climáticas atuais
function updateCurrentWeather() {
    elements.currentTemp.textContent = `${Math.round(currentWeather.main.temp)}°C`;
    elements.feelsLike.textContent = `${Math.round(currentWeather.main.feels_like)}°C`;
    elements.humidity.textContent = `${currentWeather.main.humidity}%`;
    elements.windSpeed.textContent = `${Math.round(currentWeather.wind.speed * 3.6)} km/h`;
    elements.visibility.textContent = `${Math.round(currentWeather.visibility / 1000)} km`;
    
    // UV Index (simulado - a API gratuita não inclui UV)
    const uvValue = Math.round(Math.random() * 11);
    let uvText = 'Baixo';
    if (uvValue > 8) uvText = 'Muito alto';
    else if (uvValue > 6) uvText = 'Alto';
    else if (uvValue > 3) uvText = 'Moderado';
    
    elements.uvIndex.textContent = uvText;
}

// Atualizar previsão de 6 dias
function updateForecast() {
    if (!forecast) return;
    
    const dailyForecast = getDailyForecast(); // Já limitado a 6 dias na função
    console.log('Dias de previsão:', dailyForecast.length); // Debug
    
    elements.sevenDayForecast.innerHTML = '';
    
    // Mapeamento de dias da semana completos
    const dayNames = {
        'pt': ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
        'en': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        'es': ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    };
    
    // Mapeamento de meses
    const monthNames = {
        'pt': ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        'en': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        'es': ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    };
    
    // Garantir que temos exatamente 6 cards
    const targetDays = 6;
    const currentDate = new Date();
    
    for (let i = 0; i < targetDays; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'forecast-day';
        
        // Calcular data para o dia atual + i
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() + i);
        
        const dayOfWeek = date.getDay();
        const dayName = dayNames[currentLanguage][dayOfWeek];
        const dayNumber = date.getDate();
        const monthName = monthNames[currentLanguage][date.getMonth()];
        
        // Verificar se temos dados para este dia
        const dayData = dailyForecast[i];
        
        if (dayData) {
            // Obter ícone baseado na condição climática
            const weatherIcon = getWeatherIcon(dayData.weather[0].main.toLowerCase());
            
            // Obter temperaturas máxima e mínima
            const tempMax = Math.round(dayData.main.temp_max);
            const tempMin = Math.round(dayData.main.temp_min);
            
            dayElement.innerHTML = `
                <div class="forecast-day-info">
                    <div class="forecast-day-name">${dayName}</div>
                    <div class="forecast-day-date">${dayNumber} ${monthName}</div>
                </div>
                <div class="forecast-weather-icon">${weatherIcon}</div>
                <div class="forecast-temperatures">
                    <div class="forecast-temp-high">${tempMax}°</div>
                    <div class="forecast-temp-low">${tempMin}°</div>
                </div>
            `;
        } else {
            // Card vazio se não temos dados
            dayElement.innerHTML = `
                <div class="forecast-day-info">
                    <div class="forecast-day-name">${dayName}</div>
                    <div class="forecast-day-date">${dayNumber} ${monthName}</div>
                </div>
                <div class="forecast-weather-icon">🌤️</div>
                <div class="forecast-temperatures">
                    <div class="forecast-temp-high">30°</div>
                    <div class="forecast-temp-low">28°</div>
                </div>
            `;
        }
        
        elements.sevenDayForecast.appendChild(dayElement);
    }
}

// Função para obter ícone de clima baseado na condição
function getWeatherIcon(condition) {
    const iconMap = {
        'clear': '☀️',           // Sol
        'sunny': '☀️',           // Sol
        'clouds': '☁️',          // Nuvens
        'cloudy': '☁️',          // Nublado
        'partly cloudy': '⛅',   // Parcialmente nublado
        'rain': '🌧️',           // Chuva
        'drizzle': '🌦️',        // Chuvisco
        'storm': '⛈️',          // Tempestade
        'thunderstorm': '⛈️',   // Tempestade
        'snow': '❄️',           // Neve
        'fog': '🌫️',            // Névoa
        'mist': '🌫️',           // Névoa
        'haze': '🌫️'            // Névoa
    };
    
    return iconMap[condition] || '🌤️'; // Ícone padrão
}

// Função para traduzir condições climáticas
function translateWeatherCondition(condition) {
    const conditionMap = {
        'clear': 'clearSky',
        'clouds': 'cloudy',
        'rain': 'rain',
        'drizzle': 'drizzle',
        'thunderstorm': 'thunderstorm',
        'snow': 'snow',
        'mist': 'mist',
        'fog': 'fog',
        'haze': 'fog',
        'dust': 'dust',
        'sand': 'sand',
        'ash': 'volcanicAsh',
        'squall': 'squalls',
        'tornado': 'tornado'
    };
    
    const translationKey = conditionMap[condition] || condition;
    return translateText(translationKey, currentLanguage);
}

// Obter previsão diária (agrupar por dia)
function getDailyForecast() {
    const dailyData = {};
    
    // Agrupar por dia, pegando o primeiro item de cada dia
    forecast.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();
        
        if (!dailyData[dateKey]) {
            dailyData[dateKey] = item;
        }
    });
    
    // Converter para array e ordenar por data
    const dailyValues = Object.values(dailyData)
        .sort((a, b) => a.dt - b.dt)
        .slice(0, 6);
    
    console.log('Dados diários processados:', dailyValues.length); // Debug
    return dailyValues;
}

// Toggle chat
function toggleChat() {
    isChatOpen = !isChatOpen;
    elements.aiChatContainer.classList.toggle('open', isChatOpen);
    
    if (isChatOpen) {
        elements.chatInput.focus();
    }
}

// Fechar chat
function closeChat() {
    isChatOpen = false;
    elements.aiChatContainer.classList.remove('open');
}

// Enviar mensagem
function sendMessage() {
    const message = elements.chatInput.value.trim();
    if (!message) return;
    
    // Adicionar mensagem do usuário
    addMessage(message, 'user');
    elements.chatInput.value = '';
    
    // Simular resposta da IA
    setTimeout(() => {
        const response = generateAIResponse(message);
        addMessage(response, 'ai');
    }, 1000);
}

// Adicionar mensagem ao chat
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${sender}-message`;
    
    const avatar = sender === 'ai' ? '🐦' : '👤';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">${text}</div>
    `;
    
    elements.chatMessages.appendChild(messageDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// Gerar resposta da IA
function generateAIResponse(message) {
    const responses = {
        'pt': [
            'Baseado nos dados atuais, posso te ajudar com informações sobre o clima!',
            'O clima está interessante hoje, não é mesmo?',
            'Posso te dar dicas sobre como se preparar para as condições atuais.',
            'Que pergunta interessante sobre o clima! Deixe-me pensar...',
            'Com base nos dados que tenho, posso te orientar sobre o clima.'
        ],
        'en': [
            'Based on current data, I can help you with weather information!',
            'The weather is interesting today, isn\'t it?',
            'I can give you tips on how to prepare for current conditions.',
            'What an interesting question about the weather! Let me think...',
            'Based on the data I have, I can guide you about the weather.'
        ],
        'es': [
            '¡Basado en los datos actuales, puedo ayudarte con información del clima!',
            'El clima está interesante hoy, ¿verdad?',
            'Puedo darte consejos sobre cómo prepararte para las condiciones actuales.',
            '¡Qué pregunta tan interesante sobre el clima! Déjame pensar...',
            'Basado en los datos que tengo, puedo orientarte sobre el clima.'
        ]
    };
    
    const currentResponses = responses[currentLanguage] || responses['pt'];
    
    // Respostas específicas baseadas na mensagem
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('chuva') || messageLower.includes('rain') || messageLower.includes('lluvia')) {
        if (currentLanguage === 'en') {
            return 'Yes, there\'s a possibility of rain today! I recommend taking an umbrella.';
        } else if (currentLanguage === 'es') {
            return '¡Sí, hay posibilidad de lluvia hoy! Te recomiendo llevar un paraguas.';
        } else {
            return 'Sim, há possibilidade de chuva hoje! Recomendo levar um guarda-chuva.';
        }
    } else if (messageLower.includes('temperatura') || messageLower.includes('temperature') || messageLower.includes('temperatura')) {
        if (currentLanguage === 'en') {
            return `Current temperature is ${Math.round(currentWeather.main.temp)}°C, with a feels-like temperature of ${Math.round(currentWeather.main.feels_like)}°C.`;
        } else if (currentLanguage === 'es') {
            return `La temperatura actual es ${Math.round(currentWeather.main.temp)}°C, con una sensación térmica de ${Math.round(currentWeather.main.feels_like)}°C.`;
        } else {
            return `A temperatura atual é ${Math.round(currentWeather.main.temp)}°C, com sensação térmica de ${Math.round(currentWeather.main.feels_like)}°C.`;
        }
    } else if (messageLower.includes('vento') || messageLower.includes('wind') || messageLower.includes('viento')) {
        if (currentLanguage === 'en') {
            return `Wind is at ${Math.round(currentWeather.wind.speed * 3.6)} km/h.`;
        } else if (currentLanguage === 'es') {
            return `El viento está a ${Math.round(currentWeather.wind.speed * 3.6)} km/h.`;
        } else {
            return `O vento está a ${Math.round(currentWeather.wind.speed * 3.6)} km/h.`;
        }
    } else if (messageLower.includes('umidade') || messageLower.includes('humidity') || messageLower.includes('humedad')) {
        if (currentLanguage === 'en') {
            return `Humidity is at ${currentWeather.main.humidity}%.`;
        } else if (currentLanguage === 'es') {
            return `La humedad está en ${currentWeather.main.humidity}%.`;
        } else {
            return `A umidade está em ${currentWeather.main.humidity}%.`;
        }
    }
    
    return currentResponses[Math.floor(Math.random() * currentResponses.length)];
}

// Scroll para o fim da página
function scrollToBottom() {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
}

// Inicializar mapa de precipitação
function initializeWeatherMap() {
    if (!elements.precipitationMap) return;
    
    // Criar mapa centrado na localização atual
    const defaultCoords = [CONFIG.DEFAULT_COORDS.lat, CONFIG.DEFAULT_COORDS.lon];
    weatherMap = L.map('precipitationMap').setView(defaultCoords, 10);
    
    // Adicionar camada base
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(weatherMap);
    
    // Adicionar camada de precipitação
    addWeatherLayer('precipitation_new');
    
    // Adicionar marcador da localização atual
    addLocationMarker(defaultCoords);
    
    // Configurar controles do mapa
    setupMapControls();
}

// Adicionar camada de clima
function addWeatherLayer(layerType) {
    if (!weatherMap) return;
    
    // Remover camada anterior se existir
    if (weatherMap.weatherLayer) {
        weatherMap.removeLayer(weatherMap.weatherLayer);
    }
    
    // Criar nova camada
    const layerUrl = `https://tile.openweathermap.org/map/${layerType}/{z}/{x}/{y}.png?appid=${API_KEY}`;
    weatherMap.weatherLayer = L.tileLayer(layerUrl, {
        attribution: '© OpenWeatherMap',
        opacity: 0.7
    }).addTo(weatherMap);
    
    currentMapLayer = layerType;
}

// Adicionar marcador da localização
function addLocationMarker(coords) {
    if (!weatherMap) return;
    
    // Remover marcador anterior se existir
    if (currentLocationMarker) {
        weatherMap.removeLayer(currentLocationMarker);
    }
    
    // Criar novo marcador
    const customIcon = L.divIcon({
        className: 'custom-location-marker',
        html: '<div class="location-pin">📍</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
    });
    
    currentLocationMarker = L.marker(coords, { icon: customIcon })
        .addTo(weatherMap)
        .bindPopup(`
            <div class="location-popup">
                <h4>${currentLocation}</h4>
                <p>Localização atual</p>
            </div>
        `);
}

// Configurar controles do mapa
function setupMapControls() {
    if (!elements.togglePrecipitation) return;
    
    // Event listeners para os botões
    elements.togglePrecipitation.addEventListener('click', () => {
        switchMapLayer('precipitation_new', elements.togglePrecipitation);
    });
    
    elements.toggleClouds.addEventListener('click', () => {
        switchMapLayer('clouds_new', elements.toggleClouds);
    });
    
    elements.toggleTemperature.addEventListener('click', () => {
        switchMapLayer('temp_new', elements.toggleTemperature);
    });
}

// Trocar camada do mapa
function switchMapLayer(layerType, activeButton) {
    // Atualizar botões ativos
    document.querySelectorAll('.map-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    activeButton.classList.add('active');
    
    // Adicionar nova camada
    addWeatherLayer(layerType);
}

// Atualizar localização no mapa
function updateMapLocation(coords) {
    if (!weatherMap) return;
    
    // Atualizar centro do mapa
    weatherMap.setView(coords, 10);
    
    // Atualizar marcador
    addLocationMarker(coords);
}

// Mostrar loading
function showLoading(show) {
    elements.loadingOverlay.classList.toggle('hidden', !show);
}

// Mostrar erro
function showError(message) {
    alert(message); // Em produção, usar um sistema de notificações melhor
}

// Detectar mudanças de conectividade
window.addEventListener('online', () => {
    console.log('Conexão restaurada');
    loadWeatherData();
});

window.addEventListener('offline', () => {
    console.log('Conexão perdida');
    showError('Sem conexão com a internet');
});
