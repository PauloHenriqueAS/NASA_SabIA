// Usar configurações do arquivo config.js
const BACKEND_URL = CONFIG.BACKEND_URL;

// Estado da aplicação
let currentWeather = null;
let forecast = null;
let currentCity = CONFIG.DEFAULT_CITY;
let currentLocation = CONFIG.DEFAULT_LOCATION;
let selectedDate = null;

// Variáveis do mapa
let weatherMap = null;
let currentLocationMarker = null;
let isChatOpen = false;
let currentLanguage = 'en';

// Elementos DOM
const elements = {
    citySearch: document.getElementById('citySearch'),
    dateSearch: document.getElementById('dateSearch'),
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

    // Campo de data
    elements.dateSearch.addEventListener('change', (e) => {
        // Se uma data foi selecionada, fazer busca automática se já há uma cidade
        if (e.target.value && elements.citySearch.placeholder !== 'Uberlândia - Parque do Sabiá') {
            searchCity();
        } else if (!e.target.value && selectedDate) {
            // Se a data foi limpa, voltar aos dados atuais
            selectedDate = null;
            searchCity();
        }
    });

    // Seletor de idioma
    elements.languageSelect.addEventListener('change', (e) => {
        const selectedLanguage = e.target.value;
        updateInterfaceLanguage(selectedLanguage);
        localStorage.setItem('sabia-language', selectedLanguage);
        
        // Mostrar alerta de versão de teste no novo idioma
        showTestVersionAlert();
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

    // Listener para redimensionamento da janela
    window.addEventListener('resize', () => {
        // Se mudou de mobile para desktop ou vice-versa, não fazer nada
        // O alerta só aparece na inicialização e mudança de idioma
    });
}

// Inicializar aplicação
function initializeApp() {
    // Carregar idioma salvo
    const savedLanguage = localStorage.getItem('sabia-language') || 'en';
    currentLanguage = savedLanguage;
    elements.languageSelect.value = savedLanguage;
    updateInterfaceLanguage(savedLanguage);

    // Mostrar alerta de versão de teste
    showTestVersionAlert();

    // Configurar limitações do campo de data
    setupDateLimitations();

    // Verificar se é PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
        .then(registration => {})
        .catch(error => {});
    }

    // Testar conectividade com o backend antes de carregar dados
    testBackendConnection()
        .then(() => {
            // SEMPRE usar Uberlândia como localização inicial (ignorar geolocalização)
                getWeatherByCoords(CONFIG.DEFAULT_COORDS.lat, CONFIG.DEFAULT_COORDS.lon);
        })
        .catch((error) => {
            console.error('Erro de conectividade com backend:', error);
            showBackendConnectionError();
        });
}

// Testar conectividade com o backend
async function testBackendConnection() {
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name_city: "Uberlândia"
            })
        });
        
        if (!response.ok) {
            throw new Error(`Backend não disponível: ${response.status} ${response.statusText}`);
        }
        
        return true;
    } catch (error) {
        console.error('Erro de conectividade:', error);
        throw error;
    }
}

// Mostrar erro de conectividade com backend
function showBackendConnectionError() {
    const messages = {
        'pt': 'Não foi possível conectar com o servidor. Verifique se o backend está rodando em http://127.0.0.1:8000',
        'en': 'Could not connect to server. Please check if the backend is running at http://127.0.0.1:8000',
        'es': 'No se pudo conectar al servidor. Verifique si el backend está ejecutándose en http://127.0.0.1:8000'
    };
    
    Swal.fire({
        title: '🔌 Erro de Conexão',
        text: messages[currentLanguage],
        icon: 'error',
        confirmButtonText: 'Tentar Novamente',
        confirmButtonColor: '#4A90E2',
        showCancelButton: true,
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Tentar novamente
            initializeApp();
        }
    });
}

