import { useState } from 'react';
import { CheckCircle, AlertCircle, Loader, Link2 } from 'lucide-react';
import api from '../../services/api';
import styles from './DevicePairingCard.module.css';

export default function DevicePairingCard() {
  const [deviceId, setDeviceId] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePairDevice = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setSuccess(false);

    try {
      await api.post('/device/pair/', { device_id: deviceId, pairing_code: pairingCode });
      setSuccess(true);
      setMessage('Device successfully paired to your account.');
      setDeviceId('');
      setPairingCode('');
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      const errors = err.response?.data?.errors;
      setMessage(
        errors?.non_field_errors?.[0] ||
        errors?.pairing_code?.[0] ||
        errors?.device_id?.[0] ||
        err.response?.data?.detail ||
        'Pairing failed. Please check your Device ID and Pairing Code.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconSection}>
          <div className={styles.icon}><Link2 size={24} color="#fff" /></div>
        </div>
        <div className={styles.headerText}>
          <h3 className={styles.title}>Add New Device</h3>
          <p className={styles.subtitle}>Connect your hardware device using Device ID and Pairing Code</p>
        </div>
      </div>

      <form onSubmit={handlePairDevice} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Device ID</label>
          <input
            type="text"
            placeholder="e.g., EDF-IRR-1024"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value.toUpperCase())}
            disabled={loading}
            required
            className={styles.input}
          />
          <span className={styles.fieldHint}>Format: <code>EDF-IRR-XXXX</code> — found on the device label</span>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Pairing Code</label>
          <input
            type="password"
            placeholder="e.g., GX92A7"
            value={pairingCode}
            onChange={(e) => setPairingCode(e.target.value)}
            disabled={loading}
            required
            className={styles.input}
          />
          <span className={styles.fieldHint}>6-character code printed on your device or packaging</span>
        </div>

        {message && (
          <div className={`${styles.messageBox} ${success ? styles.success : styles.error}`}>
            {success ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !deviceId || !pairingCode}
          className={styles.submitBtn}
        >
          {loading ? (
            <>
              <Loader size={18} className={styles.spinner} />
              Pairing...
            </>
          ) : (
            'Pair Device'
          )}
        </button>
      </form>

      <div className={styles.hint}>
        <p>Both Device ID and Pairing Code are required. Check your device documentation for these codes.</p>
      </div>
    </div>
  );
}
