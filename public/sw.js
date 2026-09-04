// Aura PWA Service Worker for Offline Caching and Push Notifications
const CACHE_NAME = 'aura-pwa-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Initial PWA asset caching error:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Pass through non-GET and API requests directly to network
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }

  
  if (!event.request.url.startsWith("http")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful static responses
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/index.html');
          }
          return new Response('Offline content unavailable', { status: 503 });
        });
      })
  );
});

// Push notification background receiver
self.addEventListener('push', (event) => {
  let data = { title: 'New Notification from Aura', body: 'You have a new update in Aura.' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: 'Aura Alert', body: event.data.text() };
    }
  }

  // Incoming Call Push Event
  if (data.type === 'CALL_INCOMING' || data.action === 'incoming_call') {
    const isVideo = data.isVideo !== false;
    const callOptions = {
      body: data.body || `${data.callerName || 'Someone'} is calling you on Aura...`,
      icon: data.callerAvatar || data.icon || '/icons/icon-192.svg',
      badge: '/icons/icon-192.svg',
      tag: data.roomId ? `call_${data.roomId}` : 'incoming_call',
      renotify: true,
      requireInteraction: true,
      silent: false,
      vibrate: [500, 250, 500, 250, 1000, 300, 1000, 300, 1000],
      actions: [
        { action: 'answer', title: '📞 Answer' },
        { action: 'decline', title: '❌ Decline' }
      ],
      data: {
        url: data.url || `/?action=incoming_call&roomId=${encodeURIComponent(data.roomId || '')}&callerId=${encodeURIComponent(data.callerId || '')}&isVideo=${isVideo}`,
        roomId: data.roomId,
        callerName: data.callerName,
        isVideo: isVideo
      }
    };

    event.waitUntil(
      self.registration.showNotification(
        data.title || `📞 Incoming ${isVideo ? 'Video' : 'Audio'} Call`,
        callOptions
      )
    );
    return;
  }

  // Cancelled Call or Ended Call (closes active ringing push)
  if (data.type === 'CALL_CANCELLED' || data.action === 'call_cancelled') {
    event.waitUntil(
      self.registration.getNotifications().then((notifications) => {
        const tagToClose = data.roomId ? `call_${data.roomId}` : 'incoming_call';
        notifications.forEach((n) => {
          if (n.tag === tagToClose) {
            n.close();
          }
        });
        if (data.isMissed) {
          return self.registration.showNotification(`Missed Call from ${data.callerName || 'Someone'}`, {
            body: 'Tap to view in Aura and call back',
            icon: data.callerAvatar || '/icons/icon-192.svg',
            badge: '/icons/icon-192.svg',
            tag: `missed_${data.roomId || Date.now()}`,
            data: { url: '/?tab=chat' }
          });
        }
      })
    );
    return;
  }

  // Standard Notification Event
  const options = {
    body: data.body || 'New message on Aura',
    icon: data.icon || '/icons/icon-192.svg',
    badge: '/icons/icon-192.svg',
    vibrate: [200, 100, 200],
    data: { url: data.url || data.actionId || '/' },
    actions: [
      { action: 'open', title: 'Open Aura' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Aura', options)
  );
});

// Notification Click & Action Router
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'decline') {
    const roomId = event.notification.data?.roomId;
    if (roomId) {
      fetch(`/api/calls/${encodeURIComponent(roomId)}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'declined' })
      }).catch(() => {});
    }
    return;
  }

  let targetUrl = event.notification.data?.url || '/';
  if (event.action === 'answer' && event.notification.data?.roomId) {
    const d = event.notification.data;
    targetUrl = `/?action=answer_call&roomId=${encodeURIComponent(d.roomId)}&isVideo=${d.isVideo !== false}`;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