// Mostrar alerta de versão de teste
function showTestVersionAlert() {
    const message = translateText('testVersionAlert', currentLanguage);
    
    // Verificar se é desktop (largura > 768px)
    const isDesktop = window.innerWidth > 768;
    
    if (isDesktop) {
        // Versão web - toast no canto superior direito
        Swal.fire({
            title: '⚠️ Versão de Teste',
            text: message,
            icon: 'info',
            position: 'top-end',
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
            toast: true,
            background: 'rgba(255, 255, 255, 0.95)',
            backdrop: false,
            customClass: {
                popup: 'test-version-alert'
            }
        });
    } else {
        // Versão mobile - modal centralizado
        Swal.fire({
            title: '⚠️ Versão de Teste',
            text: message,
            icon: 'info',
            confirmButtonText: 'OK',
            confirmButtonColor: '#4A90E2',
            customClass: {
                popup: 'test-version-alert-mobile'
            }
        });
    }
}

// Configurar limitações do campo de data
function setupDateLimitations() {
    const today = new Date();
    const maxDate = new Date('2025-12-31');
    
    // Definir data máxima como 31/12/2025
    elements.dateSearch.max = '2025-12-31';
    
    // Definir data mínima como hoje
    elements.dateSearch.min = today.toISOString().split('T')[0];
}

