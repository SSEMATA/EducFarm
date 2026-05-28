import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, CheckCircle, RefreshCw, CircuitBoard } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import styles from './ConnectDevice.module.css';

export default function ConnectDevice() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ device_id: '', pairing_code: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [paired, setPaired]   = useState(null); // holds the paired device data

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: name === 'pairing_code' ? value.toUpperCase() : value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/device/pair/', {
        device_id:    form.device_id.trim(),
        pairing_code: form.pairing_code.trim(),
      });
      setPaired(data.device);
    } catch (err) {
      const d = err.response?.data;
      const errs = d?.errors || d;
      setError(
        errs?.device_id?.[0] ||
        errs?.pairing_code?.[0] ||
        errs?.detail ||
        errs?.non_field_errors?.[0] ||
        (typeof errs === 'string' ? errs : 'Pairing failed. Check your Device ID and Pairing Code.')
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
          <p className={styles.subtitle}>Pair your hardware device using the Device ID and Pairing Code provided by your admin</p>
        </div>

        <div className={styles.card}>
          {/* ── Success state ── */}
          {paired ? (
            <div className={styles.successState}>
              <div className={styles.successIcon}>
                <CheckCircle size={40} color="#10b981" />
              </div>
              <h2 className={styles.successTitle}>Device Paired Successfully!</h2>
              <p className={styles.successSub}>Your device is now linked to your account.</p>

              <div className={styles.pairedInfo}>
                <div className={styles.pairedRow}>
                  <CircuitBoard size={16} color="#6366f1" />
                  <span className={styles.pairedLabel}>Device Name</span>
                  <strong>{paired.device_name}</strong>
                </div>
                <div className={styles.pairedRow}>
                  <span className={styles.pairedLabel}>Device ID</span>
                  <code className={styles.pairedCode}>{paired.device_id}</code>
                </div>
                <div className={styles.pairedRow}>
                  <span className={styles.pairedLabel}>Status</span>
                  <span className={paired.status === 'Online' ? styles.badgeOnline : styles.badgeOffline}>
                    {paired.status}
                  </span>
                </div>
                {paired.crop_type && (
                  <div className={styles.pairedRow}>
                    <span className={styles.pairedLabel}>Crop Type</span>
                    <strong>{paired.crop_type}</strong>
                  </div>
                )}
              </div>

              <div className={styles.successActions}>
                <button className={styles.cancelBtn} onClick={() => { setPaired(null); setForm({ device_id: '', pairing_code: '' }); }}>
                  Pair Another
                </button>
                <button className={styles.submitBtn} onClick={() => navigate('/devices')}>
                  View My Devices
                </button>
              </div>
            </div>
          ) : (
            <>
              {error && <div className={styles.errorBanner}>{error}</div>}

              <form onSubmit={handleSubmit} className={styles.form} noValidate>
                <div className={styles.grid}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="device_id">Device ID</label>
                    <input
                      id="device_id"
                      name="device_id"
                      className={styles.input}
                      placeholder="e.g. EF-A1B2C3D4"
                      value={form.device_id}
                      onChange={handleChange}
                      autoComplete="off"
                      required
                    />
                    <span className={styles.hint}>Provided by your admin when the device was registered</span>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="pairing_code">Pairing Code</label>
                    <input
                      id="pairing_code"
                      name="pairing_code"
                      className={`${styles.input} ${styles.codeInput}`}
                      placeholder="e.g. GX92A7"
                      value={form.pairing_code}
                      onChange={handleChange}
                      maxLength={6}
                      autoComplete="off"
                      required
                    />
                    <span className={styles.hint}>6-character code provided by your admin</span>
                  </div>
                </div>

                <div className={styles.footer}>
                  <button type="button" className={styles.cancelBtn} onClick={() => navigate('/devices')} disabled={loading}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading
                      ? <><RefreshCw size={15} className={styles.spinner} /> Pairing…</>
                      : <><Link2 size={15} /> Pair Device</>
                    }
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
