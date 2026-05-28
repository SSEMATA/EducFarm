import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import {
  CircuitBoard, Trash2, RefreshCw, Search, CheckCircle2, XCircle,
  Wifi, WifiOff, Plus, Copy, Eye, EyeOff, X, Zap, AlertTriangle,
  Clock, Thermometer, Droplets, Activity, Key, AlertCircle, Info, ShieldAlert,
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
      const { data } = await api.post('/admin/devices/generate/');
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

function DeviceDetailModal({ device, onClose }) {
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    api.get(`/admin/devices/${device.id}/stats/`)
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
          <button className={styles.closeBtn} onClick={onClose}><X size={16} /></button>
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
    try { const { data } = await api.get('/admin/devices/'); setDevices(data); }
    catch { /* interceptor handles */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDevices(); }, [fetchDevices]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/devices/${id}/`);
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
