// Service Worker with Push Notifications and Badge Support
const CACHE_NAME = 'educfarm-v1';

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received', event);
  
  let notificationData = {
    title: 'EducFarm Notification',
    body: 'You have a new notification',
    icon: '/EducFarm/icons/pwa-192.png',
    badge: '/EducFarm/icons/pwa-192.png',
    tag: 'educfarm-notification',
    requireInteraction: false,
  };

  try {
    if (event.data) {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data,
      };
    }
  } catch (e) {
    notificationData.body = event.data ? event.data.text() : 'You have a new notification';
  }

  // Update badge count if provided
  if (notificationData.badge_count !== undefined && 'setAppBadge' in self.registration) {
    event.waitUntil(
      self.registration.setAppBadge(notificationData.badge_count).catch(() => {})
    );
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data || {},
      actions: notificationData.actions || [],
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked', event);
  event.notification.close();

  const urlToOpen = event.notification.data.url || '/EducFarm/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if window already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not open, open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed', event);
  
  if (event.notification.data && event.notification.data.dismissUrl) {
    fetch(event.notification.data.dismissUrl);
  }
});

// Background sync for badge updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-badge') {
    event.waitUntil(
      (async () => {
        try {
          // Token is passed via the SET_TOKEN message and stored in SW scope
          const headers = self._authToken ? { Authorization: `Bearer ${self._authToken}` } : {};
          const response = await fetch(`${self.location.origin}/api/notifications/badge/`, { headers });
          if (response.ok) {
            const data = await response.json();
            if ('setAppBadge' in self.registration) {
              await self.registration.setAppBadge(data.unread_count || 0);
            }
          }
        } catch {}
      })()
    );
  }
});

// Store auth token passed from client for use in background sync
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SET_TOKEN') {
    self._authToken = event.data.token;
  }

  if (event.data && event.data.type === 'SET_BADGE') {
    const count = event.data.count;
    if ('setAppBadge' in self.registration && count !== undefined) {
      self.registration.setAppBadge(count).catch(() => {});
    }
  }

  if (event.data && event.data.type === 'CLEAR_BADGE') {
    if ('clearAppBadge' in self.registration) {
      self.registration.clearAppBadge().catch(() => {});
    }
  }
});
