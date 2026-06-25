import { useEffect, useState, useCallback, useRef } from 'react';
import { NotebookPen, Save, CheckCircle2, MapPin, Navigation, X, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import styles from './FarmSettings.module.css';

// Static fallback — used only if API is unavailable
const STATIC_PLANTS = [
  { group: 'Cereals & Grains', name: 'Maize', min: 50, max: 75, critical: 30, icon: '🌽' },
  { group: 'Cereals & Grains', name: 'Wheat', min: 45, max: 70, critical: 25, icon: '🌾' },
  { group: 'Cereals & Grains', name: 'Rice', min: 70, max: 90, critical: 50, icon: '🍚' },
  { group: 'Cereals & Grains', name: 'Sorghum', min: 40, max: 65, critical: 20, icon: '🌾' },
  { group: 'Cereals & Grains', name: 'Millet', min: 35, max: 60, critical: 18, icon: '🌾' },
  { group: 'Cereals & Grains', name: 'Barley', min: 45, max: 65, critical: 25, icon: '🌾' },
  { group: 'Cereals & Grains', name: 'Oats', min: 45, max: 70, critical: 25, icon: '🌾' },
  { group: 'Cereals & Grains', name: 'Teff', min: 40, max: 65, critical: 20, icon: '🌾' },
  { group: 'Cereals & Grains', name: 'Quinoa', min: 40, max: 65, critical: 20, icon: '🌾' },
  { group: 'Legumes & Pulses', name: 'Soybean', min: 50, max: 75, critical: 30, icon: '🫘' },
  { group: 'Legumes & Pulses', name: 'Groundnut', min: 50, max: 70, critical: 30, icon: '🥜' },
  { group: 'Legumes & Pulses', name: 'Cowpea', min: 45, max: 70, critical: 25, icon: '🫘' },
  { group: 'Legumes & Pulses', name: 'Pigeon Pea', min: 45, max: 70, critical: 25, icon: '🫘' },
  { group: 'Legumes & Pulses', name: 'Chickpea', min: 45, max: 70, critical: 25, icon: '🫘' },
  { group: 'Legumes & Pulses', name: 'Lentil', min: 40, max: 65, critical: 22, icon: '🫘' },
  { group: 'Legumes & Pulses', name: 'Green Bean', min: 50, max: 75, critical: 30, icon: '🫘' },
  { group: 'Legumes & Pulses', name: 'Lima Bean', min: 50, max: 75, critical: 30, icon: '🫘' },
  { group: 'Legumes & Pulses', name: 'Mung Bean', min: 45, max: 70, critical: 25, icon: '🫘' },
  { group: 'Legumes & Pulses', name: 'Fava Bean', min: 50, max: 75, critical: 30, icon: '🫘' },
  { group: 'Root & Tuber Crops', name: 'Potato', min: 65, max: 85, critical: 40, icon: '🥔' },
  { group: 'Root & Tuber Crops', name: 'Cassava', min: 40, max: 65, critical: 20, icon: '🌱' },
  { group: 'Root & Tuber Crops', name: 'Sweet Potato', min: 55, max: 75, critical: 30, icon: '🍠' },
  { group: 'Root & Tuber Crops', name: 'Yam', min: 55, max: 80, critical: 35, icon: '🌱' },
  { group: 'Root & Tuber Crops', name: 'Taro', min: 60, max: 85, critical: 40, icon: '🌱' },
  { group: 'Root & Tuber Crops', name: 'Beetroot', min: 55, max: 75, critical: 30, icon: '🫚' },
  { group: 'Root & Tuber Crops', name: 'Carrot', min: 50, max: 70, critical: 30, icon: '🥕' },
  { group: 'Root & Tuber Crops', name: 'Turnip', min: 50, max: 70, critical: 28, icon: '🌱' },
  { group: 'Root & Tuber Crops', name: 'Radish', min: 50, max: 70, critical: 28, icon: '🌱' },
  { group: 'Vegetables', name: 'Tomato', min: 60, max: 80, critical: 40, icon: '🍅' },
  { group: 'Vegetables', name: 'Cabbage', min: 60, max: 80, critical: 40, icon: '🥬' },
  { group: 'Vegetables', name: 'Onion', min: 50, max: 70, critical: 30, icon: '🧅' },
  { group: 'Vegetables', name: 'Cucumber', min: 65, max: 85, critical: 45, icon: '🥒' },
  { group: 'Vegetables', name: 'Spinach', min: 60, max: 80, critical: 40, icon: '🥬' },
  { group: 'Vegetables', name: 'Kale', min: 55, max: 75, critical: 35, icon: '🥬' },
  { group: 'Vegetables', name: 'Lettuce', min: 60, max: 80, critical: 40, icon: '🥬' },
  { group: 'Vegetables', name: 'Eggplant', min: 55, max: 75, critical: 35, icon: '🍆' },
  { group: 'Vegetables', name: 'Okra', min: 50, max: 70, critical: 30, icon: '🌿' },
  { group: 'Vegetables', name: 'Pumpkin', min: 55, max: 75, critical: 30, icon: '🎃' },
  { group: 'Vegetables', name: 'Zucchini', min: 60, max: 80, critical: 35, icon: '🥒' },
  { group: 'Vegetables', name: 'Leek', min: 55, max: 75, critical: 35, icon: '🌿' },
  { group: 'Vegetables', name: 'Garlic', min: 45, max: 65, critical: 25, icon: '🧄' },
  { group: 'Vegetables', name: 'Celery', min: 65, max: 85, critical: 45, icon: '🌿' },
  { group: 'Vegetables', name: 'Broccoli', min: 60, max: 80, critical: 40, icon: '🥦' },
  { group: 'Vegetables', name: 'Cauliflower', min: 60, max: 80, critical: 40, icon: '🥦' },
  { group: 'Vegetables', name: 'Amaranth', min: 45, max: 70, critical: 25, icon: '🌿' },
  { group: 'Vegetables', name: 'Swiss Chard', min: 60, max: 80, critical: 40, icon: '🥬' },
  { group: 'Fruits', name: 'Banana', min: 60, max: 80, critical: 40, icon: '🍌' },
  { group: 'Fruits', name: 'Mango', min: 45, max: 65, critical: 25, icon: '🥭' },
  { group: 'Fruits', name: 'Watermelon', min: 55, max: 75, critical: 30, icon: '🍉' },
  { group: 'Fruits', name: 'Avocado', min: 50, max: 70, critical: 30, icon: '🥑' },
  { group: 'Fruits', name: 'Papaya', min: 55, max: 75, critical: 35, icon: '🍈' },
  { group: 'Fruits', name: 'Pineapple', min: 50, max: 70, critical: 30, icon: '🍍' },
  { group: 'Fruits', name: 'Passion Fruit', min: 55, max: 75, critical: 35, icon: '🍇' },
  { group: 'Fruits', name: 'Guava', min: 50, max: 70, critical: 28, icon: '🍈' },
  { group: 'Fruits', name: 'Orange', min: 50, max: 70, critical: 30, icon: '🍊' },
  { group: 'Fruits', name: 'Lemon', min: 50, max: 70, critical: 28, icon: '🍋' },
  { group: 'Fruits', name: 'Lime', min: 50, max: 70, critical: 28, icon: '🍋' },
  { group: 'Fruits', name: 'Strawberry', min: 60, max: 80, critical: 40, icon: '🍓' },
  { group: 'Fruits', name: 'Melon', min: 55, max: 75, critical: 30, icon: '🍈' },
  { group: 'Fruits', name: 'Jackfruit', min: 55, max: 75, critical: 35, icon: '🍈' },
  { group: 'Fruits', name: 'Coconut', min: 50, max: 75, critical: 30, icon: '🥥' },
  { group: 'Cash Crops & Industrial', name: 'Cotton', min: 50, max: 70, critical: 25, icon: '🪷' },
  { group: 'Cash Crops & Industrial', name: 'Sugarcane', min: 65, max: 85, critical: 40, icon: '🎋' },
  { group: 'Cash Crops & Industrial', name: 'Sunflower', min: 45, max: 65, critical: 25, icon: '🌻' },
  { group: 'Cash Crops & Industrial', name: 'Coffee', min: 55, max: 75, critical: 35, icon: '☕' },
  { group: 'Cash Crops & Industrial', name: 'Tea', min: 60, max: 80, critical: 40, icon: '🍵' },
  { group: 'Cash Crops & Industrial', name: 'Cocoa', min: 60, max: 80, critical: 40, icon: '🍫' },
  { group: 'Cash Crops & Industrial', name: 'Tobacco', min: 50, max: 70, critical: 30, icon: '🌿' },
  { group: 'Cash Crops & Industrial', name: 'Sisal', min: 30, max: 55, critical: 15, icon: '🌵' },
  { group: 'Cash Crops & Industrial', name: 'Pyrethrum', min: 50, max: 70, critical: 28, icon: '🌼' },
  { group: 'Cash Crops & Industrial', name: 'Vanilla', min: 60, max: 80, critical: 40, icon: '🌿' },
  { group: 'Cash Crops & Industrial', name: 'Hops', min: 55, max: 75, critical: 35, icon: '🌿' },
  { group: 'Oil Crops', name: 'Palm Oil', min: 60, max: 80, critical: 40, icon: '🌴' },
  { group: 'Oil Crops', name: 'Sesame', min: 40, max: 65, critical: 20, icon: '🌿' },
  { group: 'Oil Crops', name: 'Safflower', min: 40, max: 65, critical: 20, icon: '🌼' },
  { group: 'Oil Crops', name: 'Flaxseed', min: 45, max: 65, critical: 22, icon: '🌿' },
  { group: 'Oil Crops', name: 'Canola', min: 45, max: 65, critical: 22, icon: '🌼' },
  { group: 'Spices & Herbs', name: 'Pepper', min: 55, max: 75, critical: 35, icon: '🌶️' },
  { group: 'Spices & Herbs', name: 'Ginger', min: 60, max: 80, critical: 40, icon: '🫚' },
  { group: 'Spices & Herbs', name: 'Turmeric', min: 60, max: 80, critical: 40, icon: '🫚' },
  { group: 'Spices & Herbs', name: 'Coriander', min: 50, max: 70, critical: 30, icon: '🌿' },
  { group: 'Spices & Herbs', name: 'Basil', min: 55, max: 75, critical: 35, icon: '🌿' },
  { group: 'Spices & Herbs', name: 'Mint', min: 60, max: 80, critical: 40, icon: '🌿' },
  { group: 'Spices & Herbs', name: 'Chili', min: 55, max: 75, critical: 35, icon: '🌶️' },
  { group: 'Spices & Herbs', name: 'Cardamom', min: 60, max: 80, critical: 40, icon: '🌿' },
  { group: 'Fodder & Pasture', name: 'Napier Grass', min: 50, max: 75, critical: 28, icon: '🌿' },
  { group: 'Fodder & Pasture', name: 'Alfalfa', min: 55, max: 75, critical: 30, icon: '🌿' },
  { group: 'Fodder & Pasture', name: 'Rhodes Grass', min: 45, max: 70, critical: 25, icon: '🌿' },
  { group: 'Fodder & Pasture', name: 'Desmodium', min: 50, max: 70, critical: 28, icon: '🌿' },
  { group: 'General', name: 'Other', min: 40, max: 70, critical: 20, icon: '🪴' },
];

// Icon map for DB-sourced plants (key → emoji)
const ICON_MAP = {
  maize:'🌽',wheat:'🌾',rice:'🍚',sorghum:'🌾',millet:'🌾',barley:'🌾',oats:'🌾',teff:'🌾',quinoa:'🌾',
  soybean:'🫘',groundnut:'🥜',cowpea:'🫘',pigeon_pea:'🫘',chickpea:'🫘',lentil:'🫘',
  green_bean:'🫘',lima_bean:'🫘',mung_bean:'🫘',fava_bean:'🫘',beans:'🫘',
  potato:'🥔',cassava:'🌱',sweet_potato:'🍠',yam:'🌱',taro:'🌱',
  beetroot:'🫚',carrot:'🥕',turnip:'🌱',radish:'🌱',
  tomato:'🍅',cabbage:'🥬',onion:'🧅',cucumber:'🥒',spinach:'🥬',kale:'🥬',
  lettuce:'🥬',eggplant:'🍆',okra:'🌿',pumpkin:'🎃',zucchini:'🥒',
  leek:'🌿',garlic:'🧄',celery:'🌿',broccoli:'🥦',cauliflower:'🥦',
  amaranth:'🌿',swiss_chard:'🥬',
  banana:'🍌',mango:'🥭',watermelon:'🍉',avocado:'🥑',papaya:'🍈',
  pineapple:'🍍',passion_fruit:'🍇',guava:'🍈',orange:'🍊',lemon:'🍋',
  lime:'🍋',strawberry:'🍓',melon:'🍈',jackfruit:'🍈',coconut:'🥥',
  cotton:'🪷',sugarcane:'🎋',sunflower:'🌻',coffee:'☕',tea:'🍵',
  cocoa:'🍫',tobacco:'🌿',sisal:'🌵',pyrethrum:'🌼',vanilla:'🌿',hops:'🌿',
  palm_oil:'🌴',sesame:'🌿',safflower:'🌼',flaxseed:'🌿',canola:'🌼',
  pepper:'🌶️',ginger:'🫚',turmeric:'🫚',coriander:'🌿',basil:'🌿',
  mint:'🌿',chili:'🌶️',cardamom:'🌿',
  napier_grass:'🌿',alfalfa:'🌿',rhodes_grass:'🌿',desmodium:'🌿',
  general:'🪴',
};

// Map a DB/API plant profile to the shape PlantGrid expects
function apiPlantToCard(p) {
  const critical = Math.round(p.stress_moisture_low);
  const staticMatch = STATIC_PLANTS.find(
    s => s.name.toLowerCase() === p.label.toLowerCase()
  );
  const min = staticMatch ? staticMatch.min : Math.min(critical + 15, 90);
  const max = staticMatch ? staticMatch.max : Math.min(critical + 35, 100);
  return {
    group: staticMatch?.group || 'Custom',
    name: p.label,
    min,
    max,
    critical,
    icon: ICON_MAP[p.key] || '🌱',
    _key: p.key,
  };
}

const SOIL_TYPES = [
  { value: 'Sandy', desc: 'Drains fast, low water retention' },
  { value: 'Clay', desc: 'High retention, slow drainage' },
  { value: 'Silt', desc: 'Moderate retention, fertile' },
  { value: 'Loam', desc: 'Ideal balance of drainage & retention' },
  { value: 'Sandy Loam', desc: 'Good drainage with moderate retention' },
  { value: 'Clay Loam', desc: 'High retention, moderate drainage' },
  { value: 'Peat', desc: 'Very high moisture retention' },
  { value: 'Chalk', desc: 'Alkaline, free-draining' },
];

const INIT = {
  soil_type: '', plant_type: '',
  moisture_min: 40, moisture_max: 70, moisture_critical_low: 20,
  irrigation_duration: 30, notes: '',
  weather_lat: null, weather_lon: null, weather_location_name: '',
};

const PER_GROUP = 8;

function PlantGrid({ plants, selected, onSelect }) {
  const groups = plants.reduce((acc, p) => {
    (acc[p.group] = acc[p.group] || []).push(p);
    return acc;
  }, {});

  const [expanded, setExpanded] = useState({});
  const toggle = (g) => setExpanded((prev) => ({ ...prev, [g]: !prev[g] }));

  return (
    <div className={styles.plantGrid}>
      {Object.entries(groups).map(([group, gp]) => {
        const isExpanded = expanded[group];
        return (
          <div key={group} className={styles.plantGroupWrap}>
            <div className={styles.plantGroup}>
              <span className={styles.plantGroupLabel}>{group}</span>
              {gp.map((p, i) => (
                <button
                  key={p.name} type="button"
                  className={[
                    styles.plantCard,
                    selected === p.name ? styles.plantCardActive : '',
                    i >= PER_GROUP && !isExpanded ? styles.plantCardHidden : '',
                    i >= 4 && !isExpanded ? styles.plantCardMobileHidden : '',
                  ].join(' ')}
                  onClick={() => onSelect(p)}
                >
                  <span className={styles.plantIcon}>{p.icon}</span>
                  <span className={styles.plantName}>{p.name}</span>
                </button>
              ))}
            </div>
            {((gp.length > PER_GROUP) || (gp.length > 4 && gp.length <= PER_GROUP)) && (
              <div className={[
                styles.viewMoreRow,
                gp.length <= PER_GROUP ? styles.viewMoreRowMobileOnly : '',
              ].join(' ')}>
                <button type="button" className={styles.viewMoreBtn} onClick={() => toggle(group)}>
                  {isExpanded
                    ? <><ChevronUp size={13} /> Show less</>
                    : <><ChevronDown size={13} /> {gp.length > PER_GROUP ? gp.length - PER_GROUP : gp.length - 4} more</>}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MoistureBar({ min, max, critical }) {
  return (
    <div className={styles.moistureBar}>
      <div className={styles.moistureTrack}>
        <div className={styles.moistureCritical} style={{ width: `${critical}%` }} title={`Critical below ${critical}%`} />
        <div className={styles.moistureRange} style={{ left: `${min}%`, width: `${max - min}%` }} title={`Optimal ${min}–${max}%`} />
      </div>
      <div className={styles.moistureLabels}>
        {[critical, min, max].map((v) => (
          <span key={v} style={{ left: `${v}%` }} className={styles.moistureMark}>{v}%</span>
        ))}
      </div>
    </div>
  );
}

export default function FarmSettings() {
  const [form, setForm]             = useState(INIT);
  const [plants, setPlants]         = useState(STATIC_PLANTS);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [autoSaved, setAutoSaved]   = useState('');
  const [success, setSuccess]       = useState('');
  const [error, setError]           = useState('');
  const [autoFilled, setAutoFilled] = useState(false);
  const [locSaving, setLocSaving]   = useState(false);
  const [locMsg, setLocMsg]         = useState('');
  const [locError, setLocError]     = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const timer                       = useRef(null);

  const fetchSettings = useCallback(async () => {
    try { const { data } = await api.get('/farm-settings/'); setForm((p) => ({ ...p, ...data })); }
    catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  // Fetch plant profiles from API; fall back to static list on error
  const fetchPlants = useCallback(async () => {
    try {
      const { data } = await api.get('/plant-profiles/');
      if (data?.length) setPlants(data.map(apiPlantToCard));
    } catch { /* keep STATIC_PLANTS */ }
  }, []);

  useEffect(() => { fetchSettings(); fetchPlants(); }, [fetchSettings, fetchPlants]);

  const autoSave = useCallback(async (f) => {
    setAutoSaving(true); setAutoSaved('');
    try { await api.post('/farm-settings/', f); setAutoSaved('Saved'); setTimeout(() => setAutoSaved(''), 2500); }
    catch { /* silent */ }
    finally { setAutoSaving(false); }
  }, []);

  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated); setSuccess(''); setError(''); setAutoFilled(false);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => autoSave(updated), 800);
  };

  const handlePlantSelect = (p) => {
    const updated = { ...form, plant_type: p.name, moisture_min: p.min, moisture_max: p.max, moisture_critical_low: p.critical };
    setForm(updated); setAutoFilled(true); setSuccess(''); setError('');
    autoSave(updated);
  };

  const handleSoilSelect = (v) => {
    const updated = { ...form, soil_type: v };
    setForm(updated); setSuccess(''); setError('');
    autoSave(updated);
  };

  const saveLocation = useCallback(async (lat, lon, name) => {
    setLocSaving(true); setLocMsg(''); setLocError('');
    try {
      await api.post('/farm-settings/', { weather_lat: lat, weather_lon: lon, weather_location_name: name });
      setForm((p) => ({ ...p, weather_lat: lat, weather_lon: lon, weather_location_name: name }));
      localStorage.removeItem('ef_coords');
      setLocMsg('Location saved. Weather will now use this location.');
      setTimeout(() => setLocMsg(''), 4000);
    } catch { setLocError('Failed to save location.'); }
    finally { setLocSaving(false); }
  }, []);

  const handleUseGPS = () => {
    setGpsLoading(true); setLocError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords: gc }) => { setGpsLoading(false); saveLocation(gc.latitude, gc.longitude, ''); },
      () => { setGpsLoading(false); setLocError('GPS access denied. Allow location in your browser settings.'); }
    );
  };

  const handleClearLocation = async () => {
    setLocSaving(true); setLocMsg(''); setLocError('');
    try {
      await api.post('/farm-settings/', { weather_lat: null, weather_lon: null, weather_location_name: '' });
      setForm((p) => ({ ...p, weather_lat: null, weather_lon: null, weather_location_name: '' }));
      setLocMsg('Location cleared.'); setTimeout(() => setLocMsg(''), 3000);
    } catch { setLocError('Failed to clear location.'); }
    finally { setLocSaving(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError(''); setSuccess('');
    try {
      await api.post('/farm-settings/', form);
      setSuccess('Farm settings saved successfully.'); setAutoFilled(false);
    } catch (err) {
      const d = err.response?.data;
      setError(typeof d === 'string' ? d : d?.detail || Object.values(d ?? {})[0] || 'Failed to save settings.');
    } finally { setSaving(false); }
  };

  const selectedPlant = plants.find((p) => p.name === form.plant_type);
  const selectedSoil  = SOIL_TYPES.find((s) => s.value === form.soil_type);

  return (
    <DashboardLayout>
      <div className={styles.page}>

        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Farm Settings</h1>
            <p className={styles.pageSubtitle}>Configure soil type, plant selection, and moisture thresholds</p>
          </div>
          <div className={styles.autoSaveStatus}>
            {autoSaving && <span className={styles.autoSaving}><Save size={13} className={styles.spinnerIcon} /> Saving…</span>}
            {autoSaved && !autoSaving && <span className={styles.autoSaved}><CheckCircle2 size={13} /> {autoSaved}</span>}
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingBox}><span className={styles.bigSpinner} /></div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.layout}>

              {/* Soil + Plant first, then the rest */}
              <div className={styles.col}>

                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>🪨 Soil Type</h2>
                  <div className={styles.soilGrid}>
                    {SOIL_TYPES.map((s) => (
                      <button key={s.value} type="button"
                        className={`${styles.soilCard} ${form.soil_type === s.value ? styles.soilCardActive : ''}`}
                        onClick={() => handleSoilSelect(s.value)}
                      >
                        <span className={styles.soilName}>{s.value}</span>
                        <span className={styles.soilDesc}>{s.desc}</span>
                      </button>
                    ))}
                  </div>
                  {selectedSoil && (
                    <div className={styles.selectedNote}>
                      ✅ Selected: <strong>{selectedSoil.value}</strong> — {selectedSoil.desc}
                    </div>
                  )}
                </div>

                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>⏱️ Irrigation Duration</h2>
                  <div className={styles.durationRow}>
                    <input type="range" name="irrigation_duration" min="5" max="120" step="5"
                      value={form.irrigation_duration} onChange={handleChange} className={styles.slider} />
                    <span className={styles.durationValue}>{form.irrigation_duration} min</span>
                  </div>
                  <p className={styles.fieldHint}>Duration of each automatic irrigation cycle</p>
                </div>

                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    <NotebookPen size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />Notes
                  </h2>
                  <textarea name="notes" className={styles.textarea} rows={3}
                    placeholder="Any additional notes about your farm or crops…"
                    value={form.notes} onChange={handleChange} />
                </div>
              </div>

              {/* Right col */}
              <div className={styles.col}>

                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>🪴 Plant Type</h2>
                    {autoFilled && <span className={styles.autoFilledBadge}>✨ Thresholds auto-filled</span>}
                  </div>
                  <PlantGrid plants={plants} selected={form.plant_type} onSelect={handlePlantSelect} />
                </div>

                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>💧 Moisture Thresholds</h2>
                  {selectedPlant && (
                    <div className={styles.plantInfo}>
                      <span className={styles.plantInfoIcon}>{selectedPlant.icon}</span>
                      <div>
                        <span className={styles.plantInfoName}>{selectedPlant.name}</span>
                        <span className={styles.plantInfoRange}>
                          Optimal: {selectedPlant.min}–{selectedPlant.max}% · Critical below {selectedPlant.critical}%
                        </span>
                      </div>
                    </div>
                  )}
                  <MoistureBar
                    min={Number(form.moisture_min)}
                    max={Number(form.moisture_max)}
                    critical={Number(form.moisture_critical_low)}
                  />
                  <div className={styles.thresholdGrid}>
                    {[
                      { name: 'moisture_critical_low', label: 'Critical Low (%)',  color: '#ef4444', val: form.moisture_critical_low },
                      { name: 'moisture_min',          label: 'Optimal Min (%)',   color: '#22c55e', val: form.moisture_min },
                      { name: 'moisture_max',          label: 'Optimal Max (%)',   color: '#16a34a', val: form.moisture_max },
                    ].map((f) => (
                      <div key={f.name} className={styles.thresholdField}>
                        <label className={styles.label}>
                          <span className={styles.labelDot} style={{ background: f.color }} />
                          {f.label}
                        </label>
                        <input type="number" name={f.name} min="0" max="100" step="1"
                          className={styles.numInput} value={f.val} onChange={handleChange} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className={styles.section} style={{ marginTop: '1.5rem' }}>
              <h2 className={styles.sectionTitle}>📍 My Weather Location</h2>
              <p className={styles.fieldHint} style={{ marginBottom: '0.85rem' }}>
                Set your farm's location for accurate local weather and irrigation planning.
                {form.weather_lat != null
                  ? ' Your location is currently set — weather data comes from this place.'
                  : ' No location set — you will be asked for GPS on the dashboard, or your admin can set it for you.'}
              </p>
              {form.weather_lat != null && (
                <div className={styles.locBanner}>
                  <MapPin size={14} color="#2d7a4f" />
                  <span>
                    {form.weather_location_name || `${parseFloat(form.weather_lat).toFixed(4)}, ${parseFloat(form.weather_lon).toFixed(4)}`}
                  </span>
                  <button type="button" className={styles.locClearBtn} onClick={handleClearLocation} disabled={locSaving}>
                    <X size={12} /> Clear
                  </button>
                </div>
              )}
              <div className={styles.locActions}>
                <button type="button" className={styles.locGpsBtn} onClick={handleUseGPS} disabled={gpsLoading || locSaving}>
                  <Navigation size={14} />
                  {gpsLoading ? 'Getting GPS…' : 'Use My GPS'}
                </button>
                <span className={styles.locOr}>or</span>
                <span className={styles.locHint}>ask your admin to set it from the Admin panel</span>
              </div>
              {locMsg   && <p className={styles.locSuccess}><CheckCircle2 size={13} /> {locMsg}</p>}
              {locError && <p className={styles.locError}>{locError}</p>}
            </div>

            <div className={styles.footer}>
              {success && <div className={styles.successBanner}>✅ {success}</div>}
              {error   && <div className={styles.errorBanner}>⚠️ {error}</div>}
              <div className={styles.footerActions}>
                <button type="button" className={styles.resetBtn} disabled={saving}
                  onClick={() => { setForm(INIT); setSuccess(''); setError(''); setAutoFilled(false); }}>
                  Reset
                </button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? <span className={styles.spinner} /> : '💾 Save Settings'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}