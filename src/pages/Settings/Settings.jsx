import { useNavigate } from 'react-router-dom';
import { Wifi, MessageSquare, Sprout, ChevronRight, User, Mail, MapPin, Cpu, Download, Smartphone } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
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
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initials = user.full_name
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

        {/* Account section — below cards */}
        <div className={styles.sectionLabel}>Account</div>
        <div className={styles.profileCard}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>{user.full_name || 'Farmer'}</span>
            {user.email && (
              <span className={styles.profileMeta}>
                <Mail size={12} /> {user.email}
              </span>
            )}
            {(user.farm_name || user.country) && (
              <span className={styles.profileMeta}>
                <MapPin size={12} />
                {user.farm_name}{user.country ? ` · ${user.country}` : ''}
              </span>
            )}
          </div>
          <div className={styles.profileBadge}>
            <User size={13} /> Farmer
          </div>
        </div>

        {/* Device Management section */}
        <div className={styles.sectionLabel}>Device Management</div>
        <button className={styles.navCard} onClick={() => navigate('/settings/devices')}>
          <div className={styles.navIconWrap}>
            <Cpu size={24} strokeWidth={1.8} color="#2d7a4f" />
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
          onClick={() => {
            if (window.__pwaPromptShow) {
              window.__pwaPromptShow();
            } else if (window.matchMedia('(display-mode: standalone)').matches) {
              alert('EducFarm is already installed on your device.');
            } else {
              alert('To install: use your browser menu → "Add to Home Screen" or "Install App".');
            }
          }}
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

      </div>
    </DashboardLayout>
  );
}
