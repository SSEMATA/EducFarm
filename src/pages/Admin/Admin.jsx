import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import {
  Users, Trash2, ShieldCheck, ShieldOff,
  RefreshCw, Search, CheckCircle2,
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

export default function Admin() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch]   = useState('');
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast]     = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/admin/users/'); setUsers(data); }
    catch { /* interceptor handles */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleActive = async (user) => {
    try {
      const { data } = await api.patch(`/admin/users/${user.id}/`, { is_active: !user.is_active });
      setUsers((u) => u.map((x) => x.id === user.id ? { ...x, is_active: data.is_active } : x));
      showToast(`User ${data.is_active ? 'activated' : 'deactivated'}.`);
    } catch { showToast('Action failed.'); }
  };

  const handleDeleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}/`);
      setUsers((u) => u.filter((x) => x.id !== id));
      showToast('User deleted.');
    } catch { showToast('Delete failed.'); }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone_number?.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Admin Panel</h1>
            <p className={styles.subtitle}>Manage all users across the platform</p>
          </div>
          <button className={styles.refreshBtn} onClick={fetchUsers} disabled={loading}>
            <RefreshCw size={14} className={loading ? styles.spinning : ''} /> Refresh
          </button>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <Users size={20} color="#2d7a4f" />
            <div><span className={styles.statVal}>{users.length}</span><span className={styles.statLabel}>Total Users</span></div>
          </div>
          <div className={styles.statCard}>
            <CheckCircle2 size={20} color="#10b981" />
            <div><span className={styles.statVal}>{users.filter((u) => u.is_active).length}</span><span className={styles.statLabel}>Active Users</span></div>
          </div>
          <div className={styles.statCard}>
            <ShieldOff size={20} color="#f59e0b" />
            <div><span className={styles.statVal}>{users.filter((u) => !u.is_active).length}</span><span className={styles.statLabel}>Inactive Users</span></div>
          </div>
          <div className={styles.statCard}>
            <ShieldCheck size={20} color="#6366f1" />
            <div><span className={styles.statVal}>{users.filter((u) => u.is_staff).length}</span><span className={styles.statLabel}>Admins</span></div>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={14} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search users…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.tableWrap}>
          {loading ? (
            <div className={styles.empty}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>No users found.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th><th>Contact</th><th>Devices</th>
                  <th>Role</th><th>Status</th><th>Joined</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td className={styles.nameCell}>
                      <div className={styles.avatar}>
                        {u.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                      </div>
                      <span>{u.full_name}</span>
                    </td>
                    <td className={styles.contactCell}>
                      {u.email && <span>{u.email}</span>}
                      {u.phone_number && <span className={styles.phone}>{u.phone_number}</span>}
                    </td>
                    <td><span className={styles.countBadge}>{u.device_count}</span></td>
                    <td>
                      {u.is_staff
                        ? <span className={styles.badgeAdmin}>Admin</span>
                        : <span className={styles.badgeUser}>User</span>}
                    </td>
                    <td>
                      {u.is_active
                        ? <span className={styles.badgeOnline}>Active</span>
                        : <span className={styles.badgeOffline}>Inactive</span>}
                    </td>
                    <td className={styles.dateCell}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.iconBtn} title={u.is_active ? 'Deactivate' : 'Activate'} onClick={() => handleToggleActive(u)}>
                          {u.is_active ? <ShieldOff size={15} color="#f59e0b" /> : <ShieldCheck size={15} color="#10b981" />}
                        </button>
                        {!u.is_staff && (
                          <button className={styles.iconBtn} title="Delete user" onClick={() => setConfirm({ id: u.id, name: u.full_name })}>
                            <Trash2 size={15} color="#ef4444" />
                          </button>
                        )}
                      </div>
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
          onConfirm={() => { handleDeleteUser(confirm.id); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
        />
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </DashboardLayout>
  );
}
