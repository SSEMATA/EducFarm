import { useState, useCallback } from 'react';
import { Bell, Check, AlertCircle, Loader } from 'lucide-react';
import usePushNotifications from '../hooks/usePushNotifications';

export default function NotificationSettings() {
  const {
    initialized,
    registered,
    subscribed,
    permission,
    loading,
    error,
    requestPermission,
    updateBadge,
    unsubscribe,
  } = usePushNotifications();

  const [testLoading, setTestLoading] = useState(false);
  const [testMessage, setTestMessage] = useState(null);

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      setTestMessage({
        type: 'success',
        text: '✅ Notifications enabled! You will receive push notifications.',
      });
    } else {
      setTestMessage({
        type: 'error',
        text: '❌ Notification permission was denied. Check your browser settings.',
      });
    }
    setTimeout(() => setTestMessage(null), 5000);
  };

  const handleUnsubscribe = async () => {
    if (window.confirm('Are you sure you want to disable push notifications?')) {
      const success = await unsubscribe();
      if (success) {
        setTestMessage({
          type: 'success',
          text: '✅ Push notifications disabled.',
        });
      } else {
        setTestMessage({
          type: 'error',
          text: '❌ Failed to disable notifications.',
        });
      }
      setTimeout(() => setTestMessage(null), 5000);
    }
  };

  const handleTestPush = async () => {
    try {
      setTestLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/test-push/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success > 0) {
          setTestMessage({
            type: 'success',
            text: `✅ Test notification sent to ${data.success} device(s)!`,
          });
        } else {
          setTestMessage({
            type: 'warning',
            text: `⚠️ No devices subscribed. Enable notifications first.`,
          });
        }
      } else {
        setTestMessage({
          type: 'error',
          text: '❌ Failed to send test notification.',
        });
      }
    } catch (err) {
      setTestMessage({
        type: 'error',
        text: `❌ Error: ${err.message}`,
      });
    } finally {
      setTestLoading(false);
      setTimeout(() => setTestMessage(null), 5000);
    }
  };

  const handleSetBadge = async () => {
    await updateBadge(3);
    setTestMessage({
      type: 'success',
      text: '✅ Badge updated to 3 (for testing)',
    });
    setTimeout(() => setTestMessage(null), 5000);
  };

  const getStatusColor = () => {
    if (!initialized) return '#9ca3af'; // gray
    if (subscribed) return '#4ade80'; // green
    if (permission === 'denied') return '#ef4444'; // red
    return '#facc15'; // yellow
  };

  const getStatusText = () => {
    if (!initialized) return 'Initializing...';
    if (subscribed) return 'Enabled';
    if (permission === 'granted' && !subscribed) return 'Enabled (pending)';
    if (permission === 'denied') return 'Blocked by browser';
    return 'Disabled';
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Bell size={24} style={{ color: '#4ade80' }} />
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Push Notifications</h2>
        </div>
        <p style={{ margin: 0, color: '#666', lineHeight: 1.6 }}>
          Receive instant push notifications for irrigation alerts, weather updates, and device status changes.
        </p>
      </div>

      {/* Status Card */}
      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          background: '#fafafa',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: getStatusColor(),
            }}
          />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Status: {getStatusText()}</span>
        </div>

        <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.8 }}>
          <div>
            <strong>Browser Support:</strong> {registered ? '✅ Service Worker' : '❌ Not registered'}
          </div>
          <div>
            <strong>Permission:</strong> {permission === 'granted' ? '✅ Granted' : permission === 'denied' ? '❌ Denied' : '⏳ Not requested'}
          </div>
          <div>
            <strong>Subscribed:</strong> {subscribed ? '✅ Active' : '❌ Inactive'}
          </div>
        </div>

        {error && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {!subscribed && permission !== 'denied' && (
          <button
            onClick={handleRequestPermission}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#4ade80',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            {loading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={16} />}
            {loading ? 'Enabling...' : 'Enable Notifications'}
          </button>
        )}

        {subscribed && (
          <>
            <button
              onClick={handleTestPush}
              disabled={testLoading}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: testLoading ? 'not-allowed' : 'pointer',
                opacity: testLoading ? 0.6 : 1,
              }}
            >
              {testLoading ? 'Sending...' : '🧪 Send Test Notification'}
            </button>

            <button
              onClick={handleSetBadge}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🔔 Test Badge (Set to 3)
            </button>

            <button
              onClick={handleUnsubscribe}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Disabling...' : 'Disable Notifications'}
            </button>
          </>
        )}

        {permission === 'denied' && (
          <div
            style={{
              padding: '1rem',
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#991b1b',
              fontSize: '0.9rem',
              lineHeight: 1.6,
            }}
          >
            <strong>⚠️ Notifications Blocked</strong>
            <p style={{ margin: '0.5rem 0 0 0' }}>
              You've blocked notifications in your browser. To enable them:
              <ol style={{ margin: '0.5rem 0 0 1.5rem', paddingLeft: 0 }}>
                <li>Click the lock/info icon in the address bar</li>
                <li>Find "Notifications" setting</li>
                <li>Change to "Allow"</li>
                <li>Refresh this page</li>
              </ol>
            </p>
          </div>
        )}
      </div>

      {/* Test Message */}
      {testMessage && (
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: testMessage.type === 'success' ? '#dcfce7' : testMessage.type === 'warning' ? '#fef3c7' : '#fee2e2',
            border: `1px solid ${testMessage.type === 'success' ? '#bbf7d0' : testMessage.type === 'warning' ? '#fcd34d' : '#fecaca'}`,
            borderRadius: '8px',
            color: testMessage.type === 'success' ? '#166534' : testMessage.type === 'warning' ? '#92400e' : '#991b1b',
            fontSize: '0.9rem',
          }}
        >
          {testMessage.text}
        </div>
      )}

      {/* Info Box */}
      <div
        style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: '#1e40af',
          lineHeight: 1.7,
        }}
      >
        <strong>ℹ️ About Push Notifications</strong>
        <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
          <li>Receive alerts even when the app is closed</li>
          <li>Badge shows unread notification count on your home screen</li>
          <li>All notifications are encrypted and secure</li>
          <li>You can disable anytime from this settings page</li>
        </ul>
      </div>
    </div>
  );
}
