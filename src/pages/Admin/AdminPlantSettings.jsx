import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import {
  Leaf, Plus, Trash2, Edit3, Save, X, RefreshCw,
  ChevronLeft, ToggleLeft, ToggleRight, AlertTriangle, Database,
} from 'lucide-react';
import styles from './Admin.module.css';
import sStyles from './AdminSettings.module.css';
import pStyles from './AdminPlantSettings.module.css';

const SEASON_KEYS = [
  { key: 'long_rains',  label: 'Long Rains' },
  { key: 'cool_dry',    label: 'Cool & Dry' },
  { key: 'short_rains', label: 'Short Rains' },
  { key: 'hot_dry',     label: 'Hot & Dry' },
  { key: 'transition',  label: 'Transition' },
];

const DEFAULT_FORM = {
  key: '', label: '',
  water_demand_l_day: 5.5,
  stress_temp_high: 32,
  stress_moisture_low: 30,
  root_depth_factor: 1.0,
  is_active: true,
  season_adjust: { long_rains: 0.4, cool_dry: 0.85, short_rains: 0.5, hot_dry: 1.3, transition: 1.0 },
};

// Icon map matching FarmSettings
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

// Group map matching FarmSettings categories
const GROUP_MAP = {
  maize:'Cereals & Grains',wheat:'Cereals & Grains',rice:'Cereals & Grains',
  sorghum:'Cereals & Grains',millet:'Cereals & Grains',barley:'Cereals & Grains',
  oats:'Cereals & Grains',teff:'Cereals & Grains',quinoa:'Cereals & Grains',
  soybean:'Legumes & Pulses',groundnut:'Legumes & Pulses',cowpea:'Legumes & Pulses',
  pigeon_pea:'Legumes & Pulses',chickpea:'Legumes & Pulses',lentil:'Legumes & Pulses',
  green_bean:'Legumes & Pulses',lima_bean:'Legumes & Pulses',mung_bean:'Legumes & Pulses',
  fava_bean:'Legumes & Pulses',beans:'Legumes & Pulses',
  potato:'Root & Tuber Crops',cassava:'Root & Tuber Crops',sweet_potato:'Root & Tuber Crops',
  yam:'Root & Tuber Crops',taro:'Root & Tuber Crops',beetroot:'Root & Tuber Crops',
  carrot:'Root & Tuber Crops',turnip:'Root & Tuber Crops',radish:'Root & Tuber Crops',
  tomato:'Vegetables',cabbage:'Vegetables',onion:'Vegetables',cucumber:'Vegetables',
  spinach:'Vegetables',kale:'Vegetables',lettuce:'Vegetables',eggplant:'Vegetables',
  okra:'Vegetables',pumpkin:'Vegetables',zucchini:'Vegetables',leek:'Vegetables',
  garlic:'Vegetables',celery:'Vegetables',broccoli:'Vegetables',cauliflower:'Vegetables',
  amaranth:'Vegetables',swiss_chard:'Vegetables',
  banana:'Fruits',mango:'Fruits',watermelon:'Fruits',avocado:'Fruits',papaya:'Fruits',
  pineapple:'Fruits',passion_fruit:'Fruits',guava:'Fruits',orange:'Fruits',
  lemon:'Fruits',lime:'Fruits',strawberry:'Fruits',melon:'Fruits',
  jackfruit:'Fruits',coconut:'Fruits',
  cotton:'Cash Crops & Industrial',sugarcane:'Cash Crops & Industrial',
  sunflower:'Cash Crops & Industrial',coffee:'Cash Crops & Industrial',
  tea:'Cash Crops & Industrial',cocoa:'Cash Crops & Industrial',
  tobacco:'Cash Crops & Industrial',sisal:'Cash Crops & Industrial',
  pyrethrum:'Cash Crops & Industrial',vanilla:'Cash Crops & Industrial',
  hops:'Cash Crops & Industrial',
  palm_oil:'Oil Crops',sesame:'Oil Crops',safflower:'Oil Crops',
  flaxseed:'Oil Crops',canola:'Oil Crops',
  pepper:'Spices & Herbs',ginger:'Spices & Herbs',turmeric:'Spices & Herbs',
  coriander:'Spices & Herbs',basil:'Spices & Herbs',mint:'Spices & Herbs',
  chili:'Spices & Herbs',cardamom:'Spices & Herbs',
  napier_grass:'Fodder & Pasture',alfalfa:'Fodder & Pasture',
  rhodes_grass:'Fodder & Pasture',desmodium:'Fodder & Pasture',
  general:'General',
};

