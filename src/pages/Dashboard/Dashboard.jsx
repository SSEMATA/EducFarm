import { useEffect, useState, useCallback, useRef } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import {
  Wifi, Droplets, Thermometer, Wind,
  CloudSun, Waves, Settings2, Sprout, RefreshCw,
  Sun, Cloud, CloudRain, CloudLightning, CloudFog, Snowflake, CloudSun as CloudSunIcon,
  MapPin, Clock, Zap, Repeat2, Droplet, Ban, CalendarClock,
  Sunrise, Sunset, Moon, Leaf, UserCheck,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import styles from './Dashboard.module.css';

const CONDITION_META = {
  sunny:         { Icon: Sun,            label: 'Sunny',         grad: ['#f97316','#fbbf24'] },
  cloudy:        { Icon: Cloud,          label: 'Cloudy',        grad: ['#64748b','#94a3b8'] },
  rainy:         { Icon: CloudRain,      label: 'Rainy',         grad: ['#1d4ed8','#3b82f6'] },
  stormy:        { Icon: CloudLightning, label: 'Stormy',        grad: ['#4c1d95','#7c3aed'] },
  windy:         { Icon: Wind,           label: 'Windy',         grad: ['#065f46','#10b981'] },
  foggy:         { Icon: CloudFog,       label: 'Foggy',         grad: ['#6b7280','#9ca3af'] },
  snowy:         { Icon: Snowflake,      label: 'Snowy',         grad: ['#1e40af','#60a5fa'] },
  partly_cloudy: { Icon: CloudSunIcon,   label: 'Partly Cloudy', grad: ['#d97706','#fcd34d'] },
};

const HOURLY_META = {
  sunny:         { Icon: Sun,            color: '#f59e0b' },
  cloudy:        { Icon: Cloud,          color: '#94a3b8' },
  rainy:         { Icon: CloudRain,      color: '#60a5fa' },
  stormy:        { Icon: CloudLightning, color: '#a78bfa' },
  windy:         { Icon: Wind,           color: '#34d399' },
  foggy:         { Icon: CloudFog,       color: '#9ca3af' },
  snowy:         { Icon: Snowflake,      color: '#93c5fd' },
  partly_cloudy: { Icon: CloudSunIcon,   color: '#fcd34d' },
};

function getCondMeta(condition = '') {
  const key = condition.toLowerCase().replace(/\s+/g, '_');
  return CONDITION_META[key] ?? { Icon: Sun, label: condition, grad: ['#6b7280','#9ca3af'] };
}

function getHourlyMeta(condition = '') {
  const key = condition.toLowerCase().replace(/\s+/g, '_');
  return HOURLY_META[key] ?? { Icon: Sun, color: '#f59e0b' };
}

const FALLBACK = {
  device_status:     'Online',
  soil_moisture:     0,
  temperature:       0,
  humidity:          0,
  wind_speed:        0,
  rain_probability:  0,
  weather_condition: '—',
  water_tank_level:  0,
  pump_status:       'Off',
  irrigation_cycles: 0,
  moisture_trend:    [],
  temperature_trend: [],
  soil_temperature_trend: [],
  soil_humidity_trend: [],
  irrigation_history:[],
};

const CARDS = (d) => [
  {
    key: 'device_status',
    label: 'Device Status',
    value: d.device_status,
    Icon: Wifi,
    accent: d.device_status === 'Online' ? '#16a34a' : '#dc2626',
    bg:    d.device_status === 'Online' ? '#f0fdf4' : '#fef2f2',
    badge: true,
  },
  {
    key: 'soil_moisture',
    label: 'Soil Moisture',
    value: `${d.soil_moisture}%`,
    Icon: Droplets,
    accent: '#2563eb',
    bg: '#eff6ff',
    bar: d.soil_moisture,
    barColor: '#3b82f6',
  },
  {
    key: 'temperature',
    label: 'Temperature',
    value: d.temperature !== 0 ? `${d.temperature}°C` : '—',
    Icon: Thermometer,
    accent: '#ea580c',
    bg: '#fff7ed',
    bar: d.temperature !== 0 ? Math.min((d.temperature / 50) * 100, 100) : undefined,
    barColor: '#f97316',
  },
  {
    key: 'humidity',
    label: 'Humidity',
    value: d.humidity !== 0 ? `${d.humidity}%` : '—',
    Icon: Wind,
    accent: '#0891b2',
    bg: '#ecfeff',
    bar: d.humidity !== 0 ? d.humidity : undefined,
    barColor: '#06b6d4',
  },
  {
    key: 'weather_condition',
    label: 'Weather',
    value: d.weather_condition,
    Icon: CloudSun,
    accent: '#7c3aed',
    bg: '#f5f3ff',
  },
  {
    key: 'wind_speed',
    label: 'Wind Speed',
    value: d.wind_speed != null ? `${d.wind_speed} km/h` : '—',
    Icon: Wind,
    accent: '#059669',
    bg: '#ecfdf5',
    bar: d.wind_speed != null ? Math.min((d.wind_speed / 100) * 100, 100) : undefined,
    barColor: '#10b981',
  },
  {
    key: 'rain_probability',
    label: 'Rain Chance',
    value: d.rain_probability != null ? `${d.rain_probability}%` : '—',
    Icon: Droplets,
    accent: '#1d4ed8',
    bg: '#eff6ff',
    bar: d.rain_probability != null ? d.rain_probability : undefined,
    barColor: '#3b82f6',
  },
  {
    key: 'water_tank_level',
    label: 'Water Tank',
    value: `${d.water_tank_level}%`,
    Icon: Waves,
    accent: '#0369a1',
    bg: '#f0f9ff',
    bar: d.water_tank_level,
    barColor: '#0ea5e9',
    tankVisual: true,
  },
  {
    key: 'pump_status',
    label: 'Pump Status',
    value: d.pump_status,
    Icon: Settings2,
    accent: d.pump_status === 'Running' ? '#16a34a' : '#6b7280',
    bg:    d.pump_status === 'Running' ? '#f0fdf4' : '#f9fafb',
    badge: true,
  },
  {
    key: 'irrigation_cycles',
    label: 'Irrigation Cycles',
    value: d.irrigation_cycles ?? 0,
    Icon: Sprout,
    accent: '#15803d',
    bg: '#f0fdf4',
    sub: 'cycles today',
  },
];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className={styles.tooltipRow}>
          {p.name}: <strong>{p.value}{p.unit ?? ''}</strong>
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData]               = useState(FALLBACK);
  const [initialLoad, setInitialLoad] = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [weatherRefreshing, setWeatherRefreshing] = useState(false);
  const [error, setError]             = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [weather, setWeather]         = useState(null);
  const [locModal, setLocModal]       = useState(false); // custom location modal
  const [coords, setCoords]           = useState(null);  // cached coords
  const coordsRef = useRef(null); // always holds latest coords for interval
  const [welcome, setWelcome] = useState(() => {
    const reg = sessionStorage.getItem('justRegistered');
    const log = sessionStorage.getItem('justLoggedIn');
    if (reg) { sessionStorage.removeItem('justRegistered'); return 'register'; }
    if (log) { sessionStorage.removeItem('justLoggedIn');   return 'login'; }
    return null;
  });

  const setCoordsBoth = (c) => {
    setCoords(c);
    coordsRef.current = c;
  };

  const greetingInfo = () => {
    const h = new Date().getHours();
    if (h >= 5  && h < 12) return { text: 'Good Morning',   Icon: Sunrise };
    if (h >= 12 && h < 17) return { text: 'Good Afternoon', Icon: Sun     };
    if (h >= 17 && h < 21) return { text: 'Good Evening',   Icon: Sunset  };
    return                         { text: 'Good Night',     Icon: Moon    };
  };

  useEffect(() => {
    if (!welcome) return;
    const t = setTimeout(() => setWelcome(null), 5000);
    return () => clearTimeout(t);
  }, [welcome]);

  const fetchWeather = useCallback((c) => {
    const coords = c ?? coordsRef.current;
    const params = coords ? `?lat=${coords.lat}&lon=${coords.lon}` : '';
    const doFetch = async () => {
      setWeatherRefreshing(true);
      try {
        const { data: res } = await api.get(`/weather/${params}`);
        setWeather(res);
      } catch { /* silent */ }
      finally { setWeatherRefreshing(false); }
    };
    doFetch();
  }, []);

  const fetchData = useCallback((c) => {
    const coords = c ?? coordsRef.current;
    const params = coords ? `?lat=${coords.lat}&lon=${coords.lon}` : '';
    const doFetch = async () => {
      setRefreshing(true);
      try {
        const { data: res } = await api.get(`/dashboard/${params}`);
        setData({ ...FALLBACK, ...res });
        setLastUpdated(new Date());
        setError('');
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load dashboard data.');
      } finally {
        setRefreshing(false);
        setInitialLoad(false);
      }
    };
    doFetch();
  }, []);

  useEffect(() => {
    const init = async () => {
      // If admin has set a location, use it — skip GPS entirely
      try {
        const { data: fs } = await api.get('/farm-settings/');
        if (fs.admin_weather_lat != null && fs.admin_weather_lon != null) {
          localStorage.removeItem('ef_coords');
          fetchData();
          fetchWeather();
          return;
        }
      } catch { /* fall through */ }

      // No admin location — proceed with GPS flow as before
      const saved = localStorage.getItem('ef_coords');
      if (saved && saved !== 'denied') {
        const c = JSON.parse(saved);
        setCoordsBoth(c);
        fetchData(c);
        fetchWeather(c);
      } else if (saved === 'denied') {
        fetchData();
        fetchWeather();
      } else {
        navigator.permissions?.query({ name: 'geolocation' }).then((result) => {
          if (result.state === 'granted') {
            navigator.geolocation.getCurrentPosition(({ coords: gc }) => {
              const c = { lat: gc.latitude, lon: gc.longitude };
              localStorage.setItem('ef_coords', JSON.stringify(c));
              setCoordsBoth(c);
              fetchData(c);
              fetchWeather(c);
            }, () => { fetchData(); fetchWeather(); });
          } else if (result.state === 'denied') {
            fetchData();
            fetchWeather();
          } else {
            setLocModal(true);
            fetchData();
            fetchWeather();
          }
        }).catch(() => { fetchData(); fetchWeather(); });
      }
    };

    init();
    const interval = setInterval(() => fetchData(coordsRef.current), 30_000);
    return () => clearInterval(interval);
  }, [fetchData, fetchWeather]);

  const handleAllowLocation = () => {
    setLocModal(false);
    navigator.geolocation.getCurrentPosition(
      ({ coords: gc }) => {
        const c = { lat: gc.latitude, lon: gc.longitude };
        localStorage.setItem('ef_coords', JSON.stringify(c));
        setCoordsBoth(c);
        fetchData(c);
        fetchWeather(c);
      },
      () => { /* denied in browser — already loaded without coords */ }
    );
  };

  const handleDenyLocation = () => {
    setLocModal(false);
    localStorage.setItem('ef_coords', 'denied');
  };

  // Only show skeleton on the very first load; subsequent refreshes keep stale data visible
  const loading = initialLoad;

  const cards    = CARDS(data);
  const current  = weather?.current ?? null;
  const hourly   = weather?.hourly  ?? [];
  const todayIrr = current?.irrigation ?? null;
  const { Icon: WeatherIcon, label: weatherLabel, grad } = getCondMeta(current?.condition ?? '');

  // Use weather hourly data for temperature trend when sensor data is unavailable
  const tempTrendData = data.temperature_trend?.length > 0
    ? data.temperature_trend
    : hourly.map((h) => ({ time: h.time, temperature: h.temp, humidity: h.humidity }));

  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/* Location permission modal */}
        {locModal && (
          <div className={styles.locBackdrop}>
            <div className={styles.locModal}>
              <div className={styles.locIconWrap}>
                <MapPin size={28} strokeWidth={1.75} color="#2d7a4f" />
              </div>
              <h3 className={styles.locTitle}>Enable Location</h3>
              <p className={styles.locDesc}>
                EducFarm uses your location to show accurate local weather and irrigation recommendations for your farm.
              </p>
              <div className={styles.locActions}>
                <button className={styles.locDenyBtn} onClick={handleDenyLocation}>Not now</button>
                <button className={styles.locAllowBtn} onClick={handleAllowLocation}>
                  <MapPin size={14} /> Allow Location
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className={styles.pageHeader}>
          <div className={styles.pageTitleRow}>
            <h1 className={styles.pageTitle}>Dashboard</h1>
            <p className={styles.pageSubtitle}>
              {lastUpdated
                ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
                : 'Loading sensor data…'}
              {refreshing && <span className={styles.updatingDot} title="Refreshing data…" />}
              {weatherRefreshing && <span className={styles.updatingDot} style={{ background: '#7c3aed' }} title="Updating weather…" />}
            </p>
          </div>
          <button
            className={styles.refreshBtn}
            onClick={() => { fetchData(coordsRef.current); fetchWeather(coordsRef.current); }}
            disabled={refreshing || weatherRefreshing}
            aria-label="Refresh"
          >
            <RefreshCw size={14} className={refreshing || weatherRefreshing ? styles.spinning : ''} />
            {refreshing || weatherRefreshing ? 'Updating…' : 'Refresh'}
          </button>
        </div>

        {/* Permanent greeting */}
        {(() => {
          const firstName = user?.full_name?.split(' ')[0] || 'Farmer';
          const { text, Icon: GreetIcon } = greetingInfo();
          return (
            <div className={styles.greeting}>
              <GreetIcon size={22} className={styles.greetIcon} strokeWidth={1.75} />
              <div>
                <p className={styles.greetText}>{text}, <strong>{firstName}</strong></p>
                <p className={styles.greetSub}>
                  {welcome === 'register'
                    ? 'Welcome to EducFarm — your farm is all set up!'
                    : welcome === 'login'
                    ? 'Great to see you back. Here is your farm overview.'
                    : 'Here is your farm overview for today.'}
                </p>
              </div>
              {welcome === 'register' && <Leaf size={18} color="#4ade80" strokeWidth={1.75} />}
              {welcome === 'login'    && <UserCheck size={18} color="#4ade80" strokeWidth={1.75} />}
            </div>
          );
        })()}

        {error && <div className={styles.errorBanner}>{error}</div>}

        {/* Stat cards — full width table */}
        <div className={`${styles.statsTable} ${loading ? styles.skeleton : ''}`}>
          {cards.map(({ key, label, value, Icon, accent, bg, badge, bar, barColor, sub }) => (
            <div key={key} className={styles.statsRow} style={{ '--row-accent': accent, '--row-bg': bg }}>
              <div className={styles.statsRowLeft}>
                <span className={styles.statsIcon} style={{ background: bg, color: accent }}>
                  <Icon size={15} strokeWidth={2} />
                </span>
                <span className={styles.statsLabel}>{label}</span>
              </div>
              <div className={styles.statsRowRight}>
                {badge ? (
                  <span className={styles.badge} style={{ background: accent + '22', color: accent }}>
                    <span className={styles.badgeDot} style={{ background: accent }} />
                    {value}
                  </span>
                ) : (
                  <span className={styles.statsValue} style={{ color: accent }}>{value}</span>
                )}
                {sub && <span className={styles.cardSub}>{sub}</span>}
                {bar !== undefined && (
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: `${bar}%`, background: barColor }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Soil Moisture + Soil Humidity — 2-column row, above weather */}
        <div className={styles.soilChartsRow}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>
              <Droplets size={15} style={{ color: '#3b82f6' }} /> Soil Moisture
            </h3>
            {loading ? <div className={styles.chartSkeleton} /> : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.moisture_trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="moistureGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} unit="%" domain={[0, 100]} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="moisture" name="Moisture" unit="%" stroke="#3b82f6" strokeWidth={2} fill="url(#moistureGrad)" dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>
              <Droplets size={15} style={{ color: '#06b6d4' }} /> Soil Humidity
            </h3>
            {loading ? <div className={styles.chartSkeleton} /> : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.soil_humidity_trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="soilHumidGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} unit="%" domain={[0, 100]} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="humidity" name="Soil Humidity" unit="%" stroke="#06b6d4" strokeWidth={2} fill="url(#soilHumidGrad)" dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Weather summary ─────────────────────────── */}
        {current ? (
          <div className={styles.weatherRow}>
            {/* Current weather mini-card */}
            <div className={styles.weatherMini} style={{ '--g1': grad[0], '--g2': grad[1] }}>
              <WeatherIcon size={40} color="rgba(255,255,255,0.95)" strokeWidth={1.25} />
              <div className={styles.weatherMiniInfo}>
                <span className={styles.weatherMiniLabel}>{weatherLabel}</span>
                <span className={styles.weatherMiniTemp}>{current.temperature}°C</span>
                <span className={styles.weatherMiniDesc}>{current.description}</span>
                {current.location && <span className={styles.weatherMiniLoc}><MapPin size={10} />{current.location}</span>}
              </div>
              <div className={styles.weatherMiniPills}>
                <span className={styles.wPill}><Droplets size={11} />{current.humidity}%</span>
                <span className={styles.wPill}><Wind size={11} />{current.wind_speed} km/h</span>
              </div>
            </div>

            {/* Hourly strip */}
            {hourly.length > 0 && (
              <div className={styles.hourlyWrap}>
                <p className={styles.hourlyTitle}><Clock size={13} /> Next Hours</p>
                <div className={styles.hourlyStrip}>
                  {hourly.map((h, i) => {
                    const { Icon: HIcon, color } = getHourlyMeta(h.condition);
                    return (
                      <div key={i} className={`${styles.hourlyCol} ${h.pump_active ? styles.hourlyColPump : ''}`}>
                        <span className={styles.hourlyTime}>{h.time}</span>
                        <HIcon size={18} color={color} strokeWidth={1.75} />
                        <span className={styles.hourlyTemp}>{Number(h.temp).toFixed(1)}°</span>
                        <span className={styles.hourlyRain}><Droplets size={9} />{Number(h.rain_probability).toFixed(1)}%</span>
                        {h.pump_active && <span className={styles.pumpBadge}><Zap size={9} />Pump</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.weatherPlaceholder}>
            <CloudSun size={22} color="#9ca3af" strokeWidth={1.5} />
            <span>Weather data unavailable — add an OpenWeather API key to see forecasts</span>
          </div>
        )}

        {/* ── Today's irrigation plan ──────────────────── */}
        {todayIrr ? (
          <div className={styles.irrigCard}>
            <p className={styles.irrigTitle}><CalendarClock size={14} /> Today's Irrigation Plan</p>
            {todayIrr.skip ? (
              <div className={styles.irrigSkip}>
                <Ban size={16} color="#ef4444" />
                <span>{todayIrr.reason}</span>
              </div>
            ) : (
              <div className={styles.irrigBody}>
                <div className={styles.irrigStats}>
                  <div className={styles.irrigStat}>
                    <Repeat2 size={15} color="#6366f1" />
                    <strong>{todayIrr.cycles}</strong>
                    <span>Cycles</span>
                  </div>
                  <div className={styles.irrigDivider} />
                  <div className={styles.irrigStat}>
                    <Clock size={15} color="#f59e0b" />
                    <strong>{todayIrr.duration_min}<small>min</small></strong>
                    <span>Per cycle</span>
                  </div>
                  <div className={styles.irrigDivider} />
                  <div className={styles.irrigStat}>
                    <Droplet size={15} color="#3b82f6" />
                    <strong>{todayIrr.water_total_l}<small>L</small></strong>
                    <span>Total water</span>
                  </div>
                  <div className={styles.irrigDivider} />
                  <div className={styles.irrigStat}>
                    <Sprout size={15} color="#10b981" />
                    <strong>{todayIrr.rain_saving_l}<small>L</small></strong>
                    <span>Rain saves</span>
                  </div>
                </div>
                {todayIrr.pump_times?.length > 0 && (
                  <div className={styles.pumpTimes}>
                    <span className={styles.pumpTimesLabel}>Pump schedule</span>
                    <div className={styles.pumpTimesList}>
                      {todayIrr.pump_times.map((t) => (
                        <span key={t} className={styles.pumpTime}><Clock size={11} />{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                <p className={styles.irrigReason}>{todayIrr.reason}</p>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.irrigPlaceholder}>
            <CalendarClock size={22} color="#9ca3af" strokeWidth={1.5} />
            <span>Irrigation plan unavailable — configure farm settings and add a weather API key</span>
          </div>
        )}

        {/* Charts */}
        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>
              <Thermometer size={15} style={{ color: '#f97316' }} /> Soil Temperature
            </h3>
            {loading ? <div className={styles.chartSkeleton} /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.soil_temperature_trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="soilTempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f97316" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} unit="°C" />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="temperature" name="Soil Temp" unit="°C" stroke="#f97316" strokeWidth={2} fill="url(#soilTempGrad)" dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>

          <div className={styles.chartCard}>
            {loading ? <div className={styles.chartSkeleton} /> : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={tempTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} unit="°C" />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="temperature" name="Temp" unit="°C" stroke="#f97316" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="humidity" name="Humidity" unit="%" stroke="#06b6d4" strokeWidth={2} dot={false} activeDot={{ r: 4 }} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
            )}
          </div>

          <div className={`${styles.chartCard} ${styles.chartFull}`}>
            <h3 className={styles.chartTitle}>
              <Sprout size={15} style={{ color: '#2d7a4f' }} /> Irrigation History
            </h3>
            {loading ? <div className={styles.chartSkeleton} /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.irrigation_history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="irrigGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#2d7a4f" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#5ec98a" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} unit="L" />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="cycles" name="Irrigation Cycles" unit="" fill="url(#irrigGrad)" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
