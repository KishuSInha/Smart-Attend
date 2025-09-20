// Service Worker for Smart Attend PWA
const CACHE_NAME = 'smartattend-v1.0.0';
const STATIC_CACHE_NAME = 'smartattend-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'smartattend-dynamic-v1.0.0';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/assets/icon-192.png',
  '/assets/icon-512.png'
];

// Network-first resources (API calls, dynamic content)
const NETWORK_FIRST_ROUTES = [
  '/api/',
  '/dashboard/',
  '/attendance'
];

// Cache-first resources (static assets, images)
const CACHE_FIRST_ROUTES = [
  '/assets/',
  '/static/',
  '.js',
  '.css',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.ico'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Network first strategy for API calls and dynamic content
  if (NETWORK_FIRST_ROUTES.some(route => url.pathname.includes(route))) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Cache first strategy for static assets
  if (CACHE_FIRST_ROUTES.some(route => 
    url.pathname.includes(route) || url.pathname.endsWith(route)
  )) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Default: Stale while revalidate for HTML pages
  event.respondWith(staleWhileRevalidate(request));
});

// Network first strategy - for dynamic content
async function networkFirst(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the response for offline use
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', request.url);
    
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback if available
    if (request.destination === 'document') {
      return caches.match('/offline.html') || new Response(
        '<!DOCTYPE html><html><body><h1>Offline</h1><p>Please check your connection</p></body></html>',
        { headers: { 'Content-Type': 'text/html' } }
      );
    }
    
    throw error;
  }
}

// Cache first strategy - for static assets
async function cacheFirst(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Cache miss, try network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache for future use
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Cache and network both failed for:', request.url);
    throw error;
  }
}

// Stale while revalidate strategy - for HTML pages
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Fetch in background to update cache
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, but we might have cache
    return cachedResponse;
  });
  
  // Return cached version immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'attendance-sync') {
    event.waitUntil(syncAttendanceData());
  }
});

// Sync offline attendance data when connection is restored
async function syncAttendanceData() {
  try {
    // Get offline attendance data from IndexedDB or localStorage
    const offlineData = await getOfflineAttendanceData();
    
    if (offlineData && offlineData.length > 0) {
      console.log('[SW] Syncing offline attendance data:', offlineData.length, 'records');
      
      // Send data to server
      const response = await fetch('/api/attendance/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(offlineData)
      });
      
      if (response.ok) {
        // Clear offline data after successful sync
        await clearOfflineAttendanceData();
        console.log('[SW] Offline data synced successfully');
        
        // Notify the main thread
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_SUCCESS',
              data: { recordCount: offlineData.length }
            });
          });
        });
      }
    }
  } catch (error) {
    console.error('[SW] Failed to sync offline data:', error);
  }
}

// Helper functions for offline data management
async function getOfflineAttendanceData() {
  // This would typically use IndexedDB
  // For now, return empty array as placeholder
  return [];
}

async function clearOfflineAttendanceData() {
  // Clear offline attendance data after successful sync
  console.log('[SW] Clearing offline attendance data');
}

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service worker script loaded');