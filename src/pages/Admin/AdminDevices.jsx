import { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';

// Fix leaflet default marker icons broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });
import {
  CircuitBoard, Trash2, RefreshCw, Search, CheckCircle2, XCircle,
  Wifi, WifiOff, Plus, Copy, Eye, EyeOff, X, Zap, AlertTriangle,
  Clock, Thermometer, Droplets, Activity, Key, AlertCircle, Info, ShieldAlert,
  Wrench, UserCheck, RotateCcw, Settings2, Power, PowerOff, Leaf, Layers, Save, MapPin, CloudSun,
} from 'lucide-react';
import styles from './Admin.module.css';

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <p className={styles.modalMsg}>{message}</p>
        <div className={styles.modalActions}>
          <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button className={styles.deleteBtn} onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function CopyBtn({ value }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button className={styles.copyBtn} onClick={copy} title="Copy">
      {copied ? <CheckCircle2 size={13} color="#10b981" /> : <Copy size={13} />}
    </button>
  );
}

function GenerateModal({ onClose, onCreated }) {
  const [loading, setLoading]     = useState(false);
  const [generated, setGenerated] = useState(null);
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError]         = useState('');

  const generate = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/users/admin/devices/generate/');
      setGenerated(data);
    } catch {
      setError('Failed to generate. Try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { generate(); }, [generate]);

  return (
    <div className={styles.backdrop}>
      <div className={styles.genModal}>
        <div className={styles.genHeader}>
          <div className={styles.genTitle}><Key size={18} color="#2d7a4f" /> Generate Device Credentials</div>
          <button className={styles.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>
        <div className={styles.genBody}>
          {loading && <p className={styles.genLoading}>Generating secure credentials…</p>}
          {error   && <p className={styles.genError}>{error}</p>}
          {generated && (
            <>
              <p className={styles.genNote}>
                Share these with the device owner. The <strong>Secret Key</strong> is shown only once.
              </p>
              <div className={styles.credRow}>
                <span className={styles.credLabel}>Device ID</span>
                <div className={styles.credValue}>
                  <code>{generated.device_id}</code>
                  <CopyBtn value={generated.device_id} />
                </div>
              </div>
              <div className={styles.credRow}>
                <span className={styles.credLabel}>Pairing Code</span>
                <div className={styles.credValue}>
                  <code className={styles.pairingCode}>{generated.pairing_code}</code>
                  <CopyBtn value={generated.pairing_code} />
                </div>
              </div>
              <div className={styles.credRow}>
                <span className={styles.credLabel}>Secret Key</span>
                <div className={styles.credValue}>
                  <code className={styles.secretCode}>
                    {showSecret ? generated.secret_key : '••••••••••••••••••••••••••••••••'}
                  </code>
                  <button className={styles.copyBtn} onClick={() => setShowSecret(v => !v)}>
                    {showSecret ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <CopyBtn value={generated.secret_key} />
                </div>
              </div>
              <div className={styles.genActions}>
                <button className={styles.regenBtn} onClick={generate} disabled={loading}>
                  <RefreshCw size={13} className={loading ? styles.spinning : ''} /> Regenerate
                </button>
                <button className={styles.doneBtn} onClick={() => { onCreated(); onClose(); }}>Done</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


function MapClickHandler({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function FlyTo({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 13, { duration: 1.2 });
  }, [coords, map]);
  return null;
}

function PlaceSearch({ onSelect }) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  const search = useCallback(async (q) => {
    if (q.trim().length < 3) { setResults([]); return; }
    setSearching(true);
    try {
      const { data } = await api.get(`/location-search/?q=${encodeURIComponent(q)}`);
      setResults(data);
    } catch { setResults([]); }
    finally { setSearching(false); }
  }, []);

  const handleChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(v), 400);
  };

  const pick = (r) => {
    onSelect(parseFloat(r.lat), parseFloat(r.lon), r.display_name);
    setQuery(r.display_name);
    setResults([]);
  };

  return (
    <div className={styles.placeSearchWrap}>
      <div className={styles.placeInputRow}>
        <Search size={13} className={styles.placeIcon} />
        <input
          className={styles.placeInput}
          placeholder="Search place, village, city…"
          value={query}
          onChange={handleChange}
        />
        {searching && <RefreshCw size={13} className={styles.spinning} style={{ color: '#6b7280', flexShrink: 0 }} />}
      </div>
      {results.length > 0 && (
        <ul className={styles.placeDropdown}>
          {results.map((r, i) => (
            <li key={i} className={styles.placeItem} onClick={() => pick(r)}>
              <MapPin size={12} style={{ flexShrink: 0, color: '#2d7a4f' }} />
              <span>{r.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const CROP_TYPES = ['Maize','Wheat','Rice','Soybean','Tomato','Potato','Cotton','Sugarcane','Sunflower','Groundnut','Cassava','Banana','Mango','Cabbage','Onion','Pepper','Cucumber','Watermelon','Other'];
const SOIL_TYPES = ['Sandy','Clay','Silt','Loam','Sandy Loam','Clay Loam','Peat','Chalk'];

function AdminFixPanel({ device, onFixed }) {
  const [tab, setTab]       = useState('config');
  const [saving, setSaving] = useState(false);
  const [log, setLog]       = useState('');
  const [error, setError]   = useState('');
  const [flyTo, setFlyTo]   = useState(null);
  const [weatherPreview, setWeatherPreview] = useState(null);

  // config form
  const [cfg, setCfg] = useState({
    device_name:          device.device_name || '',
    crop_type:            device.crop_type   || '',
    soil_type:            device.soil_type   || '',
    weather_lat:          device.weather_lat  ?? '',
    weather_lon:          device.weather_lon  ?? '',
    weather_location_name: device.weather_location_name || '',
  });

  // farm settings form
  const [farm, setFarm] = useState({
    soil_type:             '',
    plant_type:            '',
    moisture_min:          40,
    moisture_max:          70,
    moisture_critical_low: 20,
    irrigation_duration:   30,
  });

  const act = async (action, extra = {}) => {
    setSaving(true); setLog(''); setError('');
    try {
      const { data } = await api.patch(`/users/admin/devices/${device.id}/fix/`, { action, ...extra });
      setLog(data.log?.join(' ') || 'Done.');
      if (data.weather_preview) setWeatherPreview(data.weather_preview);
      onFixed(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Action failed.');
    } finally { setSaving(false); }
  };

  const TABS = [
    { key: 'config',   label: 'Device Config',    Icon: Settings2 },
    { key: 'farm',     label: 'Farm Settings',     Icon: Leaf      },
    { key: 'location', label: 'Weather Location',  Icon: MapPin    },
    { key: 'pairing',  label: 'Pairing',           Icon: UserCheck },
    { key: 'status',   label: 'Status',            Icon: Power     },
  ];

  return (
    <div className={styles.fixPanel}>
      <div className={styles.fixPanelTitle}><Wrench size={15} color="#f59e0b" /> Admin Fix Panel</div>

      <div className={styles.fixTabs}>
        {TABS.map(({ key, label, Icon }) => (
          <button key={key}
            className={`${styles.fixTab} ${tab === key ? styles.fixTabActive : ''}`}
            onClick={() => { setTab(key); setLog(''); setError(''); }}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {log   && <div className={styles.fixLog}><CheckCircle2 size={13} color="#10b981" /> {log}</div>}
      {error && <div className={styles.fixError}><AlertCircle size={13} /> {error}</div>}

      {/* ── Device Config ── */}
      {tab === 'config' && (
        <div className={styles.fixForm}>
          <p className={styles.fixHint}>Update device name, crop type and soil type on behalf of the user.</p>
          <div className={styles.fixField}>
            <label>Device Name</label>
            <input className={styles.fixInput} value={cfg.device_name}
              onChange={e => setCfg(p => ({ ...p, device_name: e.target.value }))} />
          </div>
          <div className={styles.fixField}>
            <label>Crop Type</label>
            <select className={styles.fixInput} value={cfg.crop_type}
              onChange={e => setCfg(p => ({ ...p, crop_type: e.target.value }))}>
              <option value="">— Select —</option>
              {CROP_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className={styles.fixField}>
            <label>Soil Type</label>
            <select className={styles.fixInput} value={cfg.soil_type}
              onChange={e => setCfg(p => ({ ...p, soil_type: e.target.value }))}>
              <option value="">— Select —</option>
              {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button className={styles.fixBtn} disabled={saving}
            onClick={() => act('update_config', cfg)}>
            <Save size={13} /> {saving ? 'Saving…' : 'Save Device Config'}
          </button>
        </div>
      )}

      {/* ── Farm Settings ── */}
      {tab === 'farm' && (
        <div className={styles.fixForm}>
          <p className={styles.fixHint}>Update the user's farm settings directly — soil type, plant type, moisture thresholds.</p>
          <div className={styles.fixGrid2}>
            <div className={styles.fixField}>
              <label>Soil Type</label>
              <select className={styles.fixInput} value={farm.soil_type}
                onChange={e => setFarm(p => ({ ...p, soil_type: e.target.value }))}>
                <option value="">— Select —</option>
                {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className={styles.fixField}>
              <label>Plant Type</label>
              <select className={styles.fixInput} value={farm.plant_type}
                onChange={e => setFarm(p => ({ ...p, plant_type: e.target.value }))}>
                <option value="">— Select —</option>
                {CROP_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.fixField}>
              <label>Moisture Min (%)</label>
              <input type="number" className={styles.fixInput} min="0" max="100"
                value={farm.moisture_min}
                onChange={e => setFarm(p => ({ ...p, moisture_min: e.target.value }))} />
            </div>
            <div className={styles.fixField}>
              <label>Moisture Max (%)</label>
              <input type="number" className={styles.fixInput} min="0" max="100"
                value={farm.moisture_max}
                onChange={e => setFarm(p => ({ ...p, moisture_max: e.target.value }))} />
            </div>
            <div className={styles.fixField}>
              <label>Critical Low (%)</label>
              <input type="number" className={styles.fixInput} min="0" max="100"
                value={farm.moisture_critical_low}
                onChange={e => setFarm(p => ({ ...p, moisture_critical_low: e.target.value }))} />
            </div>
            <div className={styles.fixField}>
              <label>Irrigation Duration (min)</label>
              <input type="number" className={styles.fixInput} min="5" max="120"
                value={farm.irrigation_duration}
                onChange={e => setFarm(p => ({ ...p, irrigation_duration: e.target.value }))} />
            </div>
          </div>
          <button className={styles.fixBtn} disabled={saving}
            onClick={() => act('update_farm_settings', farm)}>
            <Save size={13} /> {saving ? 'Saving…' : 'Save Farm Settings'}
          </button>
        </div>
      )}

      {/* ── Weather Location ── */}
      {tab === 'location' && (
        <div className={styles.fixForm}>
          <p className={styles.fixHint}>
            Search for a place or click anywhere on the map to drop a pin.
          </p>

          {/* Place search */}
          <PlaceSearch
            onSelect={(lat, lon, name) => {
              setFlyTo([lat, lon]);
              setCfg(p => ({
                ...p,
                weather_lat: lat.toFixed(6),
                weather_lon: lon.toFixed(6),
                weather_location_name: p.weather_location_name || name.split(',').slice(0, 2).join(',').trim(),
              }));
            }}
          />

          {/* Map picker */}
          <div className={styles.mapWrap}>
            <MapContainer
              center={[
                cfg.weather_lat ? parseFloat(cfg.weather_lat) : 0,
                cfg.weather_lon ? parseFloat(cfg.weather_lon) : 20,
              ]}
              zoom={cfg.weather_lat ? 10 : 2}
              className={styles.mapContainer}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <MapClickHandler
                onPick={(lat, lon) => {
                  setFlyTo(null);
                  setCfg(p => ({
                    ...p,
                    weather_lat: lat.toFixed(6),
                    weather_lon: lon.toFixed(6),
                  }));
                }}
              />
              <FlyTo coords={flyTo} />
              {cfg.weather_lat && cfg.weather_lon && (
                <Marker position={[parseFloat(cfg.weather_lat), parseFloat(cfg.weather_lon)]} />
              )}
            </MapContainer>
            <p className={styles.mapHint}><MapPin size={11} /> Click on the map to place the pin</p>
          </div>

          <div className={styles.fixGrid2}>
            <div className={styles.fixField}>
              <label>Latitude</label>
              <input
                type="number" step="any" className={styles.fixInput}
                placeholder="e.g. -1.2921"
                value={cfg.weather_lat ?? ''}
                onChange={e => setCfg(p => ({ ...p, weather_lat: e.target.value }))}
              />
            </div>
            <div className={styles.fixField}>
              <label>Longitude</label>
              <input
                type="number" step="any" className={styles.fixInput}
                placeholder="e.g. 36.8219"
                value={cfg.weather_lon ?? ''}
                onChange={e => setCfg(p => ({ ...p, weather_lon: e.target.value }))}
              />
            </div>
          </div>
          <div className={styles.fixField}>
            <label>Location Name <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional label)</span></label>
            <input
              className={styles.fixInput}
              placeholder="e.g. Nairobi, Kenya"
              value={cfg.weather_location_name ?? ''}
              onChange={e => setCfg(p => ({ ...p, weather_location_name: e.target.value }))}
            />
          </div>
          <button
            className={`${styles.fixBtn} ${styles.fixBtnSuccess}`} disabled={saving}
            onClick={() => act('set_weather_location', {
              lat: cfg.weather_lat,
              lon: cfg.weather_lon,
              name: cfg.weather_location_name || '',
            })}>
            <MapPin size={13} /> {saving ? 'Saving…' : 'Save Weather Location'}
          </button>

          {weatherPreview && !weatherPreview.error && (
            <div className={styles.weatherPreview}>
              <div className={styles.wpHeader}>
                <MapPin size={13} color="#2d7a4f" />
                <span className={styles.wpLocation}>{weatherPreview.location}</span>
                <span className={styles.wpBadge}>Live</span>
              </div>
              <div className={styles.wpRow}>
                <div className={styles.wpStat}>
                  <Thermometer size={14} color="#f59e0b" />
                  <span>{weatherPreview.temperature}°C</span>
                  <small>Temp</small>
                </div>
                <div className={styles.wpStat}>
                  <Droplets size={14} color="#3b82f6" />
                  <span>{weatherPreview.humidity}%</span>
                  <small>Humidity</small>
                </div>
                <div className={styles.wpStat}>
                  <CloudSun size={14} color="#6366f1" />
                  <span>{weatherPreview.condition}</span>
                  <small>Condition</small>
                </div>
                <div className={styles.wpStat}>
                  <Droplets size={14} color="#1d4ed8" />
                  <span>{weatherPreview.rain_prob}%</span>
                  <small>Rain</small>
                </div>
              </div>
              <div className={`${styles.wpPump} ${weatherPreview.pump.skip ? styles.wpPumpSkip : styles.wpPumpOn}`}>
                <Zap size={13} />
                <span>
                  {weatherPreview.pump.skip
                    ? weatherPreview.pump.reason
                    : `Pump: ${weatherPreview.pump.reason} • ${weatherPreview.pump.water_l}L estimated`}
                </span>
              </div>
            </div>
          )}
          {weatherPreview?.error && (
            <p className={styles.fixHint} style={{ color: '#ef4444' }}>Weather preview unavailable.</p>
          )}
        </div>
      )}

      {/* ── Pairing ── */}
      {tab === 'pairing' && (
        <div className={styles.fixForm}>
          <p className={styles.fixHint}>Fix pairing issues — unpair so the user can re-pair, or reset credentials entirely.</p>
          <div className={styles.fixActions}>
            <div className={styles.fixActionCard}>
              <div className={styles.fixActionTitle}><RotateCcw size={14} color="#f59e0b" /> Unpair Device</div>
              <p className={styles.fixActionDesc}>Removes the current pairing so the user can re-pair using the same Device ID and Pairing Code.</p>
              <button className={`${styles.fixBtn} ${styles.fixBtnWarning}`} disabled={saving}
                onClick={() => act('unpair')}>
                {saving ? 'Working…' : 'Unpair Device'}
              </button>
            </div>
            <div className={styles.fixActionCard}>
              <div className={styles.fixActionTitle}><Key size={14} color="#ef4444" /> Reset Credentials</div>
              <p className={styles.fixActionDesc}>Generates a new Pairing Code and Secret Key. The old credentials will stop working. Share the new ones with the user.</p>
              <button className={`${styles.fixBtn} ${styles.fixBtnDanger}`} disabled={saving}
                onClick={() => act('reset_credentials')}>
                {saving ? 'Working…' : 'Reset Credentials'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Status ── */}
      {tab === 'status' && (
        <div className={styles.fixForm}>
          <p className={styles.fixHint}>Manually override the device connection status in the database.</p>
          <div className={styles.fixActions}>
            <div className={styles.fixActionCard}>
              <div className={styles.fixActionTitle}><Power size={14} color="#10b981" /> Force Online</div>
              <p className={styles.fixActionDesc}>Marks the device as Online and updates last_seen to now. Use when the device is actually connected but status is stuck.</p>
              <button className={`${styles.fixBtn} ${styles.fixBtnSuccess}`} disabled={saving}
                onClick={() => act('force_online')}>
                {saving ? 'Working…' : 'Force Online'}
              </button>
            </div>
            <div className={styles.fixActionCard}>
              <div className={styles.fixActionTitle}><PowerOff size={14} color="#6b7280" /> Force Offline</div>
              <p className={styles.fixActionDesc}>Marks the device as Offline. Use to correct a stuck Online status when the device is not actually connected.</p>
              <button className={`${styles.fixBtn} ${styles.fixBtnGray}`} disabled={saving}
                onClick={() => act('force_offline')}>
                {saving ? 'Working…' : 'Force Offline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DeviceDetailModal({ device, onClose }) {
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const [showFix, setShowFix]     = useState(false);

  useEffect(() => {
    api.get(`/users/admin/devices/${device.id}/stats/`)
      .then(({ data }) => setStats(data))
      .catch(() => setStats(device))
      .finally(() => setLoading(false));
  }, [device]);

  const d = stats || device;

  const health = (() => {
    if (!d.is_paired)       return { label: 'Not Paired',        color: '#9ca3af', Icon: XCircle       };
    if (d.status === 'Online') return { label: 'Online',         color: '#10b981', Icon: Wifi          };
    if (d.last_seen && (Date.now() - new Date(d.last_seen)) / 60000 < 60)
                            return { label: 'Recently Offline',  color: '#f59e0b', Icon: AlertTriangle };
    return                         { label: 'Offline',           color: '#ef4444', Icon: WifiOff       };
  })();

  return (
    <div className={styles.backdrop}>
      <div className={styles.detailModal}>
        <div className={styles.genHeader}>
          <div className={styles.genTitle}><CircuitBoard size={18} color="#6366f1" />{d.device_name || d.device_id}</div>
          <div style={{display:'flex',gap:'0.4rem'}}>
            <button className={styles.fixToggleBtn} onClick={() => setShowFix(v => !v)} title="Admin Fix Panel">
              <Wrench size={14} /> {showFix ? 'Hide Fix Panel' : 'Fix'}
            </button>
            <button className={styles.closeBtn} onClick={onClose}><X size={16} /></button>
          </div>
        </div>
        {loading ? (
          <div className={styles.genBody}><p className={styles.genLoading}>Loading…</p></div>
        ) : (
          <div className={styles.detailBody}>
            <div className={styles.healthBanner} style={{ borderColor: health.color }}>
              <health.Icon size={16} color={health.color} />
              <span style={{ color: health.color, fontWeight: 700 }}>{health.label}</span>
              {d.last_seen && (
                <span className={styles.lastSeenText}>Last seen: {new Date(d.last_seen).toLocaleString()}</span>
              )}
            </div>

            <div className={styles.detailSection}>
              <p className={styles.detailSectionTitle}>Credentials</p>
              <div className={styles.credRow}>
                <span className={styles.credLabel}>Device ID</span>
                <div className={styles.credValue}><code>{d.device_id}</code><CopyBtn value={d.device_id} /></div>
              </div>
              <div className={styles.credRow}>
                <span className={styles.credLabel}>Pairing Code</span>
                <div className={styles.credValue}>
                  <code className={styles.pairingCode}>{d.pairing_code}</code>
                  <CopyBtn value={d.pairing_code} />
                </div>
              </div>
              <div className={styles.credRow}>
                <span className={styles.credLabel}>Secret Key</span>
                <div className={styles.credValue}>
                  <code className={styles.secretCode}>
                    {showSecret ? d.secret_key : '••••••••••••••••••••••••••••••••'}
                  </code>
                  <button className={styles.copyBtn} onClick={() => setShowSecret(v => !v)}>
                    {showSecret ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <CopyBtn value={d.secret_key} />
                </div>
              </div>
            </div>

            <div className={styles.detailSection}>
              <p className={styles.detailSectionTitle}>Device Info</p>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}><span>Owner</span><strong>{d.owner_name}</strong></div>
                <div className={styles.infoItem}><span>Contact</span><strong>{d.owner_email}</strong></div>
                <div className={styles.infoItem}><span>Crop Type</span><strong>{d.crop_type || '—'}</strong></div>
                <div className={styles.infoItem}><span>Soil Type</span><strong>{d.soil_type || '—'}</strong></div>
                <div className={styles.infoItem}><span>Paired</span><strong>{d.is_paired ? 'Yes' : 'No'}</strong></div>
                <div className={styles.infoItem}><span>Paired At</span><strong>{d.paired_at ? new Date(d.paired_at).toLocaleDateString() : '—'}</strong></div>
                <div className={styles.infoItem}><span>Created</span><strong>{new Date(d.created_at).toLocaleDateString()}</strong></div>
                <div className={styles.infoItem}><span>Total Readings</span><strong>{d.total_readings ?? '—'}</strong></div>
              </div>
            </div>

            {d.latest_reading && (
              <div className={styles.detailSection}>
                <p className={styles.detailSectionTitle}>Latest Sensor Reading</p>
                <div className={styles.sensorGrid}>
                  <div className={styles.sensorCard}>
                    <Droplets size={16} color="#3b82f6" />
                    <span>{d.latest_reading.soil_moisture ?? '—'}%</span>
                    <small>Soil Moisture</small>
                  </div>
                  <div className={styles.sensorCard}>
                    <Thermometer size={16} color="#f59e0b" />
                    <span>{d.latest_reading.temperature ?? '—'}°C</span>
                    <small>Temperature</small>
                  </div>
                  <div className={styles.sensorCard}>
                    <Activity size={16} color="#8b5cf6" />
                    <span>{d.latest_reading.humidity ?? '—'}%</span>
                    <small>Humidity</small>
                  </div>
                  <div className={styles.sensorCard}>
                    <Zap size={16} color="#10b981" />
                    <span>{d.latest_reading.pump_status}</span>
                    <small>Pump</small>
                  </div>
                </div>
                <p className={styles.readingTime}>
                  <Clock size={11} /> {new Date(d.latest_reading.recorded_at).toLocaleString()}
                </p>
              </div>
            )}

            {/* Diagnostics */}
            <div className={styles.detailSection}>
              <p className={styles.detailSectionTitle}>
                Diagnostics
                {d.diagnostics?.length > 0 && (
                  <span className={styles.diagCount}>{d.diagnostics.length} issue{d.diagnostics.length > 1 ? 's' : ''}</span>
                )}
              </p>
              {!d.diagnostics || d.diagnostics.length === 0 ? (
                <div className={styles.diagOk}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>No issues detected — device is operating normally.</span>
                </div>
              ) : (
                <div className={styles.diagList}>
                  {d.diagnostics.map((issue, i) => {
                    const cfg = {
                      critical: { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', Icon: ShieldAlert },
                      high:     { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', Icon: AlertCircle },
                      medium:   { color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', Icon: AlertTriangle },
                      low:      { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', Icon: Info },
                    }[issue.severity] || { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', Icon: Info };
                    return (
                      <div key={i} className={styles.diagCard} style={{ background: cfg.bg, borderColor: cfg.border }}>
                        <div className={styles.diagHeader}>
                          <cfg.Icon size={15} color={cfg.color} />
                          <span className={styles.diagTitle} style={{ color: cfg.color }}>{issue.title}</span>
                          <span className={styles.diagSeverity} style={{ color: cfg.color }}>{issue.severity.toUpperCase()}</span>
                        </div>
                        <p className={styles.diagReason}>{issue.reason}</p>
                        <div className={styles.diagFix}>
                          <span className={styles.diagFixLabel}>Fix:</span> {issue.fix}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {showFix && (
              <AdminFixPanel
                device={d}
                onFixed={(updated) => setStats(s => ({ ...s, ...updated }))}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDevices() {
  const [devices, setDevices]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirm, setConfirm]       = useState(null);
  const [toast, setToast]           = useState('');
  const [showGenerate, setShowGenerate] = useState(false);
  const [detailDevice, setDetailDevice] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/users/admin/devices/'); setDevices(data); }
    catch { /* interceptor handles */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDevices(); }, [fetchDevices]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/admin/devices/${id}/`);
      setDevices(d => d.filter(x => x.id !== id));
      showToast('Device deleted.');
    } catch { showToast('Delete failed.'); }
  };

  const onlineCount   = devices.filter(d => d.status === 'Online').length;
  const offlineCount  = devices.filter(d => d.status !== 'Online' && d.is_paired).length;
  const unpairedCount = devices.filter(d => !d.is_paired).length;

  const filtered = devices.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = (
      d.device_name?.toLowerCase().includes(q) ||
      d.device_id?.toLowerCase().includes(q) ||
      d.pairing_code?.toLowerCase().includes(q) ||
      d.owner_name?.toLowerCase().includes(q) ||
      d.owner_email?.toLowerCase().includes(q)
    );
    if (!matchSearch) return false;
    if (statusFilter === 'online')   return d.status === 'Online';
    if (statusFilter === 'offline')  return d.status !== 'Online' && d.is_paired;
    if (statusFilter === 'unpaired') return !d.is_paired;
    return true;
  });

  const statusBadge = (d) => {
    if (!d.is_paired)          return <span className={styles.badgeUnpaired}><XCircle size={11} /> Unpaired</span>;
    if (d.status === 'Online') return <span className={styles.badgeOnline}><Wifi size={11} /> Online</span>;
    if (d.last_seen && (Date.now() - new Date(d.last_seen)) / 60000 < 60)
                               return <span className={styles.badgeWarning}><AlertTriangle size={11} /> Idle</span>;
    return                            <span className={styles.badgeOffline}><WifiOff size={11} /> Offline</span>;
  };

  return (
    <DashboardLayout>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Devices</h1>
            <p className={styles.subtitle}>All registered devices across the platform</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.generateBtn} onClick={() => setShowGenerate(true)}>
              <Plus size={14} /> Generate Device
            </button>
            <button className={styles.refreshBtn} onClick={fetchDevices} disabled={loading}>
              <RefreshCw size={14} className={loading ? styles.spinning : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <CircuitBoard size={20} color="#6366f1" />
            <div><span className={styles.statVal}>{devices.length}</span><span className={styles.statLabel}>Total Devices</span></div>
          </div>
          <div className={styles.statCard}>
            <Wifi size={20} color="#10b981" />
            <div><span className={styles.statVal}>{onlineCount}</span><span className={styles.statLabel}>Online</span></div>
          </div>
          <div className={styles.statCard}>
            <WifiOff size={20} color="#ef4444" />
            <div><span className={styles.statVal}>{offlineCount}</span><span className={styles.statLabel}>Offline</span></div>
          </div>
          <div className={styles.statCard}>
            <XCircle size={20} color="#9ca3af" />
            <div><span className={styles.statVal}>{unpairedCount}</span><span className={styles.statLabel}>Unpaired</span></div>
          </div>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.filterGroup}>
            {['all', 'online', 'offline', 'unpaired'].map(f => (
              <button
                key={f}
                className={`${styles.filterBtn} ${statusFilter === f ? styles.filterActive : ''}`}
                onClick={() => setStatusFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className={styles.searchWrap}>
            <Search size={14} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search by name, ID, owner…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableWrap}>
          {loading ? (
            <div className={styles.empty}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>No devices found.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Device</th><th>Device ID</th><th>Pairing Code</th>
                  <th>Owner</th><th>Status</th><th>Readings</th><th>Last Seen</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id} className={styles.clickableRow} onClick={() => setDetailDevice(d)}>
                    <td className={styles.nameCell}>
                      <CircuitBoard size={16} color="#6366f1" />
                      <span>{d.device_name || '—'}</span>
                    </td>
                    <td>
                      <div className={styles.codeCell}>
                        <code className={styles.code}>{d.device_id}</code>
                        <CopyBtn value={d.device_id} />
                      </div>
                    </td>
                    <td>
                      <div className={styles.codeCell}>
                        <code className={`${styles.code} ${styles.pairingCodeSmall}`}>{d.pairing_code}</code>
                        <CopyBtn value={d.pairing_code} />
                      </div>
                    </td>
                    <td className={styles.contactCell}>
                      <span>{d.owner_name}</span>
                      <span className={styles.phone}>{d.owner_email}</span>
                    </td>
                    <td>{statusBadge(d)}</td>
                    <td><span className={styles.countBadge}>{d.total_readings ?? 0}</span></td>
                    <td className={styles.dateCell}>{d.last_seen ? new Date(d.last_seen).toLocaleString() : '—'}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <button
                        className={styles.iconBtn}
                        title="Delete device"
                        onClick={() => setConfirm({ id: d.id, name: d.device_name || d.device_id })}
                      >
                        <Trash2 size={15} color="#ef4444" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {confirm && (
        <ConfirmModal
          message={`Delete "${confirm.name}"? This cannot be undone.`}
          onConfirm={() => { handleDelete(confirm.id); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
        />
      )}

      {showGenerate && (
        <GenerateModal onClose={() => setShowGenerate(false)} onCreated={fetchDevices} />
      )}

      {detailDevice && (
        <DeviceDetailModal device={detailDevice} onClose={() => setDetailDevice(null)} />
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </DashboardLayout>
  );
}
