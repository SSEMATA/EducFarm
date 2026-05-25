import { useState } from 'react';
import { CheckCircle, AlertCircle, Loader, Thermometer, Droplets, Power, Zap } from 'lucide-react';
import api from '../../services/api';
import styles from './TestDeviceCard.module.css';

export default function TestDeviceCard() {
  const [deviceId, setDeviceId] = useState('');
  const [testCode, setTestCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [error, setError] = useState(false);

  const handleTestDevice = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError(false);
    setTestResults(null);

    try {
      const { data } = await api.post('/device/test/', { device_id: deviceId, test_code: testCode });
      setTestResults(data);
      setMessage('Device test successful! Ready for pairing.');
    } catch (err) {
      setError(true);
      const errors = err.response?.data?.errors;
      setMessage(
        errors?.non_field_errors?.[0] ||
        errors?.test_code?.[0] ||
        errors?.device_id?.[0] ||
        err.response?.data?.detail ||
        'Test failed. Please check your Device ID and Test Code.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconSection}>
          <div className={styles.icon}><Zap size={24} color="#fff" /></div>
        </div>
        <div className={styles.headerText}>
          <h3 className={styles.title}>Test Device Connection</h3>
          <p className={styles.subtitle}>Verify device connectivity and sensor readings before full registration</p>
        </div>
      </div>

      <form onSubmit={handleTestDevice} className={styles.form}>
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
          <label className={styles.label}>Test Code</label>
          <input
            type="text"
            placeholder="e.g., TEST-ABC123"
            value={testCode}
            onChange={(e) => setTestCode(e.target.value)}
            disabled={loading}
            required
            className={styles.input}
          />
          <span className={styles.fieldHint}>Temporary code from your device setup sheet (starts with <code>TEST-</code>)</span>
        </div>

        {message && (
          <div className={`${styles.messageBox} ${error ? styles.error : styles.success}`}>
            {error ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            <span>{message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !deviceId || !testCode}
          className={styles.submitBtn}
        >
          {loading ? (
            <>
              <Loader size={18} className={styles.spinner} />
              Testing...
            </>
          ) : (
            'Test Connection'
          )}
        </button>
      </form>

      {testResults && (
        <div className={styles.resultsContainer}>
          <h4 className={styles.resultsTitle}>Test Results</h4>
          
          <div className={styles.checksGrid}>
            <div className={styles.checkItem}>
              <CheckCircle size={20} className={styles.checkIcon} />
              <div>
                <p className={styles.checkLabel}>Device Found</p>
                <p className={styles.checkValue}>{testResults.device_name}</p>
              </div>
            </div>

            <div className={styles.checkItem}>
              <Power size={20} className={styles.checkIcon} />
              <div>
                <p className={styles.checkLabel}>Online Status</p>
                <p className={styles.checkValue}>{testResults.checks.online_status}</p>
              </div>
            </div>

            <div className={styles.checkItem}>
              <Thermometer size={20} className={styles.checkIcon} />
              <div>
                <p className={styles.checkLabel}>Temperature</p>
                <p className={styles.checkValue}>{testResults.checks.temperature_reading}°C</p>
              </div>
            </div>

            <div className={styles.checkItem}>
              <Droplets size={20} className={styles.checkIcon} />
              <div>
                <p className={styles.checkLabel}>Soil Moisture</p>
                <p className={styles.checkValue}>{testResults.checks.soil_moisture}%</p>
              </div>
            </div>
          </div>

          <p className={styles.resultMessage}>{testResults.message}</p>
        </div>
      )}

      <div className={styles.hint}>
        <p>Test codes are temporary and used for validation. After successful testing, proceed to pair the device with your account.</p>
      </div>
    </div>
  );
}