function DeleteModal({ plant, onConfirm, onCancel }) {
  return (
    <div className={styles.backdrop}>
      <div className={sStyles.confirmModal}>
        <div className={sStyles.confirmHeader}>
          <AlertTriangle size={20} color="#ef4444" />
          <span>Delete Plant Profile</span>
        </div>
        <p className={sStyles.confirmMsg}>
          Delete <strong>{plant.label}</strong>? This cannot be undone. Users who have this plant selected will fall back to the General Crop profile.
        </p>
        <div className={styles.modalActions}>
          <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button className={sStyles.confirmBtn} style={{ background: '#ef4444' }} onClick={onConfirm}>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function PlantFormModal({ initial, onSave, onCancel, saving, title }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setSeason = (k, v) => setForm(p => ({ ...p, season_adjust: { ...p.season_adjust, [k]: parseFloat(v) || 0 } }));

  return (
    <div className={pStyles.modalBackdrop} onClick={onCancel}>
      <div className={pStyles.modalBox} onClick={e => e.stopPropagation()}>
        <div className={pStyles.modalHeader}>
          <span className={pStyles.modalTitle}>{title}</span>
          <button className={pStyles.modalClose} onClick={onCancel}><X size={18} /></button>
        </div>
        <div className={pStyles.modalBody}>
          <div className={pStyles.formGrid}>
            <div className={sStyles.field}>
              <label>Plant Key *</label>
              <input
                className={sStyles.input}
                value={form.key}
                onChange={e => set('key', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                placeholder="e.g. tomato"
                disabled={!!initial.id || initial.source === 'builtin'}
              />
              <span className={pStyles.hint}>Lowercase, underscores only. Cannot change after creation.</span>
            </div>
            <div className={sStyles.field}>
              <label>Display Name *</label>
              <input className={sStyles.input} value={form.label}
                onChange={e => set('label', e.target.value)} placeholder="e.g. Tomato" />
            </div>
            <div className={sStyles.field}>
              <label>Water Demand (L/day per 10m²)</label>
              <input className={sStyles.input} type="number" step="0.1" min="0"
                value={form.water_demand_l_day} onChange={e => set('water_demand_l_day', e.target.value)} />
            </div>
            <div className={sStyles.field}>
              <label>Stress Temp High (°C)</label>
              <input className={sStyles.input} type="number" step="0.5" min="0"
                value={form.stress_temp_high} onChange={e => set('stress_temp_high', e.target.value)} />
            </div>
            <div className={sStyles.field}>
              <label>Stress Moisture Low (%)</label>
              <input className={sStyles.input} type="number" step="1" min="0" max="100"
                value={form.stress_moisture_low} onChange={e => set('stress_moisture_low', e.target.value)} />
            </div>
            <div className={sStyles.field}>
              <label>Root Depth Factor</label>
              <input className={sStyles.input} type="number" step="0.05" min="0.5" max="2"
                value={form.root_depth_factor} onChange={e => set('root_depth_factor', e.target.value)} />
              <span className={pStyles.hint}>{'<1 = shallow (less frequent), >1 = deep (more frequent)'}</span>
            </div>
          </div>

          <div className={pStyles.seasonSection}>
            <p className={pStyles.seasonTitle}>Season Irrigation Multipliers</p>
            <div className={pStyles.seasonGrid}>
              {SEASON_KEYS.map(({ key, label }) => (
                <div key={key} className={sStyles.field}>
                  <label>{label}</label>
                  <input className={sStyles.input} type="number" step="0.05" min="0" max="3"
                    value={form.season_adjust[key] ?? 1.0}
                    onChange={e => setSeason(key, e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          <label className={pStyles.activeToggle}>
            <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} />
            <span>Visible to users</span>
          </label>
        </div>

        <div className={pStyles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onCancel}><X size={13} /> Cancel</button>
          <button className={sStyles.saveBtn} onClick={() => onSave(form)} disabled={saving}>
            {saving ? <><RefreshCw size={13} className={styles.spinning} /> Saving…</> : <><Save size={13} /> Save Plant</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPlantSettings() {
  const navigate = useNavigate();
  const [plants, setPlants]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [toast, setToast]               = useState('');
  const [error, setError]               = useState('');
  const [showAdd, setShowAdd]           = useState(false);
  const [editPlant, setEditPlant]       = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch]             = useState('');
  const [activeGroup, setActiveGroup]   = useState('All');
  const [seeding, setSeeding]           = useState(false);
  const [seedProgress, setSeedProgress] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // Fetch from the merged endpoint — same data users see
  const fetchPlants = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const { data } = await api.get('/plant-profiles/');
      setPlants(data);
    } catch { setError('Failed to load plant profiles.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPlants(); }, [fetchPlants]);

  // Save to DB: look up current id by key in case it was just created this session
  const saveToDb = async (form) => {
    // Check live plants state for an existing DB record with this key
    const existing = plants.find(p => p.key === form.key && p.id);
    const id = form.id || existing?.id;
    if (id) {
      const { data } = await api.patch(`/users/admin/plant-profiles/${id}/`, form);
      return data;
    }
    // Not in DB yet — create override
    const { data } = await api.post('/users/admin/plant-profiles/', { ...form, is_builtin: true });
    return data;
  };

  const handleAdd = async (form) => {
    setSaving(true);
    try {
      const { data } = await api.post('/users/admin/plant-profiles/', form);
      // Refresh to get merged list
      await fetchPlants();
      setShowAdd(false);
      showToast(`"${data.label}" added.`);
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to add plant.');
    } finally { setSaving(false); }
  };

  const handleEdit = async (form) => {
    setSaving(true);
    try {
      await saveToDb(form);
      await fetchPlants();
      setEditPlant(null);
      showToast(`"${form.label}" updated.`);
    } catch { showToast('Failed to update plant.'); }
    finally { setSaving(false); }
  };

  const handleToggleActive = async (plant) => {
    try {
      await saveToDb({ ...plant, is_active: !plant.is_active });
      await fetchPlants();
      showToast(`"${plant.label}" ${!plant.is_active ? 'enabled' : 'disabled'}.`);
    } catch { showToast('Failed to update.'); }
  };

  const handleDelete = async () => {
    try {
      if (deleteTarget.id) {
        await api.delete(`/users/admin/plant-profiles/${deleteTarget.id}/`);
      }
      await fetchPlants();
      setDeleteTarget(null);
      showToast('Plant profile deleted.');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to delete.');
      setDeleteTarget(null);
    }
  };

  // Seed all built-in plants (source: 'builtin', id: null) into DB in one bulk request
  const handleSeedAll = async () => {
    const unsaved = plants.filter(p => !p.id);
    if (!unsaved.length) return;
    setSeeding(true);
    setSeedProgress(`Saving ${unsaved.length} plants…`);
    try {
      const payload = unsaved.map(p => ({ ...p, is_builtin: true }));
      const { data } = await api.post('/users/admin/plant-profiles/', payload);
      await fetchPlants();
      showToast(`${data.created} plant${data.created !== 1 ? 's' : ''} saved to database.`);
    } catch {
      showToast('Failed to seed plants. Try again.');
    } finally {
      setSeedProgress('');
      setSeeding(false);
    }
  };

  // How many are not yet in DB
  const unsavedCount = plants.filter(p => !p.id).length;

  // Derive groups from the plant list
  const groups = ['All', ...Array.from(new Set(plants.map(p => GROUP_MAP[p.key] || 'Custom'))).sort()];

  const filtered = plants.filter(p => {
    const group = GROUP_MAP[p.key] || 'Custom';
    const matchGroup = activeGroup === 'All' || group === activeGroup;
    const matchSearch = !search ||
      p.label.toLowerCase().includes(search.toLowerCase()) ||
      p.key.toLowerCase().includes(search.toLowerCase());
    return matchGroup && matchSearch;
  });

  return (
    <DashboardLayout>
      <div className={styles.page}>

        <div className={styles.header}>
          <div>
            <button className={pStyles.backBtn} onClick={() => navigate('/admin/settings')}>
              <ChevronLeft size={15} /> Back to Settings
            </button>
            <h1 className={styles.title}>Plant Settings</h1>
            <p className={styles.subtitle}>Manage plant profiles visible to users — edit thresholds, enable or disable</p>
          </div>
          <div className={pStyles.headerActions}>
            <button className={styles.refreshBtn} onClick={fetchPlants} disabled={loading}>
              <RefreshCw size={14} className={loading ? styles.spinning : ''} /> Refresh
            </button>
            {unsavedCount > 0 ? (
              <button className={pStyles.seedBtn} onClick={handleSeedAll} disabled={seeding}>
                {seeding
                  ? <><RefreshCw size={13} className={styles.spinning} /> {seedProgress}</>
                  : <><Database size={13} /> Save All to DB ({unsavedCount})</>}
              </button>
            ) : (
              <button className={pStyles.seedBtn} style={{ background: '#16a34a' }} disabled>
                <Database size={13} /> All in database
              </button>
            )}
            <button className={sStyles.addBtn} onClick={() => { setShowAdd(v => !v); setEditPlant(null); }}>
              {showAdd ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Add Plant</>}
            </button>
          </div>
        </div>

        {error && <div className={sStyles.stateBox} style={{ color: '#ef4444' }}>{error}</div>}

        <div className={sStyles.section}>
          {/* Header row: count + search */}
          <div className={sStyles.sectionHeader}>
            <div className={sStyles.sectionTitle} style={{ padding: 0, borderBottom: 'none' }}>
              <Leaf size={15} /> Plant Profiles ({plants.length})
            </div>
            <input
              className={pStyles.searchInput}
              placeholder="Search plants…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Group filter tabs */}
          <div className={pStyles.groupTabs}>
            {groups.map(g => (
              <button
                key={g}
                className={`${pStyles.groupTab} ${activeGroup === g ? pStyles.groupTabActive : ''}`}
                onClick={() => setActiveGroup(g)}
              >
                {g}
              </button>
            ))}
          </div>

          {loading ? (
            <div className={sStyles.stateBox}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div className={sStyles.stateBox}>
              {search ? 'No plants match your search.' : 'No plants in this category.'}
            </div>
          ) : (
            <div className={pStyles.plantList}>
              {filtered.map(plant => (
                <div key={plant.key} className={`${pStyles.plantRow} ${plant.is_active === false ? pStyles.plantRowInactive : ''}`}>
                  <div className={pStyles.plantIcon}>
                    <span style={{ fontSize: 18 }}>{ICON_MAP[plant.key] || '🌱'}</span>
                  </div>
                  <div className={pStyles.plantInfo}>
                    <span className={pStyles.plantLabel}>{plant.label}</span>
                    <span className={pStyles.plantKey}>{plant.key}</span>
                    <span className={pStyles.plantGroup}>{GROUP_MAP[plant.key] || 'Custom'}</span>
                    {plant.is_active === false && (
                      <span className={pStyles.disabledBadge}>Hidden from users</span>
                    )}
                  </div>
                  <div className={pStyles.plantStats}>
                    <span className={pStyles.stat} title="Water demand L/day">💧 {plant.water_demand_l_day} L/day</span>
                    <span className={pStyles.stat} title="Stress temp">🌡 {plant.stress_temp_high}°C</span>
                    <span className={pStyles.stat} title="Min moisture">🌱 {plant.stress_moisture_low}%</span>
                  </div>
                  <div className={pStyles.plantActions}>
                    <button
                      className={pStyles.toggleBtn}
                      title={plant.is_active !== false ? 'Disable (hide from users)' : 'Enable (show to users)'}
                      onClick={() => handleToggleActive(plant)}
                    >
                      {plant.is_active !== false
                        ? <ToggleRight size={22} color="#2d7a4f" />
                        : <ToggleLeft size={22} color="#9ca3af" />}
                    </button>
                    <button className={styles.iconBtn} title="Edit"
                      onClick={() => setEditPlant({ ...plant })}>
                      <Edit3 size={14} color="#6366f1" />
                    </button>
                    {plant.source !== 'builtin' && !plant.is_builtin && (
                      <button className={styles.iconBtn} title="Delete"
                        onClick={() => setDeleteTarget(plant)}>
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editPlant && (
        <PlantFormModal
          initial={editPlant}
          title={`Edit — ${editPlant.label}`}
          onSave={handleEdit}
          onCancel={() => setEditPlant(null)}
          saving={saving}
        />
      )}

      {/* Add modal */}
      {showAdd && (
        <PlantFormModal
          initial={DEFAULT_FORM}
          title="Add New Plant"
          onSave={handleAdd}
          onCancel={() => setShowAdd(false)}
          saving={saving}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          plant={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </DashboardLayout>
  );
}
