import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
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

const P = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;

function App() {
  return (
    <BrowserRouter>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
