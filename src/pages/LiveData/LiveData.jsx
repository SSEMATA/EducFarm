import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Droplets, Thermometer, Wind, Waves, Settings2, Sprout,
  Wifi, WifiOff, Zap, CloudRain, AlertTriangle, CheckCircle,
  Activity, Gauge, Timer, RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area,
  CartesianGrid, XAxis, YAxis, Tooltip,
} from 'recharts';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import styles from './LiveData.module.css';

const fmt = (v, d = 1) => (v == null ? '—' : Number(v).toFixed(d));
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

const ALERT_RULES = [
  { key: 'soil_moisture', op: '<', thr: 20, msg: 'Soil moisture critically low — pump recommended',      level: 'critical' },
  { key: 'soil_moisture', op: '>', thr: 85, msg: 'Soil moisture too high — risk of root rot',            level: 'warning'  },
  { key: 'water_tank',    op: '<', thr: 15, msg: 'Water tank nearly empty — refill required',            level: 'critical' },
  { key: 'temperature',   op: '>', thr: 35, msg: 'High temperature — increase irrigation frequency',     level: 'warning'  },
  { key: 'humidity',      op: '>', thr: 90, msg: 'Very high humidity — disease risk elevated',           level: 'warning'  },
];

function evalAlerts(r) {
  if (!r) return [];
  return ALERT_RULES.filter(({ key, op, thr }) =>
    r[key] != null && (op === '<' ? r[key] < thr : r[key] > thr)
  );
}

function GaugeBar({ label, value, max = 100, color, unit = '%' }) {
  const pct = clamp(value != null ? (value / max) * 100 : 0, 0, 100);
  return (
    <div className={styles.gaugeBar}>
      <div className={styles.gaugeTop}>
        <span>{label}</span>
        <span style={{ color, fontWeight: 600 }}>{fmt(value)}{unit}</span>
      </div>
      <div className={styles.gaugeTrack}>
        <div className={styles.gaugeFill} style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tip}>
      <p className={styles.tipLabel}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color, margin: 0 }}>
          {p.name}: <strong>{fmt(p.value)}{p.unit}</strong>
        </p>
      ))}
    </div>
  );
};