// Carregar dados do clima
async function loadWeatherData() {
    showLoading(true);
    try {
        const data = await getWeatherData();
        processWeatherData(data);
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
    const date = elements.dateSearch.value;
    
    if (!city) return;

    // FORÇAR UBERLÂNDIA - Versão de teste
    const forcedCity = 'Uberlândia';

    showLoading(true);
    try {
        // Buscar dados do backend
        const data = await getWeatherData(date);
        processWeatherData(data);
        
        // Se uma data foi selecionada, marcar como selecionada
        if (date) {
            selectedDate = date;
        } else {
            selectedDate = null;
        }
        
        currentCity = forcedCity;
        currentLocation = forcedCity;
        elements.citySearch.placeholder = forcedCity;
        elements.citySearch.value = '';
        updateUI();
        
        // Mostrar aviso se o usuário tentou buscar outra cidade
        if (city.toLowerCase() !== forcedCity.toLowerCase()) {
            showCityRestrictionAlert(city);
        }
    } catch (error) {
        console.error('Erro ao buscar cidade:', error);
        showError('Erro ao carregar dados do clima');
    } finally {
        showLoading(false);
    }
}

// Mostrar alerta de restrição de cidade
function showCityRestrictionAlert(attemptedCity) {
    const messages = {
        'pt': `Em versão de teste, apenas Uberlândia está disponível. Você tentou buscar: ${attemptedCity}`,
        'en': `In test version, only Uberlândia is available. You tried to search: ${attemptedCity}`,
        'es': `En versión de prueba, solo Uberlândia está disponible. Intentaste buscar: ${attemptedCity}`
    };
    
    Swal.fire({
        title: '🚫 Cidade Restrita',
        text: messages[currentLanguage],
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#4A90E2'
    });
}

// Obter dados do clima do backend
async function getWeatherData(date = null) {
    const requestData = {
        name_city: "Uberlândia"
    };
    
    
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro na resposta:', errorText);
            throw new Error(`Erro na API: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
    const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw error;
    }
}

// Processar dados do backend
function processWeatherData(data) {
    
    if (!data) {
        throw new Error('Nenhum dado recebido do backend');
    }
    
    if (!Array.isArray(data)) {
        console.error('Dados não são um array:', data);
        throw new Error('Formato de dados inválido - esperado array');
    }
    
    if (data.length === 0) {
        throw new Error('Array de dados vazio recebido do backend');
    }
    
    // Primeiro item é o clima atual
    const currentData = data[0];
    
    // Validar campos obrigatórios
    const requiredFields = ['T2M_prediction', 'WS2M_prediction', 'RH2M_prediction', 'classification', 'sabia_message_en'];
    for (const field of requiredFields) {
        if (currentData[field] === undefined || currentData[field] === null) {
            console.error(`Campo obrigatório ausente: ${field}`, currentData);
            throw new Error(`Campo obrigatório ausente: ${field}`);
        }
    }
    
    // Converter dados do backend para formato esperado pela UI
    currentWeather = {
        main: {
            temp: currentData.T2M_prediction,
            feels_like: currentData.T2M_prediction, // T2M_prediction conforme especificado
            humidity: currentData.WS2M_prediction, // Mapeamento conforme especificado
            temp_max: currentData.T2M_MAX_prediction || currentData.T2M_prediction,
            temp_min: currentData.T2M_MIN_prediction || currentData.T2M_prediction
        },
        wind: {
            speed: currentData.RH2M_prediction / 3.6 // Converter km/h para m/s
        },
        weather: [{
            main: getWeatherConditionFromClassification(currentData.classification),
            description: currentData.classification
        }],
        visibility: 10000, // Valor padrão
        sabia_message: currentData.sabia_message_en,
        historical: selectedDate !== null,
        historicalDate: selectedDate
    };
    
    
    // Usar todos os dados como previsão
    forecast = data;
}

// Converter classificação para condição climática
function getWeatherConditionFromClassification(classification) {
    const classificationMap = {
        'sunny': 'Clear',
        'cloudy': 'Clouds',
        'rainy': 'Rain',
        'stormy': 'Thunderstorm',
        'snowy': 'Snow',
        'foggy': 'Mist'
    };
    
    return classificationMap[classification.toLowerCase()] || 'Clear';
}


// Obter clima por coordenadas
async function getWeatherByCoords(lat, lon) {
    showLoading(true);
    try {
        // Sempre usar Uberlândia
        currentCity = 'Uberlândia';
        currentLocation = 'Uberlândia';
        elements.citySearch.placeholder = currentLocation;
        
        // Atualizar mapa com nova localização
        updateMapLocation([lat, lon]);
        
        // Carregar dados do backend
        const data = await getWeatherData();
        processWeatherData(data);
        updateUI();
    } catch (error) {
        console.error('Erro ao obter clima por coordenadas:', error);
        showError('Erro ao carregar dados do clima');
    } finally {
        showLoading(false);
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
    
    // Mostrar indicador se são dados históricos
    updateHistoricalIndicator();
}

// Atualizar indicador de dados históricos
function updateHistoricalIndicator() {
    const alertCard = document.getElementById('weatherAlert');
    
    if (currentWeather && currentWeather.historical) {
        // Adicionar indicador de dados históricos
        const historicalIndicator = document.createElement('div');
        historicalIndicator.className = 'historical-indicator';
        historicalIndicator.innerHTML = `
            <div class="alert-icon">📅</div>
            <div class="alert-text">
                <p>Dados históricos para ${formatDate(currentWeather.historicalDate)}</p>
            </div>
        `;
        
        // Inserir antes do alerta climático
        alertCard.parentNode.insertBefore(historicalIndicator, alertCard);
    } else {
        // Remover indicador se existir
        const existingIndicator = document.querySelector('.historical-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
    }
}

// Formatar data para exibição
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    
    const dayNames = {
        'pt': ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
        'en': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        'es': ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    };
    
    const monthNames = {
        'pt': ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
        'en': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        'es': ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    };
    
    const dayName = dayNames[currentLanguage][date.getDay()];
    const monthName = monthNames[currentLanguage][date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    return `${dayName}, ${day} de ${monthName} de ${year}`;
}


// Atualizar alerta climático
function updateWeatherAlert() {
    // Usar mensagem do backend se disponível
    if (currentWeather.sabia_message) {
        elements.alertMessage.innerHTML = `
            <span class="alert-icon">🐦</span>
            ${currentWeather.sabia_message}
        `;
        return;
    }
    
    // Fallback para lógica anterior se não houver mensagem do backend
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
    elements.humidity.textContent = `${Math.round(currentWeather.main.humidity)}%`;
    elements.windSpeed.textContent = `${Math.round(currentWeather.wind.speed * 3.6)} km/h`;
    elements.visibility.textContent = `${Math.round(currentWeather.visibility / 1000)} km`;
    
    // UV Index - usar classificação do backend diretamente
    const classification = currentWeather.weather[0].description;
    elements.uvIndex.textContent = classification;
}

// Atualizar previsão de 6 dias
function updateForecast() {
    if (!forecast) return;
    
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
    
    // Usar dados do backend (itens 1-6, pulando apenas o item 0)
    const startIndex = 1; // Começar do item 1
    const maxDays = 6; // Exatamente 6 dias
    for (let i = 0; i < maxDays; i++) {
        const dayData = forecast[startIndex + i];
        
        if (!dayData) {
            console.warn(`Dados não encontrados para o dia ${i + 1}`);
            continue;
        }
        
        
        const dayElement = document.createElement('div');
        dayElement.className = 'forecast-day';
        
        // Converter data do backend
        let date;
        try {
            // Tentar diferentes formatos de data
            if (typeof dayData.date === 'string') {
                date = new Date(dayData.date);
            } else if (dayData.date instanceof Date) {
                date = dayData.date;
            } else {
                throw new Error('Formato de data inválido');
            }
            
            // Verificar se a data é válida
            if (isNaN(date.getTime())) {
                throw new Error('Data inválida');
            }
        } catch (error) {
            console.error('Erro ao processar data:', dayData.date, error);
            // Usar data atual como fallback
            date = new Date();
            date.setDate(date.getDate() + i + 1);
        }
        
        const dayOfWeek = date.getDay();
        const dayName = dayNames[currentLanguage][dayOfWeek];
        const dayNumber = date.getDate();
        const monthName = monthNames[currentLanguage][date.getMonth()];
        
        // Obter ícone baseado na classificação
        const weatherIcon = getWeatherIconFromClassification(dayData.classification);
            
            // Obter temperaturas máxima e mínima
        const tempMax = Math.round(dayData.T2M_MAX_prediction || 0);
        const tempMin = Math.round(dayData.T2M_MIN_prediction || 0);
        
            
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
        
        elements.sevenDayForecast.appendChild(dayElement);
    }
    
}

// Obter ícone baseado na classificação do backend
function getWeatherIconFromClassification(classification) {
    const iconMap = {
        'sunny': '☀️',
        'clear': '☀️',
        'cloudy': '☁️',
        'overcast': '☁️',
        'rainy': '🌧️',
        'stormy': '⛈️',
        'snowy': '❄️',
        'foggy': '🌫️',
        'mist': '🌫️'
    };
    
    return iconMap[classification.toLowerCase()] || '🌤️';
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

// Inicializar mapa de Uberlândia
function initializeWeatherMap() {
    if (!elements.precipitationMap) return;
    
    // Criar mapa centrado em Uberlândia
    const uberlandiaCoords = [CONFIG.DEFAULT_COORDS.lat, CONFIG.DEFAULT_COORDS.lon];
    weatherMap = L.map('precipitationMap').setView(uberlandiaCoords, 12);
    
    // Adicionar camada base do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(weatherMap);
    
    // Adicionar marcador de Uberlândia
    addLocationMarker(uberlandiaCoords);
    
    // Remover controles do mapa (não precisamos mais)
    // setupMapControls(); // Comentado - não precisamos mais dos controles
}

// Função removida - não precisamos mais de camadas do OpenWeather

// Adicionar marcador de Uberlândia
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
                <h4>Uberlândia</h4>
                <p>Parque do Sabiá</p>
            </div>
        `);
}

// Funções de controles do mapa removidas - não precisamos mais

// Atualizar localização no mapa (sempre Uberlândia)
function updateMapLocation(coords) {
    if (!weatherMap) return;
    
    // Sempre manter foco em Uberlândia
    const uberlandiaCoords = [CONFIG.DEFAULT_COORDS.lat, CONFIG.DEFAULT_COORDS.lon];
    weatherMap.setView(uberlandiaCoords, 12);
    
    // Atualizar marcador para Uberlândia
    addLocationMarker(uberlandiaCoords);
}

// Mostrar loading
function showLoading(show) {
    if (elements.loadingOverlay) {
    elements.loadingOverlay.classList.toggle('hidden', !show);
    } else {
        console.error('Elemento loadingOverlay não encontrado!');
    }
}

// Mostrar erro
function showError(message) {
    Swal.fire({
        title: 'Erro',
        text: message,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#4A90E2'
    });
}

// Detectar mudanças de conectividade
window.addEventListener('online', () => {
    loadWeatherData();
});

window.addEventListener('offline', () => {
    showError('Sem conexão com a internet');
});

