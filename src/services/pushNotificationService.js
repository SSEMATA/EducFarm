/**
 * Push Notification Service
 * Handles service worker registration, push subscriptions, and badge management
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class PushNotificationService {
  constructor() {
    this.registration = null;
    this.subscription = null;
    this.permission = null;
  }

  /**
   * Initialize push notifications
   * - Register service worker
   * - Request notification permission
   * - Subscribe to push notifications
   * - Initialize badge (if user authenticated)
   */
  async init(skipBadge = false) {
    if (this._initializing) return false;
    this._initializing = true;
    try {
      // Check browser support
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return false;
      }

      // Reuse any existing SW registration instead of registering again
      this.registration =
        await navigator.serviceWorker.getRegistration('/EducFarm/') ??
        await navigator.serviceWorker.register('/EducFarm/sw.js', { scope: '/EducFarm/' });

      // Pass auth token to SW for background sync
      const token = localStorage.getItem('token');
      if (token) this._postToSW({ type: 'SET_TOKEN', token });

      // Get current permission status
      this.permission = Notification.permission;

      // If already granted, subscribe automatically
      if (this.permission === 'granted') {
        await this.subscribe();
      }

      // Initialize badge only if auth is ready and user wants it
      if (!skipBadge) {
        await this.initBadge();
      }

      return true;
    } catch (error) {
      console.error('[PN] Failed to initialize push notifications:', error);
      return false;
    } finally {
      this._initializing = false;
    }
  }

  /**
   * Request notification permission from user
   */
  async requestPermission() {
    try {
      console.log('[PN] Requesting notification permission...');
      this.permission = await Notification.requestPermission();
      console.log('[PN] Permission:', this.permission);

      if (this.permission === 'granted') {
        await this.subscribe();
      }

      return this.permission;
    } catch (error) {
      console.error('[PN] Failed to request permission:', error);
      return 'denied';
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe() {
    try {
      if (!this.registration) {
        console.warn('[PN] Service Worker not registered');
        return false;
      }

      // Check if already subscribed
      this.subscription = await this.registration.pushManager.getSubscription();

      if (this.subscription) {
        console.log('[PN] Already subscribed:', this.subscription);
        // Attempt to sync but don't fail if backend endpoint not available
        try {
          await this.syncSubscription();
        } catch (error) {
          console.warn('[PN] Could not sync existing subscription:', error);
        }
        return true;
      }

      // Subscribe with VAPID public key (backend should provide this)
      const options = {
        userVisibleOnly: true,
        // VAPID public key can be injected here from env or backend
      };

      // Try to get VAPID key from backend
      try {
        const response = await fetch(`${API_URL}/api/notifications/vapid-key/`);
        const data = await response.json();
        if (data.vapid_key) {
          options.applicationServerKey = this.urlBase64ToUint8Array(data.vapid_key);
        }
      } catch (error) {
        console.warn('[PN] Could not fetch VAPID key:', error);
      }

      this.subscription = await this.registration.pushManager.subscribe(options);
      console.log('[PN] Subscribed to push notifications:', this.subscription);

      // Send subscription to backend (non-blocking — don't fail if endpoint unavailable)
      try {
        await this.syncSubscription();
      } catch (error) {
        console.warn('[PN] Could not sync subscription with backend:', error);
        // Still return true since local subscription succeeded
      }

      return true;
    } catch (error) {
      console.error('[PN] Failed to subscribe:', error);
      return false;
    }
  }

  /**
   * Sync subscription with backend
   */
  async syncSubscription() {
    try {
      if (!this.subscription) {
        console.warn('[PN] No subscription to sync');
        return false;
      }

      const response = await fetch(`${API_URL}/api/notifications/subscribe/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          endpoint: this.subscription.endpoint,
          auth: btoa(String.fromCharCode(...new Uint8Array(this.subscription.getKey('auth')))),
          p256dh: btoa(String.fromCharCode(...new Uint8Array(this.subscription.getKey('p256dh')))),
        }),
        credentials: 'include',
      });

      if (response.ok) {
        console.log('[PN] Subscription synced with backend');
        return true;
      } else if (response.status === 404) {
        console.warn('[PN] Sync endpoint not available (404) — backend may not have push support yet');
        return false;
      } else if (response.status === 401) {
        console.warn('[PN] Unauthorized (401) — user not authenticated');
        return false;
      } else {
        console.error('[PN] Failed to sync subscription:', response.status);
        return false;
      }
    } catch (error) {
      console.error('[PN] Failed to sync subscription:', error);
      return false;
    }
  }

  /**
   * Initialize badge support
   */
  async initBadge() {
    try {
      if (!('setAppBadge' in navigator)) return false;

      const token = localStorage.getItem('token');
      if (!token) return false;

      const response = await fetch(`${API_URL}/api/notifications/badge/`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        console.warn('[PN] User not authenticated, skipping badge initialization');
        return false;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.unread_count > 0) {
          await navigator.setAppBadge(data.unread_count);
          console.log('[PN] Badge initialized:', data.unread_count);
        }
        return true;
      } else {
        console.warn('[PN] Badge fetch returned status:', response.status);
        return false;
      }
    } catch (error) {
      console.warn('[PN] Failed to initialize badge:', error);
      return false;
    }
  }

  /**
   * Update app badge
   */
  async updateBadge(count) {
    try {
      if (count > 0) {
        await navigator.setAppBadge?.(count);
        await this.registration?.setAppBadge?.(count);
      } else {
        await navigator.clearAppBadge?.();
        await this.registration?.clearAppBadge?.();
      }
      // Also tell SW so it can update during background sync
      this._postToSW({ type: 'SET_BADGE', count });
      return true;
    } catch (error) {
      console.error('[PN] Failed to update badge:', error);
      return false;
    }
  }

  async clearBadge() {
    try {
      await navigator.clearAppBadge?.();
      await this.registration?.clearAppBadge?.();
      this._postToSW({ type: 'CLEAR_BADGE' });
      return true;
    } catch (error) {
      console.error('[PN] Failed to clear badge:', error);
      return false;
    }
  }

  _postToSW(msg) {
    if (this.registration?.active) this.registration.active.postMessage(msg);
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe() {
    try {
      if (!this.subscription) return false;

      await fetch(`${API_URL}/api/notifications/unsubscribe/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ endpoint: this.subscription.endpoint }),
      });

      await this.subscription.unsubscribe();
      this.subscription = null;
      return true;
    } catch (error) {
      console.error('[PN] Failed to unsubscribe:', error);
      return false;
    }
  }

  /**
   * Get current subscription status
   */
  getStatus() {
    return {
      registered: !!this.registration,
      subscribed: !!this.subscription,
      permission: this.permission,
      endpoint: this.subscription?.endpoint || null,
    };
  }

  /**
   * Convert VAPID key from base64 to Uint8Array
   */
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  /**
   * Get CSRF token from cookies
   */
  getCsrfToken() {
    const name = 'csrftoken';
    let cookieValue = null;

    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + '=') {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }

    return cookieValue;
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();

export default pushNotificationService;
