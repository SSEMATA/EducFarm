import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Radio, CircleDot, CircleOff, Search, X, Eye, Pencil, Trash2, CircuitBoard, PackageOpen } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import styles from './DeviceList.module.css';

export default function DeviceList() {
  const [devices, setDevices]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all'); // all | online | offline
  const [modal, setModal]       = useState(null);  // { mode: 'view'|'edit'|'delete', device }
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving]     = useState(false);
  const [actionError, setActionError] = useState('');

  const fetchDevices = useCallback(async () => {
    try {
      const { data } = await api.get('/devices/');
      setDevices(data);
      setError('');
    } catch {
      setError('Failed to load devices. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDevices(); }, [fetchDevices]);

  /* ── Filtering ─────────────────────────────────────── */
  const visible = devices.filter((d) => {
    const matchSearch =
      d.device_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.device_id?.toLowerCase().includes(search.toLowerCase()) ||
      d.crop_type?.toLowerCase().includes(search.toLowerCase()) ||
      d.soil_type?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'online'  && d.status === 'Online') ||
      (filter === 'offline' && d.status !== 'Online');
    return matchSearch && matchFilter;
  });

  /* ── Actions ───────────────────────────────────────── */
  const openView   = (device) => { setActionError(''); setModal({ mode: 'view',   device }); };
  const openEdit   = (device) => { setActionError(''); setEditForm({ ...device }); setModal({ mode: 'edit', device }); };
  const openDelete = (device) => { setActionError(''); setModal({ mode: 'delete', device }); };
  const closeModal = () => setModal(null);

  const handleEditSave = async () => {
    setSaving(true);
    setActionError('');
    try {
      const { data } = await api.put(`/devices/${editForm.id}/`, editForm);
      setDevices((prev) => prev.map((d) => (d.id === data.id ? data : d)));
      closeModal();
    } catch {
      setActionError('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    setActionError('');
    try {
      await api.delete(`/devices/${modal.device.id}/`);
      setDevices((prev) => prev.filter((d) => d.id !== modal.device.id));
      closeModal();
    } catch {
      setActionError('Failed to delete device.');
    } finally {
      setSaving(false);
    }
  };

  const onlineCount  = devices.filter((d) => d.status === 'Online').length;
  const offlineCount = devices.length - onlineCount;

  return (
    <DashboardLayout>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Devices</h1>
            <p className={styles.pageSubtitle}>Manage your connected hardware devices</p>
          </div>
          <button className={styles.refreshBtn} onClick={fetchDevices} disabled={loading}>
            <RefreshCw size={14} className={loading ? styles.spinning : ''} /> Refresh
          </button>
        </div>

        {/* Summary chips */}
        <div className={styles.chips}>
          <span className={styles.chip}><Radio size={13} /> Total: <strong>{devices.length}</strong></span>
          <span className={`${styles.chip} ${styles.chipGreen}`}><CircleDot size={13} /> Online: <strong>{onlineCount}</strong></span>
          <span className={`${styles.chip} ${styles.chipRed}`}><CircleOff size={13} /> Offline: <strong>{offlineCount}</strong></span>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search by name, ID, crop or soil…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.clearBtn} onClick={() => setSearch('')}><X size={13} /></button>
            )}
          </div>
          <div className={styles.filterBtns}>
            {['all', 'online', 'offline'].map((f) => (
              <button
                key={f}
                className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableWrap}>
          {loading ? (
            <div className={styles.stateBox}>
              <span className={styles.bigSpinner} />
              <p>Loading devices…</p>
            </div>
          ) : visible.length === 0 ? (
            <div className={styles.stateBox}>
              <PackageOpen size={40} className={styles.emptyIcon} />
              <p>{search || filter !== 'all' ? 'No devices match your search.' : 'No devices found.'}</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Device ID</th>
                  <th>Device Name</th>
                  <th>Status</th>
                  <th>Soil Type</th>
                  <th>Crop Type</th>
                  <th>Last Seen</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((device, i) => (
                  <tr key={device.id ?? device.device_id} className={styles.row}>
                    <td className={styles.rowNum}>{i + 1}</td>
                    <td><code className={styles.deviceId}>{device.device_id}</code></td>
                    <td className={styles.deviceName}>{device.device_name}</td>
                    <td>
                      <span className={`${styles.badge} ${device.status === 'Online' ? styles.badgeOnline : styles.badgeOffline}`}>
                        <span className={styles.dot} />
                        {device.status ?? 'Unknown'}
                      </span>
                    </td>
                    <td>{device.soil_type ?? '—'}</td>
                    <td>{device.crop_type ?? '—'}</td>
                    <td className={styles.lastSeen}>{device.last_seen ? new Date(device.last_seen).toLocaleString() : '—'}</td>
                    <td>
                      <div className={styles.actions}>
                        <button className={`${styles.actionBtn} ${styles.viewBtn}`}   onClick={() => openView(device)}><Eye size={13} /> View</button>
                        <button className={`${styles.actionBtn} ${styles.editBtn}`}   onClick={() => openEdit(device)}><Pencil size={13} /> Edit</button>
                        <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => openDelete(device)}><Trash2 size={13} /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className={styles.count}>
          Showing {visible.length} of {devices.length} device{devices.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── Modals ──────────────────────────────────────── */}
      {modal && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>

            {/* VIEW */}
            {modal.mode === 'view' && (
              <>
                <div className={styles.modalHeader}>
                  <span className={styles.modalTitle}><CircuitBoard size={16} /> Device Details</span>
                  <button className={styles.closeBtn} onClick={closeModal}><X size={16} /></button>
                </div>
                <div className={styles.detailGrid}>
                  {[
                    ['Device ID',   modal.device.device_id],
                    ['Device Name', modal.device.device_name],
                    ['Status',      modal.device.status],
                    ['Soil Type',   modal.device.soil_type],
                    ['Crop Type',   modal.device.crop_type],
                    ['Last Seen',   modal.device.last_seen ? new Date(modal.device.last_seen).toLocaleString() : '—'],
                  ].map(([label, value]) => (
                    <div key={label} className={styles.detailRow}>
                      <span className={styles.detailLabel}>{label}</span>
                      <span className={styles.detailValue}>{value ?? '—'}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.modalFooter}>
                  <button className={styles.cancelBtn} onClick={closeModal}>Close</button>
                </div>
              </>
            )}

            {/* EDIT */}
            {modal.mode === 'edit' && (
              <>
                <div className={styles.modalHeader}>
                  <span className={styles.modalTitle}><Pencil size={16} /> Edit Device</span>
                  <button className={styles.closeBtn} onClick={closeModal}><X size={16} /></button>
                </div>
                {actionError && <div className={styles.modalError}>{actionError}</div>}
                <div className={styles.editGrid}>
                  {[
                    { name: 'device_name', label: 'Device Name' },
                    { name: 'soil_type',   label: 'Soil Type'   },
                    { name: 'crop_type',   label: 'Crop Type'   },
                  ].map(({ name, label }) => (
                    <div key={name} className={styles.editField}>
                      <label className={styles.editLabel}>{label}</label>
                      <input
                        className={styles.editInput}
                        value={editForm[name] ?? ''}
                        onChange={(e) => setEditForm((p) => ({ ...p, [name]: e.target.value }))}
                      />
                    </div>
                  ))}
                  <div className={styles.editField}>
                    <label className={styles.editLabel}>Status</label>
                    <select
                      className={styles.editInput}
                      value={editForm.status ?? ''}
                      onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                    >
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button className={styles.cancelBtn} onClick={closeModal} disabled={saving}>Cancel</button>
                  <button className={styles.saveBtn} onClick={handleEditSave} disabled={saving}>
                    {saving ? <RefreshCw size={14} className={styles.spinning} /> : 'Save Changes'}
                  </button>
                </div>
              </>
            )}

            {/* DELETE */}
            {modal.mode === 'delete' && (
              <>
                <div className={styles.modalHeader}>
                  <span className={styles.modalTitle}><Trash2 size={16} /> Delete Device</span>
                  <button className={styles.closeBtn} onClick={closeModal}><X size={16} /></button>
                </div>
                {actionError && <div className={styles.modalError}>{actionError}</div>}
                <p className={styles.deleteMsg}>
                  Are you sure you want to delete <strong>{modal.device.device_name}</strong>?
                  This action cannot be undone.
                </p>
                <div className={styles.modalFooter}>
                  <button className={styles.cancelBtn} onClick={closeModal} disabled={saving}>Cancel</button>
                  <button className={styles.deleteConfirmBtn} onClick={handleDelete} disabled={saving}>
                    {saving ? <RefreshCw size={14} className={styles.spinning} /> : 'Yes, Delete'}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
