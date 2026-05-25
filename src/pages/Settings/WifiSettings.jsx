import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import styles from './WifiSettings.module.css';

const SIGNAL_BARS = (rssi) => {
  if (rssi == null) return 0;
  if (rssi >= -50) return 4;
  if (rssi >= -65) return 3;
  if (rssi >= -75) return 2;
  return 1;
};

const SIGNAL_LABEL = (rssi) => {
  if (rssi == null) return 'Unknown';
  if (rssi >= -50) return 'Excellent';
  if (rssi >= -65) return 'Good';
  if (rssi >= -75) return 'Fair';
  return 'Weak';
};

const SIGNAL_COLOR = (rssi) => {
  if (rssi == null) return '#9ca3af';
  if (rssi >= -50) return '#16a34a';
  if (rssi >= -65) return '#65a30d';
  if (rssi >= -75) return '#f59e0b';
  return '#ef4444';
};

function SignalIcon({ rssi }) {
  const bars  = SIGNAL_BARS(rssi);
  const color = SIGNAL_COLOR(rssi);
  return (
    <span className={styles.signalIcon} title={`${SIGNAL_LABEL(rssi)} (${rssi ?? '?'} dBm)`}>
      {[1, 2, 3, 4].map((b) => (
        <span
          key={b}
          className={styles.signalBar}
          style={{
            height: `${b * 5 + 4}px`,
            background: b <= bars ? color : '#e5e7eb',
          }}
        />
      ))}
    </span>
  );
}

function NetworkRow({ net, onSelect }) {
  return (
    <button className={styles.networkRow} onClick={() => onSelect(net.ssid)} type="button">
      <span className={styles.networkName}>
        {net.secured ? '🔒' : '🔓'} {net.ssid}
      </span>
      <span className={styles.networkMeta}>
        <SignalIcon rssi={net.rssi} />
        <span className={styles.networkRssi} style={{ color: SIGNAL_COLOR(net.rssi) }}>
          {SIGNAL_LABEL(net.rssi)}
        </span>
      </span>
    </button>
  );
}

