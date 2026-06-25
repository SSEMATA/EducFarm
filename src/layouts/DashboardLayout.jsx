import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, CircuitBoard, CloudSun, Bell, Settings,
  LogOut, ChevronLeft, ChevronRight, Menu, Download, X, User, FlaskConical, Activity, Server, Users,
} from 'lucide-react';
import EducFarmLogo from '../components/EducFarmLogo';
import OfflineBanner from '../components/OfflineBanner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ensureFreshAvatar } from '../utils/avatarCache';
import styles from './DashboardLayout.module.css';

const USER_NAV = [
  { to: '/dashboard',          Icon: LayoutDashboard, label: 'Dashboard'          },
  { to: '/devices',            Icon: CircuitBoard,    label: 'Devices'            },
  { to: '/irrigation-planner', Icon: CloudSun,        label: 'Irrigation Planner' },
  { to: '/live-data',          Icon: Activity,        label: 'Live Data'          },
  ...(import.meta.env.DEV ? [{ to: '/simulate', Icon: FlaskConical, label: 'Simulate' }] : []),
  { to: '/settings',           Icon: Settings,        label: 'Settings'           },
];

const BOTTOM_NAV = [
  { to: '/dashboard',          Icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/irrigation-planner', Icon: CloudSun,        label: 'Planner'   },
  { to: '/live-data',          Icon: Activity,        label: 'Live Data' },
  { to: '/settings',           Icon: Settings,        label: 'Settings'  },
];


const ADMIN_NAV = [
  { to: '/admin/dashboard', Icon: LayoutDashboard, label: 'Dashboard',    perm: null                },
  { to: '/admin/users',     Icon: Users,           label: 'Users',        perm: 'can_manage_users'  },
  { to: '/admin/devices',   Icon: Server,          label: 'Devices',      perm: 'can_manage_devices'},
  { to: '/admin/weather',   Icon: CloudSun,        label: 'Weather API',  perm: 'can_manage_weather'},
  { to: '/admin/settings',  Icon: Settings,        label: 'Settings',     perm: 'can_manage_system' },
];

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed]     = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [installBar, setInstallBar]   = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileRef = useRef(null);

  const isSuperAdmin = user?.admin_level === 'superadmin';
  const NAV_ITEMS = user?.is_staff
    ? ADMIN_NAV.filter(({ perm }) => perm === null || isSuperAdmin || user[perm])
    : USER_NAV;

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const { data } = await api.get('/notifications/unread-count/');
        setUnreadCount(data.count ?? 0);
      } catch { /* silent */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const beat = () => api.post('/users/heartbeat/').catch(() => {});
    beat();
    const interval = setInterval(beat, 120000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    // Don't show if already installed or permanently dismissed
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    const dismissed = localStorage.getItem('pwa_bar_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed, 10) < 7 * 24 * 60 * 60 * 1000) return;

    const handler = (e) => {
      // Must preventDefault to keep the event for later use with prompt()
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallBar(true);
      window.__deferredPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS — only show manual instructions bar (no prompt() available on iOS)
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS) setInstallBar(true);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // prompt() must be called directly from a user gesture (this click handler qualifies)
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (outcome === 'accepted') setInstallBar(false);
    } else {
      // iOS — no prompt() API, show manual instructions sheet
      window.__pwaPromptShow?.();
    }
  };

  const handleDismissBar = () => {
    setInstallBar(false);
    localStorage.setItem('pwa_bar_dismissed', Date.now().toString());
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.shell}>
      {/* Sidebar — desktop only */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoWrapper}>
            {!collapsed && <EducFarmLogo size={32} variant="dark" showText={true} />}
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
              end
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


      </aside>

      {/* Main area */}
      <div className={styles.main}>
        {/* Navbar */}
        <header className={styles.navbar}>
          <button
            className={styles.menuBtn}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Open menu"
            style={{ display: 'none' }}
          >
            <Menu size={20} />
          </button>
          <div className={styles.navbarTitle}>
            <div className={styles.titleLogoMark}>
              <div className={styles.titleLogoBox}>
                <EducFarmLogo size={32} variant="dark" showText={true} />
              </div>
            </div>
            <div className={styles.titleText}>
              <span className={styles.titleBrand}>COMMAND CENTER</span>
            </div>
            <span className={styles.titleDesktop}>Control center for EducFarm Irrigation System</span>
          </div>
          <div className={styles.navbarRight}>
            {/* Bell button */}
            <button
              className={styles.bellBtn}
              onClick={() => navigate('/notifications')}
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className={styles.bellBadge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </button>

            {/* Profile dropdown */}
            <div className={styles.profileWrap} ref={profileRef}>
              <button
                className={styles.avatarBtn}
                onClick={() => setProfileOpen((v) => !v)}
                aria-label="Profile menu"
              >
                {user?.avatar_url
                  ? <img src={ensureFreshAvatar(user.avatar_url)} alt={initials} className={styles.avatarImg} />
                  : <div className={styles.avatar}>{initials}</div>
                }
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user?.full_name || 'Farmer'}</span>
                  <span className={styles.userRole}>{user?.farm_name || 'EducFarm'}</span>
                </div>
              </button>

              {profileOpen && (
                <div className={styles.profileDropdown}>
                  <div className={styles.profileHeader}>
                    {user?.avatar_url
                      ? <img src={ensureFreshAvatar(user.avatar_url)} alt={initials} className={styles.profileAvatarImg} />
                      : <div className={styles.profileAvatar}>{initials}</div>
                    }
                    <div>
                      <p className={styles.profileName}>{user?.full_name || 'Farmer'}</p>
                      <p className={styles.profileEmail}>{user?.email || user?.phone_number || ''}</p>
                    </div>
                  </div>
                  <div className={styles.profileDivider} />
                  <Link to="/settings/account" className={styles.profileItem} onClick={() => setProfileOpen(false)}>
                    <User size={15} /> Account Settings
                  </Link>
                  <Link to="/notifications" className={styles.profileItem} onClick={() => setProfileOpen(false)}>
                    <Bell size={15} /> Notifications
                    {unreadCount > 0 && <span className={styles.profileBadge}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
                  </Link>
                  <div className={styles.profileDivider} />
                  <button className={styles.profileLogout} onClick={handleLogout}>
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className={styles.content}>{children}</main>

        <OfflineBanner />

        {/* Mobile bottom tab bar — max 5 items */}
        <nav className={styles.bottomNav}>
          {(user?.is_staff ? NAV_ITEMS : BOTTOM_NAV).map(({ to, Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `${styles.bottomNavItem} ${isActive ? styles.bottomNavActive : ''}`
              }
            >
              <div className={styles.bottomNavIcon}>
                <Icon size={20} />
                {label === 'Notifications' && unreadCount > 0 && (
                  <span className={styles.navBadge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </div>
              <span className={styles.bottomNavLabel}>{label}</span>
            </NavLink>
          ))}
        </nav>

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
