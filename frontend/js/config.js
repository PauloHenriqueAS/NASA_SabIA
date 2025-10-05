// Configurações da aplicação SabiA
const CONFIG = {
    // Backend API
    BACKEND_URL: 'https://web-production-ba0a.up.railway.app/infos/GetDataLocation',
    
    // Configurações padrão
    DEFAULT_CITY: 'Uberlândia',
    DEFAULT_COUNTRY: 'BR',
    DEFAULT_LOCATION: 'Parque do Sabiá',
    DEFAULT_COORDS: {
        lat: -18.913889,
        lon: -48.2325
    },
    
    // Configurações de cache
    CACHE_DURATION: 10 * 60 * 1000, // 10 minutos
    
    // Configurações de UI
    ANIMATION_DURATION: 300,
    LOADING_TIMEOUT: 10000, // 10 segundos
    
    // Configurações do chat
    CHAT_MAX_MESSAGES: 50,
    AI_RESPONSE_DELAY: 1000, // 1 segundo
    
    // Configurações de notificação
    NOTIFICATION_ENABLED: true,
    NOTIFICATION_PERMISSION_REQUESTED: false,
    
    // Configurações de geolocalização
    GEOLOCATION_TIMEOUT: 5000, // 5 segundos
    GEOLOCATION_MAX_AGE: 300000, // 5 minutos
    
    // Configurações de responsividade
    MOBILE_BREAKPOINT: 768,
    TABLET_BREAKPOINT: 1024,
    
    // Configurações de acessibilidade
    REDUCED_MOTION: false,
    HIGH_CONTRAST: false,
    
    // Configurações de debug
    DEBUG_MODE: false,
    LOG_LEVEL: 'info' // 'debug', 'info', 'warn', 'error'
};

// Exportar configurações
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
