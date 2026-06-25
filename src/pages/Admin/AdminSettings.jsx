import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Settings, Power, PowerOff, RefreshCw, Plus, Trash2,
  ShieldCheck, ShieldOff, Eye, EyeOff, CheckCircle2,
  AlertTriangle, Users, Edit3, Save, X, Lock, Clock, Leaf, ChevronRight,
} from 'lucide-react';
import styles from './Admin.module.css';
import sStyles from './AdminSettings.module.css';

const LEVELS = [
  { value: 'moderator',  label: 'Moderator',   desc: 'Limited access, assigned permissions only' },
  { value: 'admin',      label: 'Admin',        desc: 'Full access except system shutdown' },
  { value: 'superadmin', label: 'Super Admin',  desc: 'Full access including system control' },
];

const PERMS = [
  { key: 'users',   label: 'Manage Users',   desc: 'View, activate, deactivate, delete users' },
  { key: 'devices', label: 'Manage Devices', desc: 'Generate, fix, delete devices' },
  { key: 'weather', label: 'Manage Weather', desc: 'Control weather API access per user' },
  { key: 'system',  label: 'System Control', desc: 'Switch system on/off, edit maintenance message' },
];

function ConfirmModal({ title, message, confirmLabel, confirmColor, onConfirm, onCancel, children }) {
  return (
    <div className={styles.backdrop}>
      <div className={sStyles.confirmModal}>
        <div className={sStyles.confirmHeader}>
          <AlertTriangle size={20} color={confirmColor || '#ef4444'} />
          <span>{title}</span>
        </div>
        <p className={sStyles.confirmMsg}>{message}</p>
        {children}
        <div className={styles.modalActions}>
          <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button
            className={sStyles.confirmBtn}
            style={{ background: confirmColor || '#ef4444' }}
            onClick={onConfirm}
          >{confirmLabel || 'Confirm'}</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState('');
  const [toast, setToast]       = useState('');
  const [error, setError]       = useState('');

  // System toggle state
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [maintenanceTitle, setMaintenanceTitle]     = useState('');
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [maintenanceSub, setMaintenanceSub]         = useState('');
  const [editingMsg, setEditingMsg] = useState(false);
  const [onlineAt, setOnlineAt]     = useState('');

  // Create admin form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    full_name: '', email: '', phone_number: '',
    admin_level: 'moderator',
    permissions: { users: false, devices: false, weather: false, system: false },
  });
  const [showPwd, setShowPwd] = useState(false);
  const [createdOtp, setCreatedOtp] = useState(null); // { name, identifier, otp }

  // Edit admin
  const [editAdmin, setEditAdmin] = useState(null);

  // Remove admin confirm
  const [removeConfirm, setRemoveConfirm] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const { data: d } = await api.get('/users/admin/settings/');
      setData(d);
      setMaintenanceTitle(d.system.maintenance_title);
      setMaintenanceMessage(d.system.maintenance_message);
      setMaintenanceSub(d.system.maintenance_sub);
      setOnlineAt(d.system.online_at ? new Date(d.system.online_at).toISOString().slice(0,16) : '');
      setEditingMsg(false);
    } catch { setError('Failed to load settings.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── System toggle ──────────────────────────────────────────────────────────
  const handleToggleSystem = async () => {
    setSaving('system');
    try {
      // Convert datetime-local (local time) to UTC ISO string
      const onlineAtISO = onlineAt
        ? new Date(onlineAt).toISOString()
        : null;
      const goingOffline = data.system.online;
      const { data: d } = await api.patch('/users/admin/settings/', {
        action: 'toggle_system',
        online: !data.system.online,
        maintenance_title:   maintenanceTitle,
        maintenance_message: maintenanceMessage,
        maintenance_sub:     maintenanceSub,
        online_at:           goingOffline ? (onlineAtISO || null) : null,
      });
      setData(p => ({ ...p, system: { ...p.system, ...d } }));
      setShowToggleModal(false);
      showToast(`System is now ${d.online ? 'Online' : 'Offline'}.`);
    } catch { showToast('Failed to update system status.'); }
    finally { setSaving(''); }
  };

  const handleSaveMaintenanceText = async () => {
    setSaving('text');
    try {
      await api.patch('/users/admin/settings/', {
        action: 'update_maintenance_text',
        maintenance_title:   maintenanceTitle,
        maintenance_message: maintenanceMessage,
        maintenance_sub:     maintenanceSub,
      });
      setData(p => ({ ...p, system: { ...p.system, maintenance_title: maintenanceTitle, maintenance_message: maintenanceMessage, maintenance_sub: maintenanceSub } }));
      setEditingMsg(false);
      showToast('Maintenance message saved.');
    } catch { showToast('Failed to save.'); }
    finally { setSaving(''); }
  };

  // ── Create admin ───────────────────────────────────────────────────────────
  const handleCreateAdmin = async () => {
    setSaving('create');
    try {
      const { data: d } = await api.patch('/users/admin/settings/', {
        action: 'create_admin',
        ...newAdmin,
        permissions: newAdmin.permissions,
      });
      setData(p => ({ ...p, admins: [...p.admins, d] }));
      setShowCreateForm(false);
      setNewAdmin({ full_name: '', email: '', phone_number: '', admin_level: 'moderator', permissions: { users: false, devices: false, weather: false, system: false } });
      setCreatedOtp({ name: d.full_name, identifier: d.email || d.phone_number, otp: d.otp });
      showToast(`Admin "${d.full_name}" created.`);
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to create admin.');
    } finally { setSaving(''); }
  };

  // ── Update admin ───────────────────────────────────────────────────────────
  const handleUpdateAdmin = async () => {
    setSaving('edit');
    try {
      await api.patch('/users/admin/settings/', {
        action: 'update_admin',
        user_id: editAdmin.id,
        admin_level: editAdmin.admin_level,
        permissions: {
          users:   editAdmin.can_manage_users,
          devices: editAdmin.can_manage_devices,
          weather: editAdmin.can_manage_weather,
          system:  editAdmin.can_manage_system,
        },
      });
      setData(p => ({ ...p, admins: p.admins.map(a => a.id === editAdmin.id ? { ...a, ...editAdmin } : a) }));
      setEditAdmin(null);
      showToast('Admin updated.');
    } catch { showToast('Failed to update.'); }
    finally { setSaving(''); }
  };

  // ── Remove admin ───────────────────────────────────────────────────────────
  const handleRemoveAdmin = async () => {
    setSaving('remove');
    try {
      await api.patch('/users/admin/settings/', { action: 'remove_admin', user_id: removeConfirm.id });
      setData(p => ({ ...p, admins: p.admins.filter(a => a.id !== removeConfirm.id) }));
      setRemoveConfirm(null);
      showToast('Admin removed.');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to remove admin.');
    } finally { setSaving(''); }
  };

  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>System Settings</h1>
            <p className={styles.subtitle}>Control system status, manage admins and their permissions</p>
          </div>
          <button className={styles.refreshBtn} onClick={fetchData} disabled={loading}>
            <RefreshCw size={14} className={loading ? styles.spinning : ''} /> Refresh
          </button>
        </div>

        {loading && <div className={sStyles.stateBox}>Loading…</div>}
        {!loading && error && <div className={sStyles.stateBox} style={{ color: '#ef4444' }}>{error}</div>}

        {!loading && data && (
          <>
            {/* ── Plant Settings section ── */}
            <button className={sStyles.navSection} onClick={() => navigate('/admin/plant-settings')}>
              <div className={sStyles.navSectionLeft}>
                <div className={sStyles.navSectionIcon} style={{ background: '#f0fdf4' }}>
                  <Leaf size={20} color="#2d7a4f" />
                </div>
                <div>
                  <div className={sStyles.navSectionTitle}>Plant Settings</div>
                  <div className={sStyles.navSectionDesc}>Manage plant profiles, thresholds and visibility for users</div>
                </div>
              </div>
              <ChevronRight size={18} color="#9ca3af" />
            </button>

            {/* ── System On/Off ── */}
            <div className={sStyles.systemCard}>
              <div className={sStyles.systemLeft}>
                <div className={sStyles.systemIcon} style={{ background: data.system.online ? '#dcfce7' : '#fef2f2' }}>
                  {data.system.online
                    ? <Power size={24} color="#10b981" />
                    : <PowerOff size={24} color="#ef4444" />}
                </div>
                <div>
                  <div className={sStyles.systemTitle}>System Status</div>
                  <div className={sStyles.systemBadge} style={{ color: data.system.online ? '#10b981' : '#ef4444' }}>
                    {data.system.online ? '● Online — All users can access the platform' : '● Offline — Users see the maintenance page'}
                  </div>
                  {data.system.updated_by && (
                    <div className={sStyles.systemMeta}>
                      Last changed by {data.system.updated_by} · {new Date(data.system.updated_at).toLocaleString()}
                    </div>
                  )}
                  {!data.system.online && data.system.online_at && (
                    <div className={sStyles.systemMeta} style={{ color: '#10b981' }}>
                      <Clock size={11} style={{ display: 'inline', marginRight: 3 }} />
                      Scheduled back online: {new Date(data.system.online_at).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
              <button
                className={`${sStyles.toggleSystemBtn} ${data.system.online ? sStyles.btnDanger : sStyles.btnSuccess}`}
                onClick={() => { setOnlineAt(''); setShowToggleModal(true); }}
              >
                {data.system.online
                  ? <><PowerOff size={15} /> Switch Offline</>
                  : <><Power size={15} /> Switch Online</>}
              </button>
            </div>

            {/* ── Maintenance Message Editor ── */}
            <div className={sStyles.section}>
              <div className={sStyles.sectionTitle} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Edit3 size={15} /> Maintenance Message</span>
                {!editingMsg && (
                  <button className={sStyles.addBtn} onClick={() => setEditingMsg(true)}>
                    <Edit3 size={13} /> Edit
                  </button>
                )}
              </div>
              <div className={sStyles.sectionBody}>
                {!editingMsg ? (
                  <div className={sStyles.msgForm}>
                    <div className={sStyles.msgField}>
                      <label>Title</label>
                      <div className={sStyles.msgReadOnly}>{maintenanceTitle || <span style={{ color: '#9ca3af' }}>System Maintenance</span>}</div>
                    </div>
                    <div className={sStyles.msgField}>
                      <label>Main Message</label>
                      <div className={sStyles.msgReadOnly}>{maintenanceMessage || <span style={{ color: '#9ca3af' }}>The system is currently under maintenance.</span>}</div>
                    </div>
                    <div className={sStyles.msgField}>
                      <label>Sub-text</label>
                      <div className={sStyles.msgReadOnly}>{maintenanceSub || <span style={{ color: '#9ca3af' }}>We apologize for the inconvenience.</span>}</div>
                    </div>
                  </div>
                ) : (
                  <div className={sStyles.msgForm}>
                    <div className={sStyles.msgField}>
                      <label>Title</label>
                      <input
                        className={sStyles.msgInput}
                        value={maintenanceTitle}
                        onChange={e => setMaintenanceTitle(e.target.value)}
                        placeholder="e.g. System Maintenance"
                      />
                    </div>
                    <div className={sStyles.msgField}>
                      <label>Main Message</label>
                      <textarea
                        className={sStyles.msgTextarea}
                        value={maintenanceMessage}
                        onChange={e => setMaintenanceMessage(e.target.value)}
                        rows={3}
                        placeholder="e.g. The system is currently under maintenance…"
                      />
                    </div>
                    <div className={sStyles.msgField}>
                      <label>Sub-text</label>
                      <input
                        className={sStyles.msgInput}
                        value={maintenanceSub}
                        onChange={e => setMaintenanceSub(e.target.value)}
                        placeholder="e.g. We apologize for the inconvenience."
                      />
                    </div>
                    <div className={sStyles.msgPreview}>
                      <span className={sStyles.previewLabel}>Preview</span>
                      <div className={sStyles.previewBox}>
                        <PowerOff size={28} color="#ef4444" />
                        <strong>{maintenanceTitle || 'System Maintenance'}</strong>
                        <p>{maintenanceMessage || 'The system is currently under maintenance.'}</p>
                        <small>{maintenanceSub}</small>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className={styles.cancelBtn} onClick={() => {
                        setMaintenanceTitle(data.system.maintenance_title);
                        setMaintenanceMessage(data.system.maintenance_message);
                        setMaintenanceSub(data.system.maintenance_sub);
                        setEditingMsg(false);
                      }}>
                        <X size={13} /> Cancel
                      </button>
                      <button
                        className={sStyles.saveBtn}
                        onClick={handleSaveMaintenanceText}
                        disabled={saving === 'text'}
                      >
                        {saving === 'text'
                          ? <><RefreshCw size={13} className={styles.spinning} /> Saving…</>
                          : <><Save size={13} /> Save Message</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Admin Management ── */}
            <div className={sStyles.section}>
              <div className={sStyles.sectionHeader}>
                <div className={sStyles.sectionTitle} style={{ padding: 0, borderBottom: 'none' }}>
                  <Users size={15} /> Admin Accounts
                </div>
                <button className={sStyles.addBtn} onClick={() => setShowCreateForm(v => !v)}>
                  {showCreateForm ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Create Admin</>}
                </button>
              </div>

              {/* Create admin form */}
              {showCreateForm && (
                <div className={sStyles.createForm}>
                  <div className={sStyles.createGrid}>
                    <div className={sStyles.field}>
                      <label>Full Name *</label>
                      <input className={sStyles.input} value={newAdmin.full_name}
                        onChange={e => setNewAdmin(p => ({ ...p, full_name: e.target.value }))}
                        placeholder="e.g. John Doe" />
                    </div>
                    <div className={sStyles.field}>
                      <label>Email</label>
                      <input className={sStyles.input} type="email" value={newAdmin.email}
                        onChange={e => setNewAdmin(p => ({ ...p, email: e.target.value }))}
                        placeholder="admin@example.com" />
                    </div>
                    <div className={sStyles.field}>
                      <label>Phone (if no email)</label>
                      <input className={sStyles.input} value={newAdmin.phone_number}
                        onChange={e => setNewAdmin(p => ({ ...p, phone_number: e.target.value }))}
                        placeholder="0700000000" />
                    </div>
                    <div className={sStyles.field}>
                      <label>Admin Level</label>
                      <select className={sStyles.input} value={newAdmin.admin_level}
                        onChange={e => setNewAdmin(p => ({ ...p, admin_level: e.target.value }))}>
                        {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label} — {l.desc}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className={sStyles.permsTitle}><Lock size={13} /> Permissions</div>
                  <div className={sStyles.permsGrid}>
                    {PERMS.map(p => (
                      <label key={p.key} className={sStyles.permCard}>
                        <input type="checkbox"
                          checked={newAdmin.permissions[p.key]}
                          onChange={e => setNewAdmin(prev => ({ ...prev, permissions: { ...prev.permissions, [p.key]: e.target.checked } }))}
                        />
                        <div>
                          <span className={sStyles.permLabel}>{p.label}</span>
                          <span className={sStyles.permDesc}>{p.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  <button className={sStyles.saveBtn} onClick={handleCreateAdmin} disabled={saving === 'create'}>
                    {saving === 'create'
                      ? <><RefreshCw size={13} className={styles.spinning} /> Creating…</>
                      : <><ShieldCheck size={13} /> Create Admin Account</>}
                  </button>
                </div>
              )}

              {/* Admin list */}
              <div className={sStyles.adminList}>
                {data.admins.map(a => (
                  <div key={a.id} className={sStyles.adminRow}>
                    <div className={styles.nameCell}>
                      <div className={styles.avatar}>
                        {a.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'A'}
                      </div>
                      <div>
                        <span className={sStyles.adminName}>{a.full_name}</span>
                        <span className={sStyles.adminEmail}>{a.email}</span>
                      </div>
                    </div>
                    <div className={sStyles.adminLevel}>
                      <span className={`${sStyles.levelBadge} ${sStyles['level_' + a.admin_level]}`}>
                        {a.admin_level}
                      </span>
                    </div>
                    <div className={sStyles.adminPerms}>
                      {PERMS.map(p => (
                        <span key={p.key}
                          className={`${sStyles.permPill} ${a['can_manage_' + p.key] ? sStyles.permOn : sStyles.permOff}`}
                          title={p.label}
                        >
                          {p.label.replace('Manage ', '')}
                        </span>
                      ))}
                    </div>
                    {a.id !== currentUser.id && (
                      <div className={sStyles.adminActions}>
                        <button className={styles.iconBtn} title="Edit permissions"
                          onClick={() => setEditAdmin({ ...a })}>
                          <Edit3 size={14} color="#6366f1" />
                        </button>
                        <button className={styles.iconBtn} title="Remove admin"
                          onClick={() => setRemoveConfirm(a)}>
                          <Trash2 size={14} color="#ef4444" />
                        </button>
                      </div>
                    )}
                    {a.id === currentUser.id && (
                      <span className={sStyles.youBadge}>You</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── System toggle confirm modal ── */}
      {showToggleModal && data && (
        <ConfirmModal
          title={data.system.online ? 'Switch System Offline' : 'Switch System Online'}
          message={data.system.online
            ? 'Users will immediately see the maintenance page. Make sure the message below is correct before confirming.'
            : 'The system will go back online. All users will regain access immediately.'}
          confirmLabel={data.system.online ? 'Yes, Switch Offline' : 'Yes, Go Online'}
          confirmColor={data.system.online ? '#ef4444' : '#10b981'}
          onConfirm={handleToggleSystem}
          onCancel={() => setShowToggleModal(false)}
        >
          {data.system.online && (
            <>
              <div className={sStyles.inlinePreview}>
                <strong>{maintenanceTitle}</strong>
                <p>{maintenanceMessage}</p>
                <small>{maintenanceSub}</small>
              </div>
              <div className={sStyles.onlineAtField}>
                <label className={sStyles.onlineAtLabel}>
                  <Clock size={13} /> Schedule when system comes back online (optional)
                </label>
                <input
                  type="datetime-local"
                  className={sStyles.onlineAtInput}
                  value={onlineAt}
                  min={new Date(Date.now() + 60000).toISOString().slice(0,16)}
                  onChange={e => setOnlineAt(e.target.value)}
                />
                {onlineAt && (
                  <span className={sStyles.onlineAtHint}>
                    Users will see a countdown timer until {new Date(onlineAt).toLocaleString()}
                  </span>
                )}
              </div>
            </>
          )}
        </ConfirmModal>
      )}

      {/* ── Edit admin modal ── */}
      {editAdmin && (
        <div className={styles.backdrop}>
          <div className={sStyles.editModal}>
            <div className={styles.genHeader}>
              <div className={styles.genTitle}><ShieldCheck size={16} color="#6366f1" /> Edit {editAdmin.full_name}</div>
              <button className={styles.closeBtn} onClick={() => setEditAdmin(null)}><X size={16} /></button>
            </div>
            <div className={sStyles.editBody}>
              <div className={sStyles.field}>
                <label>Admin Level</label>
                <select className={sStyles.input} value={editAdmin.admin_level}
                  onChange={e => setEditAdmin(p => ({ ...p, admin_level: e.target.value }))}>
                  {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div className={sStyles.permsTitle}><Lock size={13} /> Permissions</div>
              <div className={sStyles.permsGrid}>
                {PERMS.map(p => (
                  <label key={p.key} className={sStyles.permCard}>
                    <input type="checkbox"
                      checked={editAdmin['can_manage_' + p.key]}
                      onChange={e => setEditAdmin(prev => ({ ...prev, ['can_manage_' + p.key]: e.target.checked }))}
                    />
                    <div>
                      <span className={sStyles.permLabel}>{p.label}</span>
                      <span className={sStyles.permDesc}>{p.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
              <div className={styles.modalActions}>
                <button className={styles.cancelBtn} onClick={() => setEditAdmin(null)}>Cancel</button>
                <button className={sStyles.saveBtn} onClick={handleUpdateAdmin} disabled={saving === 'edit'}>
                  {saving === 'edit' ? <><RefreshCw size={13} className={styles.spinning} /> Saving…</> : <><Save size={13} /> Save Changes</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Remove admin confirm ── */}
      {removeConfirm && (
        <ConfirmModal
          title="Remove Admin"
          message={`Remove admin access from "${removeConfirm.full_name}"? They will become a regular user.`}
          confirmLabel="Yes, Remove Admin"
          onConfirm={handleRemoveAdmin}
          onCancel={() => setRemoveConfirm(null)}
        />
      )}

      {toast && <div className={styles.toast}>{toast}</div>}

      {/* ── OTP reveal modal ── */}
      {createdOtp && (
        <div className={styles.backdrop}>
          <div className={sStyles.confirmModal}>
            <div className={sStyles.confirmHeader}>
              <ShieldCheck size={20} color="#10b981" />
              <span>Admin Created — Share OTP</span>
            </div>
            <p className={sStyles.confirmMsg}>
              Share these details with <strong>{createdOtp.name}</strong>. They log in using their email/phone and the OTP below as the password — they will then be prompted to set a permanent password.
            </p>
            <div className={sStyles.otpBlock}>
              <div className={sStyles.otpRow}>
                <span className={sStyles.otpLabel}>Login identifier</span>
                <span className={sStyles.otpValue}>{createdOtp.identifier}</span>
              </div>
              <div className={sStyles.otpRow}>
                <span className={sStyles.otpLabel}>Temporary Password (OTP)</span>
                <span className={sStyles.otpCode}>{createdOtp.otp}</span>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#9ca3af' }}>
              They enter this OTP in the <strong>Password</strong> field on the login page. After signing in they will be asked to set a new permanent password.
            </p>
            <div className={styles.modalActions}>
              <button className={sStyles.saveBtn} onClick={() => setCreatedOtp(null)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
