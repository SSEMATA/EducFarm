import { useNavigate } from 'react-router-dom';
import { Wifi, MessageSquare, Sprout, ChevronRight, User, Mail, MapPin, CircuitBoard, Download, Smartphone, Radio, Bell } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import styles from './Settings.module.css';

const SETTINGS_CARDS = [
  {
    to:     '/settings/wifi',
    Icon:   Wifi,
    title:  'WiFi Settings',
    desc:   'Configure network connection and scan for available networks.',
    accent: '#3b82f6',
    bg:     '#eff6ff',
    border: '#bfdbfe',
  },
  {
    to:     '/settings/sms',
    Icon:   MessageSquare,
    title:  'SMS Alerts',
    desc:   'Set up SMS notifications for pump, weather and sensor events.',
    accent: '#16a34a',
    bg:     '#f0fdf4',
    border: '#bbf7d0',
  },
  {
    to:     '/settings/farm',
    Icon:   Sprout,
    title:  'Farm Settings',
    desc:   'Set soil type, plant type and moisture thresholds.',
    accent: '#f59e0b',
    bg:     '#fffbeb',
    border: '#fde68a',
  },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/* Header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageSubtitle}>Manage your farm and device configuration</p>
        </div>

        {/* Configuration cards — 3 in one row */}
        <div className={styles.sectionLabel}>Configuration</div>
        <div className={styles.grid}>
          {SETTINGS_CARDS.map(({ to, Icon, title, desc, accent, bg, border }) => (
            <button
              key={to}
              className={styles.card}
              style={{ '--accent': accent, '--bg': bg, '--border': border }}
              onClick={() => navigate(to)}
            >
              <div className={styles.iconWrap} style={{ background: bg, border: `1.5px solid ${border}` }}>
                <Icon size={26} strokeWidth={1.8} style={{ color: accent }} />
              </div>
              <span className={styles.cardTitle}>{title}</span>
              <span className={styles.cardDesc}>{desc}</span>
              <span className={styles.cardArrow}>
                <ChevronRight size={16} />
              </span>
            </button>
          ))}
        </div>

        {/* My Devices — above Device Management */}
        <div className={styles.sectionLabel}>Devices</div>
        <button className={styles.navCard} onClick={() => navigate('/devices')}>
          <div className={styles.navIconWrap} style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe' }}>
            <Radio size={24} strokeWidth={1.8} color="#3b82f6" />
          </div>
          <div className={styles.navInfo}>
            <span className={styles.navTitle}>My Devices</span>
            <span className={styles.navDesc}>View, edit and manage your connected farm devices.</span>
          </div>
          <ChevronRight size={18} className={styles.navArrow} />
        </button>

        {/* Device Management */}
        <div className={styles.sectionLabel}>Device Management</div>
        <button className={styles.navCard} onClick={() => navigate('/settings/devices')}>
          <div className={styles.navIconWrap}>
            <CircuitBoard size={24} strokeWidth={1.8} color="#2d7a4f" />
          </div>
          <div className={styles.navInfo}>
            <span className={styles.navTitle}>Device Management</span>
            <span className={styles.navDesc}>Pair hardware devices and test connections before registration.</span>
          </div>
          <ChevronRight size={18} className={styles.navArrow} />
        </button>

        {/* Install App */}
        <div className={styles.sectionLabel}>App</div>
        <button
          className={styles.navCard}
          onClick={() => navigate('/notifications')}
        >
          <div className={styles.navIconWrap} style={{ background: '#f5f3ff', border: '1.5px solid #ddd6fe' }}>
            <Bell size={24} strokeWidth={1.8} color="#7c3aed" />
          </div>
          <div className={styles.navInfo}>
            <span className={styles.navTitle}>Push Notifications</span>
            <span className={styles.navDesc}>Enable push alerts for irrigation, weather and sensor events.</span>
          </div>
          <ChevronRight size={18} className={styles.navArrow} />
        </button>
        <button
          className={styles.navCard}
          onClick={() => window.__pwaPromptShow?.()}
        >
          <div className={styles.navIconWrap} style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0' }}>
            <Download size={24} strokeWidth={1.8} color="#2d7a4f" />
          </div>
          <div className={styles.navInfo}>
            <span className={styles.navTitle}>Install App</span>
            <span className={styles.navDesc}>Add EducFarm to your home screen for offline access and a native app feel.</span>
          </div>
          <Smartphone size={18} className={styles.navArrow} color="#2d7a4f" />
        </button>

        {/* My Account — last */}
        <div className={styles.sectionLabel}>My Account</div>
        <button className={styles.navCard} onClick={() => navigate('/settings/account')}>
          <div className={styles.navIconWrap} style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0' }}>
            <div className={styles.avatar} style={{width:44,height:44,fontSize:'0.95rem'}}>{initials}</div>
          </div>
          <div className={styles.navInfo}>
            <span className={styles.navTitle}>{user?.full_name || 'Farmer'}</span>
            <span className={styles.navDesc}>{user?.email || user?.phone_number || 'Change name, password, email or delete account'}</span>
          </div>
          <ChevronRight size={18} className={styles.navArrow} />
        </button>

      </div>
    </DashboardLayout>
  );
}
