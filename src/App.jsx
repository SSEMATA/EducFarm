import { lazy, Suspense, useEffect, useState, useRef, Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { usePushNotifications } from './hooks/usePushNotifications';
import InstallPrompt  from './components/InstallPrompt';
import Landing        from './pages/Landing/Landing';

const Login          = lazy(() => import('./pages/Auth/Login'));
const Signup         = lazy(() => import('./pages/Auth/Signup'));
const SetPassword    = lazy(() => import('./pages/Auth/SetPassword'));
const Dashboard      = lazy(() => import('./pages/Dashboard/Dashboard'));
const DeviceList     = lazy(() => import('./pages/Devices/DeviceList'));
const ConnectDevice  = lazy(() => import('./pages/Devices/ConnectDevice'));
const IrrigationPlanner = lazy(() => import('./pages/Weather/Weather'));
const Notifications  = lazy(() => import('./pages/Notifications/Notifications'));
const Settings       = lazy(() => import('./pages/Settings/Settings'));
const WifiSettings   = lazy(() => import('./pages/Settings/WifiSettings'));
const SMSSettings    = lazy(() => import('./pages/Settings/SMSSettings'));
const DeviceManagement = lazy(() => import('./pages/Settings/DeviceManagement'));
const FarmSettings   = lazy(() => import('./pages/Settings/FarmSettings'));
const LiveData       = lazy(() => import('./pages/LiveData/LiveData'));
const AccountSettings = lazy(() => import('./pages/Settings/AccountSettings'));
const Contact        = lazy(() => import('./pages/Contact/Contact'));
const About          = lazy(() => import('./pages/About/About'));
const Invest         = lazy(() => import('./pages/Invest/Invest'));
const InvestorForm   = lazy(() => import('./pages/Invest/InvestorForm'));
const RequestForm    = lazy(() => import('./pages/Invest/RequestForm'));
const PartnershipForm = lazy(() => import('./pages/Invest/PartnershipForm'));
const Admin          = lazy(() => import('./pages/Admin/Admin'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const AdminDevices   = lazy(() => import('./pages/Admin/AdminDevices'));
const AdminWeather   = lazy(() => import('./pages/Admin/AdminWeather'));
const AdminSettings  = lazy(() => import('./pages/Admin/AdminSettings'));
const AdminPlantSettings = lazy(() => import('./pages/Admin/AdminPlantSettings'));
const AdminOrders = lazy(() => import('./pages/Admin/AdminOrders'));
const AdminForms  = lazy(() => import('./pages/Admin/AdminForms'));

function useCountdown(target) {
  const [remaining, setRemaining] = useState(null);
  useEffect(() => {
    if (!target) return setRemaining(null);
    const calc = () => {
      const diff = Math.max(0, Math.floor((new Date(target) - Date.now()) / 1000));
      setRemaining(diff);
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [target]);
  return remaining;
}

function fmt(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2,'0')}m ${String(sec).padStart(2,'0')}s`;
  return `${String(m).padStart(2,'0')}m ${String(sec).padStart(2,'0')}s`;
}

function MaintenancePage({ title, message, sub, online_at }) {
  const remaining = useCountdown(online_at);
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg,#0f2e1a 0%,#1a4a2e 100%)',
      padding: '2rem', textAlign: 'center', gap: '1.25rem',
    }}>
      <div style={{ fontSize: '3rem' }}>🔧</div>
      <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>{title}</h1>
      <p style={{ margin: 0, fontSize: '1rem', color: 'rgba(255,255,255,0.7)', maxWidth: 420, lineHeight: 1.6 }}>{message}</p>
      {sub && <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)' }}>{sub}</p>}
      {online_at && remaining !== null && remaining > 0 && (
        <div style={{
          marginTop: '0.5rem', background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)', borderRadius: 16,
          padding: '1.25rem 2rem', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '0.4rem',
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Back online in</span>
          <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#4ade80', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{fmt(remaining)}</span>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{new Date(online_at).toLocaleString()}</span>
        </div>
      )}
      {online_at && remaining === 0 && (
        <div style={{ color: '#4ade80', fontWeight: 700 }}>Coming back online…</div>
      )}
    </div>
  );
}

function SystemGuard({ children }) {
  const [status, setStatus] = useState(null); // null = checking
  const { user } = useAuth();
  const wasMaintenanceRef = useRef(false);

  useEffect(() => {
    let t;
    const check = () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/users/system/status/`)
        .then(r => r.json())
        .then(s => {
          if (!s.online) wasMaintenanceRef.current = true;
          setStatus(s);
        })
        .catch(() => {
          // Backend unreachable — default to online and stop polling
          setStatus(prev => prev ?? { online: true });
          clearInterval(t);
        });

    check();
    t = setInterval(check, 30000);
    return () => clearInterval(t);
  }, []);

  // Admins always bypass — they need control regardless of system state
  if (user?.is_staff) return children;

  // Block render until first check completes — prevents flash of app content
  if (status === null) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg,#0f2e1a 0%,#1a4a2e 100%)',
    }}>
      <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#4ade80', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!status.online) return <MaintenancePage title={status.maintenance_title} message={status.maintenance_message} sub={status.maintenance_sub} online_at={status.online_at} />;
  return children;
}

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { crashed: false }; }
  static getDerivedStateFromError() { return { crashed: true }; }
  render() {
    if (!this.state.crashed) return this.props.children;
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg,#0f2e1a 0%,#1a4a2e 100%)',
        padding: '2rem', textAlign: 'center', gap: '1rem',
      }}>
        <div style={{ fontSize: '3rem' }}>⚠️</div>
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>Something went wrong</h1>
        <p style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', maxWidth: 380, lineHeight: 1.6 }}>
          The app encountered an unexpected error. Please refresh the page. If the problem persists, contact support.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '0.5rem', padding: '0.65rem 1.5rem',
            background: '#4ade80', border: 'none', borderRadius: 10,
            fontWeight: 700, fontSize: '0.95rem', color: '#0f2e1a',
            cursor: 'pointer',
          }}
        >
          Refresh Page
        </button>
      </div>
    );
  }
}

