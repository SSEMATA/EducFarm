import { useEffect, useState, useCallback } from 'react';
import { NotebookPen } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import styles from './FarmSettings.module.css';

// Each plant carries its recommended moisture range and critical low threshold
const PLANTS = [
  { name: 'Maize',       min: 50, max: 75, critical: 30, icon: '🌽' },
  { name: 'Wheat',       min: 45, max: 70, critical: 25, icon: '🌾' },
  { name: 'Rice',        min: 70, max: 90, critical: 50, icon: '🍚' },
  { name: 'Soybean',     min: 50, max: 75, critical: 30, icon: '🫘' },
  { name: 'Tomato',      min: 60, max: 80, critical: 40, icon: '🍅' },
  { name: 'Potato',      min: 65, max: 85, critical: 40, icon: '🥔' },
  { name: 'Cotton',      min: 50, max: 70, critical: 25, icon: '🪷' },
  { name: 'Sugarcane',   min: 65, max: 85, critical: 40, icon: '🎋' },
  { name: 'Sunflower',   min: 45, max: 65, critical: 25, icon: '🌻' },
  { name: 'Groundnut',   min: 50, max: 70, critical: 30, icon: '🥜' },
  { name: 'Cassava',     min: 40, max: 65, critical: 20, icon: '🌱' },
  { name: 'Banana',      min: 60, max: 80, critical: 40, icon: '🍌' },
  { name: 'Mango',       min: 45, max: 65, critical: 25, icon: '🥭' },
  { name: 'Cabbage',     min: 60, max: 80, critical: 40, icon: '🥬' },
  { name: 'Onion',       min: 50, max: 70, critical: 30, icon: '🧅' },
  { name: 'Pepper',      min: 55, max: 75, critical: 35, icon: '🌶️' },
  { name: 'Cucumber',    min: 65, max: 85, critical: 45, icon: '🥒' },
  { name: 'Watermelon',  min: 55, max: 75, critical: 30, icon: '🍉' },
  { name: 'Other',       min: 40, max: 70, critical: 20, icon: '🪴' },
];

const SOIL_TYPES = [
  { value: 'Sandy',      desc: 'Drains fast, low water retention' },
  { value: 'Clay',       desc: 'High retention, slow drainage' },
  { value: 'Silt',       desc: 'Moderate retention, fertile' },
  { value: 'Loam',       desc: 'Ideal balance of drainage & retention' },
  { value: 'Sandy Loam', desc: 'Good drainage with moderate retention' },
  { value: 'Clay Loam',  desc: 'High retention, moderate drainage' },
  { value: 'Peat',       desc: 'Very high moisture retention' },
  { value: 'Chalk',      desc: 'Alkaline, free-draining' },
];

const INIT = {
  soil_type: '', plant_type: '',
  moisture_min: 40, moisture_max: 70, moisture_critical_low: 20,
  irrigation_duration: 30, notes: '',
};

function MoistureBar({ min, max, critical }) {
  return (
    <div className={styles.moistureBar}>
      <div className={styles.moistureTrack}>
        <div
          className={styles.moistureCritical}
          style={{ width: `${critical}%` }}
          title={`Critical below ${critical}%`}
        />
        <div
          className={styles.moistureRange}
          style={{ left: `${min}%`, width: `${max - min}%` }}
          title={`Optimal ${min}–${max}%`}
        />
      </div>
      <div className={styles.moistureLabels}>
        <span style={{ left: `${critical}%` }} className={styles.moistureMark}>
          {critical}%
        </span>
        <span style={{ left: `${min}%` }} className={styles.moistureMark}>
          {min}%
        </span>
        <span style={{ left: `${max}%` }} className={styles.moistureMark}>
          {max}%
        </span>
      </div>
    </div>
  );
}

