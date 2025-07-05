const CACHE_NAME = 'flogger-v1';
const STATIC_CACHE_NAME = 'flogger-static-v1';
const DATA_CACHE_NAME = 'flogger-data-v1';

// Files to cache immediately
const STATIC_FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.js',
  '/src/tw.css',
  '/src/globalcss.styl',
  '/favicon/favicon.svg',
  '/favicon/favicon.ico',
  '/favicon/apple-touch-icon.png',
  '/favicon/web-app-manifest-192x192.png',
  '/favicon/web-app-manifest-512x512.png',
  '/site.webmanifest'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES_TO_CACHE);
      })
      .then(() => {
        console.log('[SW] Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Old caches cleaned up');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API/data requests
  if (isDataRequest(request)) {
    event.respondWith(handleDataRequest(request));
    return;
  }

  // Handle static file requests
  if (isStaticRequest(request)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // For other requests, try network first, then cache
  event.respondWith(handleOtherRequest(request));
});

// Check if request is for data/API
function isDataRequest(request) {
  const url = new URL(request.url);
  
  // Check for Dropbox API requests
  if (url.hostname.includes('api.dropboxapi.com') || 
      url.hostname.includes('content.dropboxapi.com') ||
      url.hostname.includes('api.dropbox.com')) {
    return true;
  }
  
  // Check for local API requests
  if (url.pathname.startsWith('/api/')) {
    return true;
  }
  
  // Check for JSON responses
  if (request.headers.get('accept')?.includes('application/json')) {
    return true;
  }
  
  return false;
}

// Check if request is for static assets
function isStaticRequest(request) {
  const url = new URL(request.url);
  
  // Static file extensions
  const staticExtensions = ['.js', '.css', '.html', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
  const isStaticFile = staticExtensions.some(ext => url.pathname.endsWith(ext));
  
  // Check if it's a local static file
  if (isStaticFile && (url.origin === location.origin || url.hostname === 'localhost')) {
    return true;
  }
  
  return false;
}

// Handle data requests with cache-first strategy
async function handleDataRequest(request) {
  const cache = await caches.open(DATA_CACHE_NAME);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Clone the response before using it
    const responseClone = networkResponse.clone();
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for data request, trying cache:', request.url);
    
    // If network fails, try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If no cached response, return a fallback
    return new Response(JSON.stringify({ error: 'Network error and no cached data available' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // If not in cache, try network
    const networkResponse = await fetch(request);
    
    // Clone the response before using it
    const responseClone = networkResponse.clone();
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Failed to fetch static file:', request.url, error);
    return new Response('Static file not available', { status: 404 });
  }
}

// Handle other requests with network-first strategy
async function handleOtherRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for other request, trying cache:', request.url);
    
    // If network fails, try cache
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If no cached response, return error
    return new Response('Resource not available', { status: 404 });
  }
}

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Get any pending requests from IndexedDB or other storage
    // and retry them when back online
    console.log('[SW] Performing background sync');
    
    // This is where you would implement retry logic for failed requests
    // For now, just log that sync occurred
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Flogger',
    icon: '/favicon/web-app-manifest-192x192.png',
    badge: '/favicon/favicon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/favicon/favicon.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon/favicon.svg'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Flogger', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click event:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
}); 