export default function WifiSettings() {
  const [connection, setConnection] = useState(null);
  const [networks, setNetworks]     = useState([]);
  const [scanning, setScanning]     = useState(false);
  const [form, setForm]             = useState({ ssid: '', password: '' });
  const [showPass, setShowPass]     = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await api.get('/wifi/status/');
      setConnection(data);
    } catch { /* non-blocking */ }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleScan = async () => {
    setScanning(true);
    setError('');
    try {
      const { data } = await api.get('/wifi/scan/');
      setNetworks(data?.networks ?? data ?? []);
    } catch {
      setError('Network scan failed. Make sure the device is reachable.');
    } finally {
      setScanning(false);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!form.ssid.trim()) { setError('SSID is required.'); return; }
    setConnecting(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.post('/wifi/configure/', form);
      setSuccess(data?.message ?? 'WiFi configured successfully.');
      setConnection(data?.connection ?? { ssid: form.ssid, status: 'Connected' });
      setForm((p) => ({ ...p, password: '' }));
      setNetworks([]);
    } catch (err) {
      const d = err.response?.data;
      setError(
        typeof d === 'string' ? d : d?.detail || d?.message || Object.values(d ?? {})[0] || 'Configuration failed.'
      );
    } finally {
      setConnecting(false);
    }
  };

  const isConnected = connection?.status?.toLowerCase() === 'connected';

  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/* ── Header ─────────────────────────────────────── */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>WiFi Settings</h1>
            <p className={styles.pageSubtitle}>Configure your IoT device network connection</p>
          </div>
          <button className={styles.refreshBtn} onClick={fetchStatus} type="button">
            ↻ Refresh Status
          </button>
        </div>

        <div className={styles.layout}>

          {/* ── Left column ──────────────────────────────── */}
          <div className={styles.leftCol}>

            {/* Current connection card */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>📶 Current Connection</h2>
              <div className={`${styles.connectionCard} ${isConnected ? styles.connected : styles.disconnected}`}>
                <div className={styles.connectionTop}>
                  <div className={styles.connectionInfo}>
                    <span className={styles.connectionSSID}>
                      {connection?.ssid ?? 'Not connected'}
                    </span>
                    <span
                      className={styles.connectionStatus}
                      style={{ color: isConnected ? '#16a34a' : '#dc2626' }}
                    >
                      <span
                        className={styles.statusDot}
                        style={{ background: isConnected ? '#16a34a' : '#dc2626' }}
                      />
                      {connection?.status ?? 'Disconnected'}
                    </span>
                  </div>
                  {connection?.rssi != null && (
                    <SignalIcon rssi={connection.rssi} />
                  )}
                </div>

                <div className={styles.connectionStats}>
                  {connection?.rssi != null && (
                    <div className={styles.statPill}>
                      <span className={styles.statPillLabel}>Signal</span>
                      <span
                        className={styles.statPillValue}
                        style={{ color: SIGNAL_COLOR(connection.rssi) }}
                      >
                        {SIGNAL_LABEL(connection.rssi)} ({connection.rssi} dBm)
                      </span>
                    </div>
                  )}
                  {connection?.ip && (
                    <div className={styles.statPill}>
                      <span className={styles.statPillLabel}>IP Address</span>
                      <span className={styles.statPillValue}>{connection.ip}</span>
                    </div>
                  )}
                  {connection?.channel != null && (
                    <div className={styles.statPill}>
                      <span className={styles.statPillLabel}>Channel</span>
                      <span className={styles.statPillValue}>{connection.channel}</span>
                    </div>
                  )}
                  {connection?.mac && (
                    <div className={styles.statPill}>
                      <span className={styles.statPillLabel}>MAC</span>
                      <span className={styles.statPillValue}>{connection.mac}</span>
                    </div>
                  )}
                </div>

                {connection?.rssi != null && (
                  <div className={styles.signalBar}>
                    <div className={styles.signalTrack}>
                      <div
                        className={styles.signalFill}
                        style={{
                          width: `${Math.min(100, Math.max(0, ((connection.rssi + 100) / 60) * 100))}%`,
                          background: SIGNAL_COLOR(connection.rssi),
                        }}
                      />
                    </div>
                    <span className={styles.signalPct}>
                      {Math.min(100, Math.max(0, Math.round(((connection.rssi + 100) / 60) * 100)))}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Scan networks */}
            <div className={styles.section}>
              <div className={styles.sectionRow}>
                <h2 className={styles.sectionTitle}>📡 Available Networks</h2>
                <button
                  className={styles.scanBtn}
                  onClick={handleScan}
                  disabled={scanning}
                  type="button"
                >
                  {scanning
                    ? <><span className={styles.spinning}>↻</span> Scanning…</>
                    : '🔍 Scan Networks'}
                </button>
              </div>

              {networks.length > 0 ? (
                <div className={styles.networkList}>
                  {networks.map((net, i) => (
                    <NetworkRow
                      key={net.ssid ?? i}
                      net={net}
                      onSelect={(ssid) => { setForm((p) => ({ ...p, ssid })); setError(''); setSuccess(''); }}
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyNetworks}>
                  {scanning
                    ? 'Scanning for networks…'
                    : 'Press "Scan Networks" to discover nearby WiFi networks.'}
                </div>
              )}
            </div>
          </div>

          {/* ── Right column — configure form ─────────────── */}
          <div className={styles.rightCol}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>⚙️ Configure Network</h2>

              {success && <div className={styles.successBanner}>✅ {success}</div>}
              {error   && <div className={styles.errorBanner}>⚠️ {error}</div>}

              <form onSubmit={handleConnect} className={styles.form} noValidate>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="ssid">Network SSID</label>
                  <input
                    id="ssid"
                    className={styles.input}
                    placeholder="Enter or select a network name"
                    value={form.ssid}
                    onChange={(e) => { setForm((p) => ({ ...p, ssid: e.target.value })); setError(''); }}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="password">Password</label>
                  <div className={styles.passwordWrap}>
                    <input
                      id="password"
                      type={showPass ? 'text' : 'password'}
                      className={styles.input}
                      placeholder="WiFi password"
                      value={form.password}
                      onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    />
                    <button
                      type="button"
                      className={styles.toggleBtn}
                      onClick={() => setShowPass((v) => !v)}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                    >
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <button type="submit" className={styles.connectBtn} disabled={connecting}>
                  {connecting
                    ? <><span className={styles.spinner} /> Connecting…</>
                    : '🔗 Connect'}
                </button>
              </form>

              <div className={styles.hint}>
                <span>💡</span>
                <span>Scan for networks first, then click a network name to auto-fill the SSID field.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
