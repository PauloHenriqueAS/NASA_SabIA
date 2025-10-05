// Service Worker para PWA
const CACHE_NAME = 'sabia-weather-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/config.js',
    '/js/translations.js',
    '/manifest.json',
    '/img/bird-icon.png',
    '/img/scroll-icon.svg',
    '/img/icons/icon-192x192.png',
    '/img/icons/icon-512x512.png',
    '/img/gifs/bird-rain.gif',
    '/img/gifs/bird-sunny.gif',
    '/img/gifs/bird-cloudy.gif',
    '/img/gifs/bird-stormy.gif',
    '/img/gifs/bird-snowy.gif',
    '/img/gifs/bird-windy.gif',
    '/img/gifs/bird-humid.gif',
    '/img/gifs/bird-summer-heat.gif'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Retornar do cache se disponível
                if (response) {
                    return response;
                }
                
                // Clonar a requisição
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest).then((response) => {
                    // Verificar se recebemos uma resposta válida
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clonar a resposta
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                }).catch(() => {
                    // Fallback para página offline
                    if (event.request.destination === 'document') {
                        return caches.match('/index.html');
                    }
                });
            })
    );
});

// Notificações push (para futuras implementações)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'Nova atualização do clima disponível!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Ver detalhes',
                icon: '/icons/icon-96x96.png'
            },
            {
                action: 'close',
                title: 'Fechar',
                icon: '/icons/icon-96x96.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('SabiA - Clima', options)
    );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
