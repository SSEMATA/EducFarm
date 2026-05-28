import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Droplets, Thermometer, Wind, Waves, Settings2, Sprout,
  Wifi, WifiOff, Play, Square, RotateCcw, Zap, CloudRain,
  AlertTriangle, CheckCircle, Activity, Gauge, Timer, FlaskConical,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area,
  CartesianGrid, XAxis, YAxis, Tooltip,
} from 'recharts';
import DashboardLayout from '../../layouts/DashboardLayout';
import styles from './Simulate.module.css';

/* ── helpers ─────────────────────────────────────────── */
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const rand  = (min, max)    => Math.random() * (max - min) + min;
const fmt   = (v, d = 1)    => Number(v).toFixed(d);

const INITIAL = {
  soilMoisture: 45,
  temperature:  24,
  humidity:     60,
  waterTank:    80,
  pumpOn:       false,
  deviceOnline: true,
  irrigCycles:  0,
  rainChance:   20,
  windSpeed:    12,
};

const PRESETS = {
  'Normal Day':  { soilMoisture: 45, temperature: 24, humidity: 60, rainChance: 20, windSpeed: 12 },
  'Dry Day':     { soilMoisture: 18, temperature: 34, humidity: 28, rainChance: 5,  windSpeed: 18 },
  'Rainy Day':   { soilMoisture: 78, temperature: 19, humidity: 88, rainChance: 85, windSpeed: 22 },
  'Hot & Humid': { soilMoisture: 30, temperature: 38, humidity: 82, rainChance: 10, windSpeed: 6  },
};

const ALERT_RULES = [
  { key: 'soilMoisture', op: '<', thr: 20, msg: 'Soil moisture critically low — pump recommended',      level: 'critical' },
  { key: 'soilMoisture', op: '>', thr: 85, msg: 'Soil moisture too high — risk of root rot',            level: 'warning'  },
  { key: 'waterTank',    op: '<', thr: 15, msg: 'Water tank nearly empty — refill required',            level: 'critical' },
  { key: 'temperature',  op: '>', thr: 35, msg: 'High temperature — increase irrigation frequency',     level: 'warning'  },
  { key: 'humidity',     op: '>', thr: 90, msg: 'Very high humidity — disease risk elevated',           level: 'warning'  },
  { key: 'rainChance',   op: '>', thr: 70, msg: 'High rain probability — consider skipping irrigation', level: 'info'     },
];

function evalAlerts(s) {
  return ALERT_RULES.filter(({ key, op, thr }) =>
    op === '<' ? s[key] < thr : s[key] > thr
  );
}

/* ── sub-components ──────────────────────────────────── */
function Knob({ label, value, min, max, unit, color, onChange }) {
  return (
    <div className={styles.knob}>
      <div className={styles.knobHeader}>
        <span className={styles.knobLabel}>{label}</span>
        <span className={styles.knobValue} style={{ color }}>{fmt(value)}<em>{unit}</em></span>
      </div>
      <input
        type="range" min={min} max={max} step="0.5" value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.slider}
        style={{ '--c': color }}
      />
      <div className={styles.knobRange}><span>{min}</span><span>{max}</span></div>
    </div>
  );
}

