import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, CheckCircle, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import styles from './ConnectDevice.module.css';

const CROP_TYPES = ['Maize', 'Wheat', 'Rice', 'Soybean', 'Tomato', 'Potato', 'Cotton', 'Sugarcane', 'Other'];
const SOIL_TYPES = ['Sandy', 'Clay', 'Silt', 'Loam', 'Sandy Loam', 'Clay Loam', 'Peat', 'Chalk'];

const INIT = { device_id: '', secret_key: '', device_name: '', crop_type: '', soil_type: '' };

export default function ConnectDevice() {
  const navigate = useNavigate();
  const [form, setForm]       = useState(INIT);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/device/connect/', form);
      setSuccess(true);
      setTimeout(() => navigate('/devices'), 1800);
    } catch (err) {
      const data = err.response?.data;
      setError(
        typeof data === 'string'
          ? data
          : data?.detail || data?.message || Object.values(data ?? {})[0] || 'Failed to connect device.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Connect Device</h1>
          <p className={styles.subtitle}>Link a hardware device to your account</p>
        </div>

        <div className={styles.card}>
          {success && (
            <div className={styles.successBanner}>
              <CheckCircle size={16} /> Device connected successfully! Redirecting…
            </div>
          )}
          {error && <div className={styles.errorBanner}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="device_id">Device ID</label>
                <input
                  id="device_id"
                  name="device_id"
                  className={styles.input}
                  placeholder="e.g. DEV-001"
                  value={form.device_id}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="secret_key">Device Secret Key</label>
                <input
                  id="secret_key"
                  name="secret_key"
                  type="password"
                  className={styles.input}
                  placeholder="••••••••••••"
                  value={form.secret_key}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label className={styles.label} htmlFor="device_name">Device Name</label>
                <input
                  id="device_name"
                  name="device_name"
                  className={styles.input}
                  placeholder="e.g. North Field Sensor"
                  value={form.device_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="crop_type">Crop Type</label>
                <select
                  id="crop_type"
                  name="crop_type"
                  className={styles.input}
                  value={form.crop_type}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select crop…</option>
                  {CROP_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="soil_type">Soil Type</label>
                <select
                  id="soil_type"
                  name="soil_type"
                  className={styles.input}
                  value={form.soil_type}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select soil…</option>
                  {SOIL_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.footer}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => navigate('/devices')}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className={styles.submitBtn} disabled={loading || success}>
                {loading ? <RefreshCw size={15} className={styles.spinner} /> : <><Link2 size={15} /> Connect Device</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
