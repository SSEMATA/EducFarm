import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import {
  Users, CircuitBoard, CloudSun, Settings, ShieldCheck,
  RefreshCw, Activity, CheckCircle2, ShieldOff, Wifi, WifiOff,
} from 'lucide-react';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = user.admin_level === 'superadmin';

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        user.can_manage_users   || isSuperAdmin ? api.get('/users/admin/users/')    : Promise.resolve(null),
        user.can_manage_devices || isSuperAdmin ? api.get('/users/admin/devices/')  : Promise.resolve(null),
        user.can_manage_system  || isSuperAdmin ? api.get('/users/admin/settings/') : Promise.resolve(null),
      ]);
      const users   = results[0].value?.data ?? null;
      const devices = results[1].value?.data ?? null;
      const system  = results[2].value?.data?.system ?? null;

      setStats({
        totalUsers:    users   ? users.length                              : null,
        activeUsers:   users   ? users.filter(u => u.is_active).length    : null,
        inactiveUsers: users   ? users.filter(u => !u.is_active).length   : null,
        adminCount:    users   ? users.filter(u => u.is_staff).length     : null,
        totalDevices:  devices ? devices.length                            : null,
        onlineDevices: devices ? devices.filter(d => d.status === 'Online').length  : null,
        pairedDevices: devices ? devices.filter(d => d.is_paired).length  : null,
        systemOnline:  system  ? system.online                            : null,
      });
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const CARDS = [
    {
      perm: 'can_manage_users',
      title: 'Total Users',
      value: stats?.totalUsers,
      icon: <Users size={22} color="#6366f1" />,
      bg: '#ede9fe',
      sub: stats ? `${stats.activeUsers} active · ${stats.inactiveUsers} inactive` : '',
      link: '/admin/users',
    },
    {
      perm: 'can_manage_users',
      title: 'Admin Accounts',
      value: stats?.adminCount,
      icon: <ShieldCheck size={22} color="#2d7a4f" />,
      bg: '#dcfce7',
      sub: 'Staff with admin access',
      link: '/admin/users',
    },
    {
      perm: 'can_manage_devices',
      title: 'Total Devices',
      value: stats?.totalDevices,
      icon: <CircuitBoard size={22} color="#0369a1" />,
      bg: '#e0f2fe',
      sub: stats ? `${stats.pairedDevices} paired` : '',
      link: '/admin/devices',
    },
    {
      perm: 'can_manage_devices',
      title: 'Online Devices',
      value: stats?.onlineDevices,
      icon: <Wifi size={22} color="#10b981" />,
      bg: '#f0fdf4',
      sub: stats?.totalDevices != null ? `of ${stats.totalDevices} total` : '',
      link: '/admin/devices',
    },
  ];

  const visibleCards = CARDS.filter(c => isSuperAdmin || user[c.perm]);

  const QUICK_LINKS = [
    { perm: 'can_manage_users',   to: '/admin/users',    Icon: Users,       label: 'Manage Users'    },
    { perm: 'can_manage_devices', to: '/admin/devices',  Icon: CircuitBoard,label: 'Manage Devices'  },
    { perm: 'can_manage_weather', to: '/admin/weather',  Icon: CloudSun,    label: 'Weather API'     },
    { perm: 'can_manage_system',  to: '/admin/settings', Icon: Settings,    label: 'System Settings' },
  ].filter(l => isSuperAdmin || user[l.perm]);

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Welcome, {user.full_name?.split(' ')[0]}</h1>
            <p className={styles.subtitle}>
              <span className={styles.levelBadge}>{user.admin_level}</span>
              {stats?.systemOnline != null && (
                <span className={stats.systemOnline ? styles.onlineDot : styles.offlineDot}>
                  {stats.systemOnline ? '● System Online' : '● System Offline'}
                </span>
              )}
            </p>
          </div>
          <button className={styles.refreshBtn} onClick={fetchStats} disabled={loading}>
            <RefreshCw size={14} className={loading ? styles.spinning : ''} /> Refresh
          </button>
        </div>

        {/* Stats cards */}
        {visibleCards.length > 0 && (
          <div className={styles.grid}>
            {visibleCards.map((c, i) => (
              <div key={i} className={styles.card} style={{ background: c.bg }}>
                <div className={styles.cardIcon}>{c.icon}</div>
                <div className={styles.cardBody}>
                  <span className={styles.cardTitle}>{c.title}</span>
                  <span className={styles.cardValue}>
                    {loading ? '—' : (c.value ?? '—')}
                  </span>
                  {c.sub && <span className={styles.cardSub}>{c.sub}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick links */}
        {QUICK_LINKS.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Quick Access</div>
            <div className={styles.quickGrid}>
              {QUICK_LINKS.map(({ to, Icon, label }) => (
                <Link key={to} to={to} className={styles.quickCard}>
                  <Icon size={20} color="#2d7a4f" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Info row */}
        <div className={styles.infoRow}>
          <div className={styles.infoCard}>
            <ShieldCheck size={16} color="#6366f1" />
            <div>
              <span className={styles.infoLabel}>Admin Level</span>
              <span className={styles.infoValue} style={{ textTransform: 'capitalize' }}>{user.admin_level}</span>
            </div>
          </div>
          <div className={styles.infoCard}>
            <Activity size={16} color="#10b981" />
            <div>
              <span className={styles.infoLabel}>Permissions</span>
              <span className={styles.infoValue}>
                {isSuperAdmin ? 'Full Access' : [
                  user.can_manage_users   && 'Users',
                  user.can_manage_devices && 'Devices',
                  user.can_manage_weather && 'Weather',
                  user.can_manage_system  && 'System',
                ].filter(Boolean).join(', ') || 'None assigned'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
