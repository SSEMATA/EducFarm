import { useEffect, useState, useCallback } from 'react';
import { Settings2, CloudRain, Droplets, Radio, Bell, BellOff, RefreshCw, Check, CircuitBoard, Settings } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import NotificationSettings from '../../components/NotificationSettings';
import pushNotificationService from '../../services/pushNotificationService';
import api from '../../services/api';
import styles from './Notifications.module.css';

const TYPE_META = {
  pump:    { Icon: Settings2, label: 'Pump',           accent: '#f59e0b', bg: '#fffbeb' },
  weather: { Icon: CloudRain, label: 'Weather',         accent: '#3b82f6', bg: '#eff6ff' },
  water:   { Icon: Droplets,  label: 'Low Water',       accent: '#0ea5e9', bg: '#f0f9ff' },
  sensor:  { Icon: Radio,     label: 'Sensor Failure',  accent: '#ef4444', bg: '#fef2f2' },
  system:  { Icon: Bell,      label: 'System',          accent: '#8b5cf6', bg: '#f5f3ff' },
};

function getMeta(type = '') {
  return TYPE_META[type.toLowerCase()] ?? TYPE_META.system;
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function Notifications() {
  const [tab, setTab] = useState('list'); // list | settings
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [filter, setFilter]               = useState('all'); // all | unread | read

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/notifications/');
      setNotifications(Array.isArray(data) ? data : data.results ?? []);
    } catch {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/`, { is_read: true });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read/');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      pushNotificationService.clearBadge();
    } catch { /* silent */ }
  };

  const visible = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read')   return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/* ── Header ───────────────────────────────────── */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Notifications</h1>
            <p className={styles.pageSubtitle}>
              {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
            </p>
          </div>
          <div className={styles.headerActions}>
            <button
              className={`${styles.refreshBtn} ${tab === 'settings' ? styles.filterActive : ''}`}
              onClick={() => setTab((t) => t === 'settings' ? 'list' : 'settings')}
            >
              <Settings size={14} /> {tab === 'settings' ? 'Back' : 'Push Settings'}
            </button>
            {tab === 'list' && unreadCount > 0 && (
              <button className={styles.markAllBtn} onClick={markAllRead}>
                <Check size={14} /> Mark all read
              </button>
            )}
            {tab === 'list' && (
              <button className={styles.refreshBtn} onClick={fetchNotifications} disabled={loading}>
                <RefreshCw size={14} className={loading ? styles.spinning : ''} /> Refresh
              </button>
            )}
          </div>
        </div>

        {/* ── Filter tabs ──────────────────────────────── */}
        {tab === 'settings' ? (
          <NotificationSettings />
        ) : (<>
        <div className={styles.filterRow}>
          {['all', 'unread', 'read'].map((f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'unread' && unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {/* ── List ─────────────────────────────────────── */}
        <div className={styles.list}>
          {loading ? (
            <div className={styles.stateBox}>
              <span className={styles.bigSpinner} />
              <p>Loading notifications…</p>
            </div>
          ) : visible.length === 0 ? (
            <div className={styles.stateBox}>
              <BellOff size={40} className={styles.emptyIcon} />
              <p>{filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}</p>
            </div>
          ) : (
            visible.map((n) => {
              const { Icon, label, accent, bg } = getMeta(n.type);
              return (
                <div
                  key={n.id}
                  className={`${styles.item} ${!n.is_read ? styles.itemUnread : ''}`}
                  style={{ '--item-accent': accent, '--item-bg': bg }}
                  onClick={() => !n.is_read && markRead(n.id)}
                >
                  <span className={styles.itemIcon}>
                    <Icon size={22} color={accent} strokeWidth={1.8} />
                  </span>
                  <div className={styles.itemBody}>
                    <div className={styles.itemTop}>
                      <span className={styles.itemTitle}>{n.title ?? label}</span>
                      <span className={styles.itemTime}>{n.created_at ? timeAgo(n.created_at) : ''}</span>
                    </div>
                    <p className={styles.itemMessage}>{n.message}</p>
                    {n.device_name && (
                      <span className={styles.itemDevice}>
                        <CircuitBoard size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                        {n.device_name}
                      </span>
                    )}
                  </div>
                  {!n.is_read && <span className={styles.unreadDot} />}
                </div>
              );
            })
          )}
        </div>

        {!loading && visible.length > 0 && (
          <p className={styles.count}>
            Showing {visible.length} of {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </p>
        )}
        </>)}
      </div>
    </DashboardLayout>
  );
}