export default function FarmSettings() {
  const [form, setForm]           = useState(INIT);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [success, setSuccess]     = useState('');
  const [error, setError]         = useState('');
  const [autoFilled, setAutoFilled] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await api.get('/farm-settings/');
      setForm((p) => ({ ...p, ...data }));
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setSuccess(''); setError(''); setAutoFilled(false);
  };

  const handlePlantSelect = (plant) => {
    setForm((p) => ({
      ...p,
      plant_type:            plant.name,
      moisture_min:          plant.min,
      moisture_max:          plant.max,
      moisture_critical_low: plant.critical,
    }));
    setAutoFilled(true);
    setSuccess(''); setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      await api.post('/farm-settings/', form);
      setSuccess('Farm settings saved successfully.');
      setAutoFilled(false);
    } catch (err) {
      const d = err.response?.data;
      setError(typeof d === 'string' ? d : d?.detail || Object.values(d ?? {})[0] || 'Failed to save settings.');
    } finally { setSaving(false); }
  };

  const selectedPlant = PLANTS.find((p) => p.name === form.plant_type);
  const selectedSoil  = SOIL_TYPES.find((s) => s.value === form.soil_type);

  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/* ── Header ───────────────────────────────────── */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Farm Settings</h1>
            <p className={styles.pageSubtitle}>Configure soil type, plant selection, and moisture thresholds</p>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingBox}><span className={styles.bigSpinner} /></div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.layout}>

              {/* ── Left col ─────────────────────────────── */}
              <div className={styles.col}>

                {/* Soil type */}
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>🪨 Soil Type</h2>
                  <div className={styles.soilGrid}>
                    {SOIL_TYPES.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        className={`${styles.soilCard} ${form.soil_type === s.value ? styles.soilCardActive : ''}`}
                        onClick={() => { setForm((p) => ({ ...p, soil_type: s.value })); setSuccess(''); setError(''); }}
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

                {/* Irrigation duration */}
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>⏱️ Irrigation Duration</h2>
                  <div className={styles.durationRow}>
                    <input
                      type="range"
                      name="irrigation_duration"
                      min="5" max="120" step="5"
                      value={form.irrigation_duration}
                      onChange={handleChange}
                      className={styles.slider}
                    />
                    <span className={styles.durationValue}>{form.irrigation_duration} min</span>
                  </div>
                  <p className={styles.fieldHint}>Duration of each automatic irrigation cycle</p>
                </div>

                {/* Notes */}
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}><NotebookPen size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />Notes</h2>
                  <textarea
                    name="notes"
                    className={styles.textarea}
                    placeholder="Any additional notes about your farm or crops…"
                    value={form.notes}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </div>

              {/* ── Right col ────────────────────────────── */}
              <div className={styles.col}>

                {/* Plant type */}
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>🪴 Plant Type</h2>
                    {autoFilled && (
                      <span className={styles.autoFilledBadge}>✨ Thresholds auto-filled</span>
                    )}
                  </div>
                  <div className={styles.plantGrid}>
                    {PLANTS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        className={`${styles.plantCard} ${form.plant_type === p.name ? styles.plantCardActive : ''}`}
                        onClick={() => handlePlantSelect(p)}
                      >
                        <span className={styles.plantIcon}>{p.icon}</span>
                        <span className={styles.plantName}>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Moisture thresholds */}
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
                    <div className={styles.thresholdField}>
                      <label className={styles.label}>
                        <span className={styles.labelDot} style={{ background: '#ef4444' }} />
                        Critical Low (%)
                      </label>
                      <input
                        type="number" name="moisture_critical_low"
                        min="0" max="100" step="1"
                        className={styles.numInput}
                        value={form.moisture_critical_low}
                        onChange={handleChange}
                      />
                    </div>
                    <div className={styles.thresholdField}>
                      <label className={styles.label}>
                        <span className={styles.labelDot} style={{ background: '#22c55e' }} />
                        Optimal Min (%)
                      </label>
                      <input
                        type="number" name="moisture_min"
                        min="0" max="100" step="1"
                        className={styles.numInput}
                        value={form.moisture_min}
                        onChange={handleChange}
                      />
                    </div>
                    <div className={styles.thresholdField}>
                      <label className={styles.label}>
                        <span className={styles.labelDot} style={{ background: '#16a34a' }} />
                        Optimal Max (%)
                      </label>
                      <input
                        type="number" name="moisture_max"
                        min="0" max="100" step="1"
                        className={styles.numInput}
                        value={form.moisture_max}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Footer ───────────────────────────────────── */}
            <div className={styles.footer}>
              {success && <div className={styles.successBanner}>✅ {success}</div>}
              {error   && <div className={styles.errorBanner}>⚠️ {error}</div>}
              <div className={styles.footerActions}>
                <button type="button" className={styles.resetBtn}
                  onClick={() => { setForm(INIT); setSuccess(''); setError(''); setAutoFilled(false); }}
                  disabled={saving}>
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
