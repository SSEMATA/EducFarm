import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import InstallPrompt  from './components/InstallPrompt';
import Login          from './pages/Auth/Login';
import Signup         from './pages/Auth/Signup';
import Dashboard      from './pages/Dashboard/Dashboard';
import DeviceList     from './pages/Devices/DeviceList';
import ConnectDevice  from './pages/Devices/ConnectDevice';
import IrrigationPlanner from './pages/Weather/Weather';
import Notifications  from './pages/Notifications/Notifications';
import Settings       from './pages/Settings/Settings';
import WifiSettings   from './pages/Settings/WifiSettings';
import SMSSettings    from './pages/Settings/SMSSettings';
import DeviceManagement from './pages/Settings/DeviceManagement';
import FarmSettings   from './pages/Settings/FarmSettings';
import LiveData       from './pages/LiveData/LiveData';
import Admin          from './pages/Admin/Admin';
import AdminDevices   from './pages/Admin/AdminDevices';

const isDev = import.meta.env.DEV;
const Simulate = isDev ? lazy(() => import('./pages/Simulate/Simulate')) : null;

const AdminRoute = ({ children }) => {
  const u = JSON.parse(localStorage.getItem('user') || '{}');
  if (!localStorage.getItem('token')) return <Navigate to="/login" replace />;
  if (!u.is_staff) return <Navigate to="/dashboard" replace />;
  return children;
};

const P = ({ children }) => {
  const u = JSON.parse(localStorage.getItem('user') || '{}');
  if (!localStorage.getItem('token')) return <Navigate to="/login" replace />;
  if (u.is_staff) return <Navigate to="/admin" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter basename="/EducFarm/">
      <InstallPrompt />
      <Routes>
        <Route path="/"                element={<Navigate to="/login" replace />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/signup"          element={<Signup />} />
        <Route path="/dashboard"       element={<P><Dashboard /></P>} />
        <Route path="/devices"         element={<P><DeviceList /></P>} />
        <Route path="/devices/connect" element={<P><ConnectDevice /></P>} />
        <Route path="/weather"            element={<Navigate to="/irrigation-planner" replace />} />
        <Route path="/irrigation-planner" element={<P><IrrigationPlanner /></P>} />
        <Route path="/notifications"   element={<P><Notifications /></P>} />
        <Route path="/settings"        element={<P><Settings /></P>} />
        <Route path="/settings/devices" element={<P><DeviceManagement /></P>} />
        <Route path="/settings/wifi"   element={<P><WifiSettings /></P>} />
        <Route path="/settings/sms"    element={<P><SMSSettings /></P>} />
        <Route path="/settings/farm"   element={<P><FarmSettings /></P>} />
        <Route path="/live-data"       element={<P><LiveData /></P>} />
        <Route path="/admin"           element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="/admin/devices"    element={<AdminRoute><AdminDevices /></AdminRoute>} />
        {isDev && Simulate && (
          <Route path="/simulate" element={<P><Suspense fallback={null}><Simulate /></Suspense></P>} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