const isDev = import.meta.env.DEV;
const Simulate = isDev ? lazy(() => import('./pages/Simulate/Simulate')) : null;

const ADMIN_PERM_ROUTES = [
  { perm: null,                 path: '/admin/dashboard' },
  { perm: 'can_manage_users',   path: '/admin/users'     },
  { perm: 'can_manage_devices', path: '/admin/devices'   },
  { perm: 'can_manage_weather', path: '/admin/weather'   },
  { perm: 'can_manage_system',  path: '/admin/settings'  },
];

const AdminRoute = ({ children, perm }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (!user.is_staff) return <Navigate to="/dashboard" replace />;
  const isSuperAdmin = user.admin_level === 'superadmin';
  if (perm && !isSuperAdmin && !user[perm]) {
    const first = ADMIN_PERM_ROUTES.find(r => !r.perm || user[r.perm]);
    return <Navigate to={first ? first.path : '/'} replace />;
  }
  return children;
};

const P = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.is_staff) return <Navigate to="/admin/dashboard" replace />;
  return children;
};

// Auth = both regular users and admins
const Auth = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return children;
};

// Handle ?p= redirect from 404.html and OG pages
function SpaRedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get('p');
    if (redirect) {
      // Strip trailing slash for React Router
      navigate(redirect.replace(/\/$/, '') || '/', { replace: true });
    }
  }, []);
  return null;
}

// Initialize push notifications for authenticated users
const PushNotificationInit = () => {
  const { user } = useAuth();
  usePushNotifications(); // Initializes automatically
  return null;
};

// Safe install prompt — only renders for logged-in non-staff users, no redirect side-effects
const SafeInstallPrompt = () => {
  const { user } = useAuth();
  if (!user || user.is_staff) return null;
  return <InstallPrompt />;
};

function App() {
  return (
    <ErrorBoundary>
    <AuthProvider>
    <BrowserRouter basename="/">
      <SpaRedirectHandler />
      <SystemGuard>
      <PushNotificationInit />
      <SafeInstallPrompt />
      <Suspense fallback={null}>
      <Routes>
        <Route path="/"                element={window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone ? <Landing /> : <Landing />} />
        <Route path="/contact"          element={<Contact />} />
        <Route path="/about"            element={<About />} />
        <Route path="/invest"           element={<Invest />} />
        <Route path="/invest/form"       element={<InvestorForm />} />
        <Route path="/invest/request"    element={<RequestForm />} />
        <Route path="/partnership"        element={<PartnershipForm />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/signup"          element={<Signup />} />
        <Route path="/set-password"    element={<SetPassword />} />
        <Route path="/dashboard"       element={<P><Dashboard /></P>} />
        <Route path="/devices"         element={<P><DeviceList /></P>} />
        <Route path="/devices/connect" element={<P><ConnectDevice /></P>} />
        <Route path="/weather"            element={<Navigate to="/irrigation-planner" replace />} />
        <Route path="/irrigation-planner" element={<P><IrrigationPlanner /></P>} />
        <Route path="/notifications"   element={<Auth><Notifications /></Auth>} />
        <Route path="/settings"        element={<P><Settings /></P>} />
        <Route path="/settings/devices" element={<P><DeviceManagement /></P>} />
        <Route path="/settings/wifi"   element={<P><WifiSettings /></P>} />
        <Route path="/settings/sms"    element={<P><SMSSettings /></P>} />
        <Route path="/settings/farm"   element={<P><FarmSettings /></P>} />
        <Route path="/settings/account" element={<Auth><AccountSettings /></Auth>} />
        <Route path="/live-data"       element={<P><LiveData /></P>} />
        <Route path="/admin"                element={<AdminRoute><Navigate to="/admin/dashboard" replace /></AdminRoute>} />
        <Route path="/admin/dashboard"       element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users"           element={<AdminRoute perm="can_manage_users"><Admin /></AdminRoute>} />
        <Route path="/admin/devices"         element={<AdminRoute perm="can_manage_devices"><AdminDevices /></AdminRoute>} />
        <Route path="/admin/weather"         element={<AdminRoute perm="can_manage_weather"><AdminWeather /></AdminRoute>} />
        <Route path="/admin/settings"        element={<AdminRoute perm="can_manage_system"><AdminSettings /></AdminRoute>} />
        <Route path="/admin/plant-settings"   element={<AdminRoute perm="can_manage_system"><AdminPlantSettings /></AdminRoute>} />
        <Route path="/admin/orders"            element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin/forms"             element={<AdminRoute><AdminForms /></AdminRoute>} />
        {isDev && Simulate && (
          <Route path="/simulate" element={<P><Suspense fallback={null}><Simulate /></Suspense></P>} />
        )}
      </Routes>
      </Suspense>
    </SystemGuard>
    </BrowserRouter>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
