import { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle, Loader, Link2, Wifi } from 'lucide-react';
import api from '../../services/api';
import styles from './DevicePairingCard.module.css';

export default function DevicePairingCard() {
  const [deviceId, setDeviceId] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [pairedDevice, setPairedDevice] = useState(null);
  const [hwConnected, setHwConnected] = useState(false);
  const pollRef = useRef(null);

  // Poll device status after pairing until it goes Online
  useEffect(() => {
    if (!pairedDevice) return;
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await api.get('/devices/');
        const found = data.find(d => d.device_id === pairedDevice.device_id);
        if (found?.status === 'Online') {
          setHwConnected(true);
          clearInterval(pollRef.current);
        }
      } catch { /* silent */ }
    }, 4000);
    return () => clearInterval(pollRef.current);
  }, [pairedDevice]);

  const handlePairDevice = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setSuccess(false);
    setHwConnected(false);
    setPairedDevice(null);

    try {
      const { data } = await api.post('/device/pair/', { device_id: deviceId, pairing_code: pairingCode });
      setSuccess(true);
      setPairedDevice(data.device);
      setMessage('Device paired! Waiting for hardware to connect…');
      setDeviceId('');
      setPairingCode('');
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
            placeholder="e.g., EF-93B1A4F3"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value.toUpperCase())}
            disabled={loading || success}
            required
            className={styles.input}
          />
          <span className={styles.fieldHint}>Printed on the device label</span>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Pairing Code</label>
          <input
            type="password"
            placeholder="e.g., GX92A7"
            value={pairingCode}
            onChange={(e) => setPairingCode(e.target.value)}
            disabled={loading || success}
            required
            className={styles.input}
          />
          <span className={styles.fieldHint}>6-character code on the device or packaging</span>
        </div>

        {message && (
          <div className={`${styles.messageBox} ${success ? styles.success : styles.error}`}>
            {success ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{message}</span>
          </div>
        )}

        {hwConnected && (
          <div className={styles.hwConnected}>
            <Wifi size={18} color="#10b981" />
            <span>Hardware connected! Your device is now live.</span>
          </div>
        )}

        {success && !hwConnected && (
          <div className={styles.hwWaiting}>
            <Loader size={15} className={styles.spinner} />
            <span>Power on your device — it will connect automatically…</span>
          </div>
        )}

        {!success && (
          <button
            type="submit"
            disabled={loading || !deviceId || !pairingCode}
            className={styles.submitBtn}
          >
            {loading ? <><Loader size={18} className={styles.spinner} /> Pairing...</> : 'Pair Device'}
          </button>
        )}
      </form>

      <div className={styles.hint}>
        <p>Both Device ID and Pairing Code are required. Check your device label for these codes.</p>
      </div>
    </div>
  );
}
