import { useEffect, useState, useCallback } from 'react';
import {
  Sun, Cloud, CloudRain, CloudLightning, Wind, CloudFog, Snowflake, CloudSun,
  Droplets, Umbrella, Gauge, Eye, RefreshCw, AlertCircle, MapPin,
  ArrowUp, ArrowDown, Clock, Repeat2, Droplet, Ban, CalendarDays,
  Sprout, FlaskConical, Leaf, CloudOff, CalendarClock, Zap,
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import styles from './Weather.module.css';

const CONDITION_META = {
  sunny:         { Icon: Sun,            label: 'Sunny',         grad: ['#f97316', '#fbbf24'] },
  cloudy:        { Icon: Cloud,          label: 'Cloudy',        grad: ['#64748b', '#94a3b8'] },
  rainy:         { Icon: CloudRain,      label: 'Rainy',         grad: ['#1d4ed8', '#3b82f6'] },
  stormy:        { Icon: CloudLightning, label: 'Stormy',        grad: ['#4c1d95', '#7c3aed'] },
  windy:         { Icon: Wind,           label: 'Windy',         grad: ['#065f46', '#10b981'] },
  foggy:         { Icon: CloudFog,       label: 'Foggy',         grad: ['#6b7280', '#9ca3af'] },
  snowy:         { Icon: Snowflake,      label: 'Snowy',         grad: ['#1e40af', '#60a5fa'] },
  partly_cloudy: { Icon: CloudSun,       label: 'Partly Cloudy', grad: ['#d97706', '#fcd34d'] },
};

const FORECAST_META = {
  sunny:         { Icon: Sun,            color: '#f59e0b' },
  cloudy:        { Icon: Cloud,          color: '#94a3b8' },
  rainy:         { Icon: CloudRain,      color: '#60a5fa' },
  stormy:        { Icon: CloudLightning, color: '#a78bfa' },
  windy:         { Icon: Wind,           color: '#34d399' },
  foggy:         { Icon: CloudFog,       color: '#9ca3af' },
  snowy:         { Icon: Snowflake,      color: '#93c5fd' },
  partly_cloudy: { Icon: CloudSun,       color: '#fcd34d' },
};

function getMeta(condition = '') {
  const key = condition.toLowerCase().replace(' ', '_');
  return CONDITION_META[key] ?? { Icon: Sun, label: condition, grad: ['#6b7280', '#9ca3af'] };
}

function getForecastMeta(condition = '') {
  const key = condition.toLowerCase().replace(' ', '_');
  return FORECAST_META[key] ?? { Icon: Sun, color: '#f59e0b' };
}

export default function IrrigationPlanner() {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [activeDay, setActiveDay] = useState(0);

  const fetchWeather = useCallback(() => {
    setLoading(true);
    setError('');
    const doFetch = async (params = '') => {
      try {
        const { data: res } = await api.get(`/weather/${params}`);
        setData(res);
      } catch {
        setError('Failed to load data. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => doFetch(`?lat=${coords.latitude}&lon=${coords.longitude}`),
        () => doFetch()
      );
    } else {
      doFetch();
    }
  }, []);

  useEffect(() => { fetchWeather(); }, [fetchWeather]);

  const current    = data?.current  ?? {};
  const forecast   = data?.forecast ?? [];
  const hourly     = data?.hourly   ?? [];
  const settings   = data?.irrigation_settings ?? {};
  const { Icon: HeroIcon, label, grad } = getMeta(current.condition);

  const selectedDay = forecast[activeDay];
  const irrigation  = selectedDay?.irrigation ?? current.irrigation ?? {};
  const weeklyWater = settings.weekly_water_l  ?? 0;
  const weeklySave  = settings.weekly_saving_l ?? 0;

  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/* ── Page header ─────────────────────────────── */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Irrigation Planner</h1>
            <p className={styles.pageSubtitle}>Weather-based irrigation schedule &amp; water estimates</p>
          </div>
          <button className={styles.refreshBtn} onClick={fetchWeather} disabled={loading}>
            <RefreshCw size={15} className={loading ? styles.spinning : ''} />
            Refresh
          </button>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {loading && data && (
          <div className={styles.staleBar}>
            <span className={styles.smallSpinner} /> Refreshing weather data…
          </div>
        )}

        {loading && !data ? (
          <div className={styles.loadingBox}>
            <span className={styles.bigSpinner} />
            <p>Fetching data…</p>
          </div>
        ) : (
          <>
            {/* ════════════════════════════════════════════
                SECTION 1 — Current Weather
            ════════════════════════════════════════════ */}
            <section className={styles.section}>
              <div className={styles.sectionLabel}>
                <Sun size={15} /> Current Weather
              </div>
              <div className={styles.weatherCard} style={{ '--g1': grad[0], '--g2': grad[1] }}>
                <div className={styles.cardTop}>
                  <div className={styles.mainInfo}>
                    <HeroIcon size={72} color="rgba(255,255,255,0.95)" strokeWidth={1.25} />
                    <div>
                      <p className={styles.condition}>{label}</p>
                      <p className={styles.temp}>
                        {current.temperature ?? '—'}<span className={styles.tempUnit}>°C</span>
                      </p>
                      {current.description && <p className={styles.description}>{current.description}</p>}
                      {current.location    && <p className={styles.location}><MapPin size={12} /> {current.location}</p>}
                    </div>
                  </div>
                  <div className={styles.pills}>
                    <div className={styles.pill}><Droplets size={13} /><span>{current.humidity ?? '—'}%</span><span className={styles.pillLabel}>Humidity</span></div>
                    <div className={styles.pill}><Wind size={13} /><span>{current.wind_speed ?? '—'} km/h</span><span className={styles.pillLabel}>Wind</span></div>
                    <div className={styles.pill}><Umbrella size={13} /><span>{current.rain_probability ?? '—'}%</span><span className={styles.pillLabel}>Rain</span></div>
                    {current.visibility != null && <div className={styles.pill}><Eye size={13} /><span>{current.visibility} km</span><span className={styles.pillLabel}>Visibility</span></div>}
                    {current.pressure   != null && <div className={styles.pill}><Gauge size={13} /><span>{current.pressure} hPa</span><span className={styles.pillLabel}>Pressure</span></div>}
                  </div>
                </div>
                <p className={styles.updated}>
                  Updated {current.updated_at ? new Date(current.updated_at).toLocaleTimeString() : 'N/A'}
                </p>
              </div>
            </section>

            {/* ════════════════════════════════════════════
                SECTION 2 — Hourly Forecast
            ════════════════════════════════════════════ */}
            {hourly.length > 0 && (
              <section className={styles.section}>
                <div className={styles.sectionLabel}>
                  <Clock size={15} /> Next Hours
                </div>
                <div className={styles.hourlyCard}>
                  <div className={styles.hourlyStrip}>
                    {hourly.map((h, i) => {
                      const { Icon: HIcon, color } = getForecastMeta(h.condition);
                      return (
                        <div key={i} className={`${styles.hourlyCol} ${h.pump_active ? styles.hourlyColPump : ''}`}>
                          <span className={styles.hourlyTime}>{h.time}</span>
                          <HIcon size={22} color={color} strokeWidth={1.75} />
                          <span className={styles.hourlyTemp}>{h.temp}°</span>
                          <span className={styles.hourlyRain}><Droplets size={10} />{h.rain_probability}%</span>
                          {h.pump_active && (
                            <span className={styles.pumpBadge}><Zap size={10} />Pump</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* ════════════════════════════════════════════
                SECTION 3 — 7-Day Forecast
            ════════════════════════════════════════════ */}
            {forecast.length > 0 && (
              <section className={styles.section}>
                <div className={styles.sectionLabel}>
                  <CalendarDays size={15} /> 7-Day Forecast
                </div>
                <div className={styles.forecastCard}>
                  <div className={styles.forecastStrip}>
                    {forecast.map((day, i) => {
                      const { Icon: FIcon, color } = getForecastMeta(day.condition);
                      return (
                        <button
                          key={day.date ?? i}
                          className={`${styles.forecastCol} ${activeDay === i ? styles.forecastColActive : ''}`}
                          onClick={() => setActiveDay(i)}
                        >
                          <span className={styles.forecastDay}>{day.day}</span>
                          <FIcon size={26} color={color} strokeWidth={1.75} />
                          <div className={styles.forecastTemps}>
                            <span className={styles.fTempHigh}><ArrowUp size={10} />{day.temp_high}°</span>
                            <span className={styles.fTempLow}><ArrowDown size={10} />{day.temp_low}°</span>
                          </div>
                          <span className={styles.forecastRain}><Droplets size={10} />{day.rain_probability}%</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* ════════════════════════════════════════════
                SECTION 3 — Irrigation Plan
            ════════════════════════════════════════════ */}
            <section className={styles.section}>
              <div className={styles.sectionLabel}>
                <CalendarClock size={15} /> Irrigation Plan — {selectedDay?.day ?? 'Today'}
              </div>

              <div className={styles.irrigationCard}>
                {irrigation.skip ? (
                  <div className={styles.skipBanner}>
                    <Ban size={22} color="#ef4444" />
                    <div>
                      <p className={styles.skipTitle}>No Irrigation Needed</p>
                      <p className={styles.skipReason}>{irrigation.reason}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Pump stats */}
                    <div className={styles.iStats}>
                      <div className={styles.iStat}>
                        <Repeat2 size={18} color="#6366f1" />
                        <span className={styles.iStatValue}>{irrigation.cycles}</span>
                        <span className={styles.iStatLabel}>Cycles</span>
                      </div>
                      <div className={styles.iStatDivider} />
                      <div className={styles.iStat}>
                        <Clock size={18} color="#f59e0b" />
                        <span className={styles.iStatValue}>{irrigation.duration_min}<span className={styles.iStatUnit}>min</span></span>
                        <span className={styles.iStatLabel}>Per Cycle</span>
                      </div>
                      <div className={styles.iStatDivider} />
                      <div className={styles.iStat}>
                        <Droplet size={18} color="#3b82f6" />
                        <span className={styles.iStatValue}>{irrigation.water_per_cycle_l}<span className={styles.iStatUnit}>L</span></span>
                        <span className={styles.iStatLabel}>Per Cycle</span>
                      </div>
                      <div className={styles.iStatDivider} />
                      <div className={styles.iStat}>
                        <Droplets size={18} color="#10b981" />
                        <span className={styles.iStatValue}>{irrigation.water_total_l}<span className={styles.iStatUnit}>L</span></span>
                        <span className={styles.iStatLabel}>Today Total</span>
                      </div>
                    </div>

                    {/* Water detail */}
                    <div className={styles.waterDetail}>
                      <div className={styles.waterItem}>
                        <FlaskConical size={15} color="#8b5cf6" />
                        <span>Estimated need</span>
                        <strong>{irrigation.estimated_need_l} L</strong>
                      </div>
                      <div className={styles.waterItem}>
                        <CloudOff size={15} color="#06b6d4" />
                        <span>Rain saves</span>
                        <strong>{irrigation.rain_saving_l} L</strong>
                      </div>
                    </div>

                    {/* Pump times */}
                    {irrigation.pump_times?.length > 0 && (
                      <div className={styles.pumpTimesRow}>
                        <span className={styles.pumpTimesLabel}>Scheduled pump times</span>
                        <div className={styles.pumpTimes}>
                          {irrigation.pump_times.map((t) => (
                            <div key={t} className={styles.pumpTime}>
                              <Clock size={12} /><span>{t}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className={styles.irrigationReason}>{irrigation.reason}</p>
                  </>
                )}

                {/* Weekly summary */}
                <div className={styles.weeklySummary}>
                  <div className={styles.weeklyItem}>
                    <Sprout size={15} color="#10b981" />
                    <span className={styles.weeklyLabel}>Soil</span>
                    <span className={styles.weeklyValue}>{settings.soil_type ?? '—'}</span>
                  </div>
                  <div className={styles.weeklyDivider} />
                  <div className={styles.weeklyItem}>
                    <Leaf size={15} color="#22c55e" />
                    <span className={styles.weeklyLabel}>Plant</span>
                    <span className={styles.weeklyValue}>{settings.plant_type ?? '—'}</span>
                  </div>
                  <div className={styles.weeklyDivider} />
                  <div className={styles.weeklyItem}>
                    <Droplets size={15} color="#3b82f6" />
                    <span className={styles.weeklyLabel}>7-day water</span>
                    <span className={styles.weeklyValue}>{weeklyWater} L</span>
                  </div>
                  <div className={styles.weeklyDivider} />
                  <div className={styles.weeklyItem}>
                    <CloudOff size={15} color="#06b6d4" />
                    <span className={styles.weeklyLabel}>Rain saves</span>
                    <span className={styles.weeklyValue}>{weeklySave} L</span>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