export default function LiveData() {
  const [devices, setDevices]       = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [latest, setLatest]         = useState(null);
  const [history, setHistory]       = useState([]);
  const [log, setLog]               = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [pumpLoading, setPumpLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef  = useRef(null);
  const latestRef    = useRef(null); // always holds current latest for stale-closure-free comparison

  const addLog = useCallback((msg, level = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLog((prev) => [{ id: Date.now() + Math.random(), time, msg, level }, ...prev].slice(0, 80));
  }, []);

  const fetchData = useCallback(async (deviceId) => {
    try {
      const params = deviceId ? { device_id: deviceId } : {};
      const { data } = await api.get('/live-data/', { params });
      setDevices(data.devices || []);

      // Pick reading for selected device or first available
      const reading = data.latest?.find((r) => r.device_id === deviceId) ?? data.latest?.[0] ?? null;

      // Compare against ref — never against stale closure state
      if (reading && latestRef.current) {
        if (reading.pump_status !== latestRef.current.pump_status) {
          addLog(
            `Pump ${reading.pump_status === 'On' ? 'started' : 'stopped'} by device`,
            reading.pump_status === 'On' ? 'success' : 'info'
          );
        }
      }
      latestRef.current = reading;
      setLatest(reading);

      // Build history chart data
      const hist = (data.history || []).map((r, i) => ({
        time:        new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        moisture:    r.soil_moisture,
        temperature: r.temperature,
        tank:        r.water_tank,
      }));
      setHistory(hist);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError('Failed to fetch live data. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, [addLog]);

  // Initial load + polling every 10s
  useEffect(() => {
    fetchData(selectedId);
    intervalRef.current = setInterval(() => fetchData(selectedId), 10000);
    return () => clearInterval(intervalRef.current);
  }, [fetchData, selectedId]);

  const handleDeviceChange = (id) => {
    setSelectedId(id);
    setLoading(true);
  };

  const togglePump = async () => {
    if (!latest || pumpLoading) return;
    const deviceId = latest.device_id;
    if (!deviceId) return;
    const pumpOn = latest.pump_status !== 'Running';
    setPumpLoading(true);
    try {
      await api.post('/pump/control/', { device_id: deviceId, pump_on: pumpOn });
      addLog(`Pump manually ${pumpOn ? 'started' : 'stopped'}`, pumpOn ? 'success' : 'info');
      await fetchData(selectedId);
    } catch {
      addLog('Pump control failed', 'critical');
    } finally {
      setPumpLoading(false);
    }
  };

  const alerts = evalAlerts(latest);
  const deviceOnline = latest != null;
  const pumpRunning  = latest?.pump_status === 'On';

  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}><Activity size={20} /> Live Data</h1>
            <p className={styles.sub}>Real-time readings from your hardware device</p>
          </div>
          <div className={styles.headerRight}>
            {devices.length > 1 && (
              <select
                className={styles.deviceSelect}
                value={selectedId}
                onChange={(e) => handleDeviceChange(e.target.value)}
              >
                <option value="">All Devices</option>
                {devices.map((d) => (
                  <option key={d.device_id} value={d.device_id}>{d.device_name}</option>
                ))}
              </select>
            )}
            <button className={styles.refreshBtn} onClick={() => fetchData(selectedId)} disabled={loading}>
              <RefreshCw size={14} className={loading ? styles.spinning : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div className={styles.statusBar}>
          <span className={`${styles.pill} ${deviceOnline ? styles.pillGreen : styles.pillRed}`}>
            {deviceOnline ? <Wifi size={11} /> : <WifiOff size={11} />}
            {deviceOnline ? 'Device Online' : 'No Data'}
          </span>
          <span className={`${styles.pill} ${pumpRunning ? styles.pillBlue : styles.pillGrey}`}>
            <Zap size={11} /> Pump {pumpRunning ? 'Running' : 'Off'}
          </span>
          {latest?.irrig_cycles != null && (
            <span className={styles.pill}>
              <Sprout size={11} /> {latest.irrig_cycles} cycles
            </span>
          )}
          {lastUpdated && (
            <span className={styles.pill}>
              <Timer size={11} /> Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className={`${styles.alertRow} ${styles.al_critical}`}>
            <AlertTriangle size={13} /> {error}
          </div>
        )}

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className={styles.alertsBox}>
            {alerts.map((a, i) => (
              <div key={i} className={`${styles.alertRow} ${styles[`al_${a.level}`]}`}>
                {a.level === 'info' ? <CheckCircle size={13} /> : <AlertTriangle size={13} />}
                {a.msg}
              </div>
            ))}
          </div>
        )}

        {loading && !latest ? (
          <div className={styles.loadingBox}><RefreshCw size={20} className={styles.spinning} /> Loading live data…</div>
        ) : (
          <>
            <div className={styles.body}>

              {/* Left — pump control */}
              <div className={styles.panel}>
                <p className={styles.panelTitle}><Gauge size={13} /> Pump Control</p>

                <div className={styles.toggleRow}>
                  <button
                    className={`${styles.toggleBtn} ${pumpRunning ? styles.tOn : ''}`}
                    onClick={togglePump}
                    disabled={!deviceOnline || pumpLoading}
                  >
                    <Zap size={13} /> {pumpLoading ? 'Updating…' : pumpRunning ? 'Stop Pump' : 'Start Pump'}
                  </button>
                </div>

                <div className={styles.gauges}>
                  <GaugeBar label="Soil Moisture" value={latest?.soil_moisture} color="#3b82f6" />
                  <GaugeBar label="Water Tank"    value={latest?.water_tank}    color="#0ea5e9" />
                  <GaugeBar label="Humidity"      value={latest?.humidity}      color="#06b6d4" />
                  <GaugeBar label="Temperature"   value={latest?.temperature}   max={50} color="#f97316" unit="°C" />
                </div>

                {devices.length > 0 && (
                  <div className={styles.deviceInfo}>
                    <p className={styles.panelTitle}><Wifi size={13} /> Connected Devices</p>
                    {devices.map((d) => (
                      <div key={d.device_id} className={styles.deviceRow}>
                        <span className={`${styles.dot} ${d.status === 'Online' ? styles.dotGreen : styles.dotGrey}`} />
                        <span className={styles.deviceName}>{d.device_name}</span>
                        <span className={styles.deviceId}>{d.device_id}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right — live readings */}
              <div className={styles.panel}>
                <p className={styles.panelTitle}><Activity size={13} /> Live Readings</p>

                <div className={styles.readingGrid}>
                  {[
                    { label: 'Soil Moisture', val: fmt(latest?.soil_moisture) + '%',    Icon: Droplets,    color: '#3b82f6' },
                    { label: 'Temperature',   val: fmt(latest?.temperature)  + '°C',   Icon: Thermometer, color: '#f97316' },
                    { label: 'Humidity',      val: fmt(latest?.humidity)     + '%',     Icon: Wind,        color: '#06b6d4' },
                    { label: 'Water Tank',    val: fmt(latest?.water_tank)   + '%',     Icon: Waves,       color: '#0ea5e9' },
                    { label: 'Pump',          val: latest?.pump_status ?? '—',          Icon: Settings2,   color: pumpRunning ? '#16a34a' : '#6b7280' },
                    { label: 'Irrig. Cycles', val: latest?.irrig_cycles ?? '—',         Icon: Sprout,      color: '#15803d' },
                  ].map(({ label, val, Icon, color }) => (
                    <div key={label} className={styles.readCard} style={{ '--rc': color }}>
                      <Icon size={15} color={color} strokeWidth={1.8} />
                      <div>
                        <p className={styles.rcLabel}>{label}</p>
                        <p className={styles.rcVal} style={{ color }}>{val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className={styles.charts}>
              {[
                { key: 'moisture',    name: 'Moisture', unit: '%',  color: '#3b82f6', grad: 'ldM', label: 'Soil Moisture', Icon: Droplets    },
                { key: 'tank',        name: 'Tank',     unit: '%',  color: '#0ea5e9', grad: 'ldT', label: 'Water Tank',    Icon: Waves       },
                { key: 'temperature', name: 'Temp',     unit: '°C', color: '#f97316', grad: 'ldH', label: 'Temperature',   Icon: Thermometer },
              ].map(({ key, name, unit, color, grad, label, Icon }) => (
                <div key={key} className={styles.chartCard}>
                  <p className={styles.panelTitle}><Icon size={13} style={{ color }} /> {label}</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={history} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                      <defs>
                        <linearGradient id={grad} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={color} stopOpacity={0}   />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#9ca3af' }} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} unit={unit} />
                      <Tooltip content={<ChartTip />} />
                      <Area type="monotone" dataKey={key} name={name} unit={unit}
                        stroke={color} strokeWidth={2} fill={`url(#${grad})`} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>

            {/* Event log */}
            <div className={styles.logCard}>
              <p className={styles.panelTitle}><Timer size={13} /> Event Log</p>
              <div className={styles.logList}>
                {log.length === 0
                  ? <p className={styles.logEmpty}>No events yet — waiting for hardware data</p>
                  : log.map((e) => (
                    <div key={e.id} className={`${styles.logRow} ${styles[`ll_${e.level}`]}`}>
                      <span className={styles.logTime}>{e.time}</span>
                      <span>{e.msg}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
