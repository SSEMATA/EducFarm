// Service Worker — push notifications + badge support
// Caching is handled by the VitePWA-generated workbox SW (sw.js injected at build time).
// This file is the *public* fallback used only in dev; in production VitePWA replaces it.

const CACHE_NAME = 'educfarm-v3';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

// ── Push notifications ────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = {
    title: 'EducFarm',
    body: 'You have a new notification',
    icon: '/icons/pwa-192.png',
    badge: '/icons/pwa-192.png',
    tag: 'educfarm-notification',
  };

  try {
    if (event.data) Object.assign(data, event.data.json());
  } catch {
    if (event.data) data.body = event.data.text();
  }

  if (data.badge_count !== undefined && 'setAppBadge' in self.registration) {
    self.registration.setAppBadge(data.badge_count).catch(() => {});
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag,
      requireInteraction: data.requireInteraction || false,
      data: data.data || {},
      actions: data.actions || [],
    })
  );
});

// ── Notification click ────────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});

// ── Badge / token messages from app ──────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SET_TOKEN')  self._authToken = event.data.token;
  if (event.data?.type === 'SET_BADGE')  self.registration.setAppBadge?.(event.data.count).catch(() => {});
  if (event.data?.type === 'CLEAR_BADGE') self.registration.clearAppBadge?.().catch(() => {});
});

// ── Background sync for badge count ──────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag !== 'sync-badge') return;
  event.waitUntil((async () => {
    try {
      const headers = self._authToken ? { Authorization: `Bearer ${self._authToken}` } : {};
      const res = await fetch(`${self.location.origin}/api/notifications/badge/`, { headers });
      if (res.ok) {
        const { unread_count } = await res.json();
        await self.registration.setAppBadge?.(unread_count || 0);
      }
    } catch {}
  })());
});
