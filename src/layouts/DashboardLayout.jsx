import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Cpu, CloudSun, Bell, Settings,
  LogOut, ChevronLeft, ChevronRight, Menu, Download, X,
} from 'lucide-react';
import EducFarmLogo from '../components/EducFarmLogo';
import styles from './DashboardLayout.module.css';

const NAV_ITEMS = [
  { to: '/dashboard',     Icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/devices',       Icon: Cpu,             label: 'Devices'       },
  { to: '/irrigation-planner', Icon: CloudSun, label: 'Irrigation Planner' },
  { to: '/notifications', Icon: Bell,            label: 'Notifications' },
  { to: '/settings',      Icon: Settings,        label: 'Settings'      },
];

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [installBar, setInstallBar] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Don't show if already installed or permanently dismissed
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    const dismissed = localStorage.getItem('pwa_bar_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed, 10) < 7 * 24 * 60 * 60 * 1000) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallBar(true);
      window.__deferredPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS — show bar without deferred prompt
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS && !dismissed) setInstallBar(true);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (outcome === 'accepted') setInstallBar(false);
    } else {
      // iOS or fallback — open the full InstallPrompt sheet
      window.__pwaPromptShow?.();
    }
  };

  const handleDismissBar = () => {
    setInstallBar(false);
    localStorage.setItem('pwa_bar_dismissed', Date.now().toString());
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initials = user.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className={styles.shell}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className={styles.overlay} onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoWrapper}>
            {!collapsed
              ? <EducFarmLogo size={32} variant="dark" showText={true} />
              : <EducFarmLogo size={32} variant="dark" showText={false} />
            }
          </div>
          <button
            className={styles.collapseBtn}
            onClick={() => setCollapsed((v) => !v)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ to, Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className={styles.navIcon} />
              {!collapsed && <span className={styles.navLabel}>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <button className={styles.logoutBtn} onClick={handleLogout} title={collapsed ? 'Logout' : undefined}>
          <LogOut size={18} className={styles.navIcon} />
          {!collapsed && <span>Logout</span>}
        </button>
      </aside>

      {/* Main area */}
      <div className={styles.main}>
        {/* Navbar */}
        <header className={styles.navbar}>
          <button
            className={styles.menuBtn}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className={styles.navbarTitle}>
            Smart Irrigation Dashboard
          </div>
          <div className={styles.navbarRight}>
            <NavLink to="/notifications" className={styles.iconBtn} title="Notifications">
              <Bell size={18} />
            </NavLink>
            <div className={styles.avatar} title={user.full_name || 'User'}>
              {initials}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.full_name || 'Farmer'}</span>
              <span className={styles.userRole}>{user.farm_name || 'EducFarm'}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className={styles.content}>{children}</main>

        {/* Install bar */}
        {installBar && (
          <div className={styles.installBar}>
            <div className={styles.installBarLeft}>
              <div className={styles.installBarLogo}>
                <EducFarmLogo size={22} variant="dark" showText={false} />
              </div>
              <div className={styles.installBarText}>
                <span className={styles.installBarTitle}>Install EducFarm</span>
                <span className={styles.installBarSub}>Add to home screen — works offline</span>
              </div>
            </div>
            <div className={styles.installBarActions}>
              <button className={styles.installBarBtn} onClick={handleInstall}>
                <Download size={13} strokeWidth={2.5} /> Install
              </button>
              <button className={styles.installBarClose} onClick={handleDismissBar} aria-label="Dismiss">
                <X size={15} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