function GaugeBar({ label, value, max = 100, color, unit = '%' }) {
  const pct = clamp((value / max) * 100, 0, 100);
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

/* ── main ────────────────────────────────────────────── */
export default function Simulate() {
  const [state, setState]       = useState(INITIAL);
  const [running, setRunning]   = useState(false);
  const [speed, setSpeed]       = useState(1);
  const [history, setHistory]   = useState([]);
  const [log, setLog]           = useState([]);
  const [tick, setTick]         = useState(0);
  const [autoIrrig, setAutoIrrig] = useState(true);
  const intervalRef = useRef(null);
  const stateRef    = useRef(state);
  const tickRef     = useRef(tick);

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { tickRef.current  = tick;  }, [tick]);

  const addLog = useCallback((msg, level = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLog((prev) => [{ id: Date.now() + Math.random(), time, msg, level }, ...prev].slice(0, 80));
  }, []);

  const step = useCallback(() => {
    setState((prev) => {
      let s = { ...prev };

      // Natural drift
      s.soilMoisture = clamp(s.soilMoisture + rand(-0.5, 0.15), 0, 100);
      s.temperature  = clamp(s.temperature  + rand(-0.3, 0.3),  0, 50);
      s.humidity     = clamp(s.humidity     + rand(-0.5, 0.5),  0, 100);
      s.windSpeed    = clamp(s.windSpeed    + rand(-0.5, 0.5),  0, 80);
      s.rainChance   = clamp(s.rainChance   + rand(-1,   1),    0, 100);

      // Pump effect
      if (s.pumpOn) {
        s.soilMoisture = clamp(s.soilMoisture + 1.4, 0, 100);
        s.waterTank    = clamp(s.waterTank    - 0.6, 0, 100);
        if (s.waterTank <= 0) {
          s.pumpOn = false;
          addLog('Pump auto-stopped — tank empty', 'critical');
        }
      } else {
        // Evaporation faster when hot
        s.soilMoisture = clamp(s.soilMoisture - (s.temperature > 30 ? 0.35 : 0.12), 0, 100);
      }

      // Rain replenishment
      if (s.rainChance > 70) {
        s.soilMoisture = clamp(s.soilMoisture + rand(0, 0.6), 0, 100);
        s.waterTank    = clamp(s.waterTank    + rand(0, 0.25), 0, 100);
      }

      // Auto irrigation logic
      if (autoIrrig && !s.pumpOn && s.soilMoisture < 25 && s.waterTank > 10 && s.deviceOnline) {
        s.pumpOn = true;
        s.irrigCycles += 1;
        addLog(`Auto-irrigation ON — moisture ${fmt(s.soilMoisture)}%`, 'success');
      }
      if (autoIrrig && s.pumpOn && s.soilMoisture >= 65) {
        s.pumpOn = false;
        addLog(`Auto-irrigation OFF — moisture ${fmt(s.soilMoisture)}%`, 'info');
      }

      return s;
    });

    setTick((t) => {
      const t1 = t + 1;
      setHistory((prev) => {
        const s = stateRef.current;
        return [...prev, {
          time:        `T+${t1}s`,
          moisture:    +fmt(s.soilMoisture),
          temperature: +fmt(s.temperature),
          tank:        +fmt(s.waterTank),
        }].slice(-50);
      });
      return t1;
    });
  }, [addLog, autoIrrig]);

  useEffect(() => {
    if (running) {
      const ms = { 1: 1000, 2: 500, 5: 200 }[speed] ?? 1000;
      intervalRef.current = setInterval(step, ms);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, speed, step]);

  const handleStart = () => { addLog('Simulation started', 'success'); setRunning(true);  };
  const handleStop  = () => { addLog('Simulation paused',  'info');    setRunning(false); };
  const handleReset = () => {
    setRunning(false);
    setState(INITIAL);
    setHistory([]);
    setTick(0);
    setLog([{ id: Date.now(), time: new Date().toLocaleTimeString(), msg: 'Simulation reset', level: 'info' }]);
  };

  const applyPreset = (name) => {
    setState((p) => ({ ...p, ...PRESETS[name] }));
    addLog(`Preset applied: "${name}"`, 'info');
  };

  const togglePump = () => {
    if (!state.deviceOnline) return;
    setState((p) => {
      const next = !p.pumpOn;
      addLog(next ? 'Pump manually started' : 'Pump manually stopped', next ? 'success' : 'info');
      return { ...p, pumpOn: next, irrigCycles: next ? p.irrigCycles + 1 : p.irrigCycles };
    });
  };

  const toggleDevice = () => {
    setState((p) => {
      const next = !p.deviceOnline;
      addLog(`Device ${next ? 'connected' : 'disconnected'}`, next ? 'success' : 'warning');
      return { ...p, deviceOnline: next, pumpOn: next ? p.pumpOn : false };
    });
  };

  const alerts = evalAlerts(state);

  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}><FlaskConical size={20} /> Simulation Lab</h1>
            <p className={styles.sub}>Test irrigation behaviour without real hardware</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.speedGroup}>
              {[1, 2, 5].map((s) => (
                <button key={s}
                  className={`${styles.speedBtn} ${speed === s ? styles.speedActive : ''}`}
                  onClick={() => setSpeed(s)}>{s}×</button>
              ))}
            </div>
            {!running
              ? <button className={styles.startBtn} onClick={handleStart}><Play  size={14} /> Start</button>
              : <button className={styles.stopBtn}  onClick={handleStop}><Square size={14} /> Pause</button>
            }
            <button className={styles.resetBtn} onClick={handleReset}><RotateCcw size={14} /> Reset</button>
          </div>
        </div>

        {/* Status bar */}
        <div className={styles.statusBar}>
          <span className={`${styles.pill} ${running ? styles.pillGreen : styles.pillGrey}`}>
            <Activity size={11} /> {running ? `Running · T+${tick}s` : 'Paused'}
          </span>
          <span className={`${styles.pill} ${state.deviceOnline ? styles.pillGreen : styles.pillRed}`}>
            {state.deviceOnline ? <Wifi size={11} /> : <WifiOff size={11} />}
            {state.deviceOnline ? 'Online' : 'Offline'}
          </span>
          <span className={`${styles.pill} ${state.pumpOn ? styles.pillBlue : styles.pillGrey}`}>
            <Zap size={11} /> Pump {state.pumpOn ? 'Running' : 'Off'}
          </span>
          <span className={styles.pill}>
            <Sprout size={11} /> {state.irrigCycles} cycles
          </span>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className={styles.alertsBox}>
            {alerts.map((a, i) => (
              <div key={i} className={`${styles.alertRow} ${styles[`al_${a.level}`]}`}>
                {a.level === 'info'
                  ? <CheckCircle size={13} />
                  : <AlertTriangle size={13} />}
                {a.msg}
              </div>
            ))}
          </div>
        )}

        <div className={styles.body}>

          {/* Left panel — controls */}
          <div className={styles.panel}>
            <p className={styles.panelTitle}><Gauge size={13} /> Manual Controls</p>

            <div className={styles.presets}>
              {Object.keys(PRESETS).map((name) => (
                <button key={name} className={styles.presetBtn} onClick={() => applyPreset(name)}>{name}</button>
              ))}
            </div>

            <Knob label="Soil Moisture" value={state.soilMoisture} min={0}  max={100} unit="%" color="#3b82f6"
              onChange={(v) => setState((p) => ({ ...p, soilMoisture: v }))} />
            <Knob label="Temperature"   value={state.temperature}  min={0}  max={50}  unit="°C" color="#f97316"
              onChange={(v) => setState((p) => ({ ...p, temperature: v }))} />
            <Knob label="Humidity"      value={state.humidity}     min={0}  max={100} unit="%" color="#06b6d4"
              onChange={(v) => setState((p) => ({ ...p, humidity: v }))} />
            <Knob label="Water Tank"    value={state.waterTank}    min={0}  max={100} unit="%" color="#0ea5e9"
              onChange={(v) => setState((p) => ({ ...p, waterTank: v }))} />
            <Knob label="Rain Chance"   value={state.rainChance}   min={0}  max={100} unit="%" color="#6366f1"
              onChange={(v) => setState((p) => ({ ...p, rainChance: v }))} />
            <Knob label="Wind Speed"    value={state.windSpeed}    min={0}  max={80}  unit=" km/h" color="#10b981"
              onChange={(v) => setState((p) => ({ ...p, windSpeed: v }))} />

            <div className={styles.toggleRow}>
              <button
                className={`${styles.toggleBtn} ${state.pumpOn ? styles.tOn : ''}`}
                onClick={togglePump} disabled={!state.deviceOnline}
              ><Zap size={13} /> {state.pumpOn ? 'Stop Pump' : 'Start Pump'}</button>
              <button
                className={`${styles.toggleBtn} ${!state.deviceOnline ? styles.tOff : ''}`}
                onClick={toggleDevice}
              >
                {state.deviceOnline ? <WifiOff size={13} /> : <Wifi size={13} />}
                {state.deviceOnline ? 'Disconnect' : 'Connect'}
              </button>
            </div>

            <label className={styles.autoRow}>
              <input type="checkbox" checked={autoIrrig}
                onChange={(e) => {
                  setAutoIrrig(e.target.checked);
                  addLog(`Auto-irrigation ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
                }} />
              Auto-irrigation (ON &lt;25%, OFF at 65%)
            </label>
          </div>

          {/* Right panel — live readings */}
          <div className={styles.panel}>
            <p className={styles.panelTitle}><Activity size={13} /> Live Readings</p>

            <div className={styles.readingGrid}>
              {[
                { label: 'Soil Moisture', val: fmt(state.soilMoisture) + '%',    Icon: Droplets,    color: '#3b82f6' },
                { label: 'Temperature',   val: fmt(state.temperature)  + '°C',   Icon: Thermometer, color: '#f97316' },
                { label: 'Humidity',      val: fmt(state.humidity)     + '%',     Icon: Wind,        color: '#06b6d4' },
                { label: 'Water Tank',    val: fmt(state.waterTank)    + '%',     Icon: Waves,       color: '#0ea5e9' },
                { label: 'Rain Chance',   val: fmt(state.rainChance)   + '%',     Icon: CloudRain,   color: '#6366f1' },
                { label: 'Wind Speed',    val: fmt(state.windSpeed)    + ' km/h', Icon: Wind,        color: '#10b981' },
                { label: 'Pump',          val: state.pumpOn ? 'Running' : 'Off',  Icon: Settings2,   color: state.pumpOn ? '#16a34a' : '#6b7280' },
                { label: 'Irrig. Cycles', val: state.irrigCycles,                 Icon: Sprout,      color: '#15803d' },
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

            <div className={styles.gauges}>
              <GaugeBar label="Soil Moisture" value={state.soilMoisture} color="#3b82f6" />
              <GaugeBar label="Water Tank"    value={state.waterTank}    color="#0ea5e9" />
              <GaugeBar label="Humidity"      value={state.humidity}     color="#06b6d4" />
              <GaugeBar label="Temperature"   value={state.temperature}  max={50} color="#f97316" unit="°C" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className={styles.charts}>
          {[
            { key: 'moisture',    name: 'Moisture', unit: '%',  color: '#3b82f6', grad: 'simM', label: 'Soil Moisture', Icon: Droplets },
            { key: 'tank',        name: 'Tank',     unit: '%',  color: '#0ea5e9', grad: 'simT', label: 'Water Tank',    Icon: Waves    },
            { key: 'temperature', name: 'Temp',     unit: '°C', color: '#f97316', grad: 'simH', label: 'Temperature',   Icon: Thermometer },
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
              ? <p className={styles.logEmpty}>No events yet — press Start</p>
              : log.map((e) => (
                <div key={e.id} className={`${styles.logRow} ${styles[`ll_${e.level}`]}`}>
                  <span className={styles.logTime}>{e.time}</span>
                  <span>{e.msg}</span>
                </div>
              ))
            }
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
