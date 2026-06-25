import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import {
  Users, Trash2, ShieldCheck, ShieldOff,
  RefreshCw, Search, CheckCircle2, X, Cpu, Bell, CloudSun,
} from 'lucide-react';
import styles from './Admin.module.css';

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 300) return null; // live
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function LastSeenCell({ last_seen }) {
  if (!last_seen) return <span className={styles.seenNever}>Never</span>;
  const diff = Math.floor((Date.now() - new Date(last_seen)) / 1000);
  if (diff < 300) return (
    <span className={styles.seenLive}>
      <span className={styles.liveDot} /> Live
    </span>
  );
  return (
    <span className={styles.seenAgo} title={new Date(last_seen).toLocaleString()}>
      {timeAgo(last_seen)}
    </span>
  );
}

function UserProfileModal({ userId, onClose, onUserUpdated }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/admin/users/${userId}/`)
      .then(({ data }) => { setProfile(data); onUserUpdated?.(data); })
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.detailModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.genHeader}>
          <span className={styles.genTitle}>
            {loading ? null : profile?.avatar_url
              ? <img src={profile.avatar_url} alt={profile?.full_name} className={styles.modalAvatarImg} />
              : <Users size={16} />
            }
            {loading ? 'Loading…' : profile?.full_name}
          </span>
          <button className={styles.closeBtn} onClick={onClose}><X size={15} /></button>
        </div>

        {loading ? (
          <div className={styles.genLoading}>Loading profile…</div>
        ) : !profile ? (
          <div className={styles.genLoading}>Failed to load.</div>
        ) : (
          <div className={styles.detailBody}>

            {/* Identity */}
            <div className={styles.detailSection}>
              <p className={styles.detailSectionTitle}>Account</p>
              <div className={styles.infoGrid}>
                {profile.email    && <div className={styles.infoItem}><span>Email</span><strong>{profile.email}</strong></div>}
                {profile.phone_number && <div className={styles.infoItem}><span>Phone</span><strong>{profile.phone_number}</strong></div>}
                <div className={styles.infoItem}><span>Joined</span><strong>{new Date(profile.created_at).toLocaleDateString()}</strong></div>
                <div className={styles.infoItem}><span>Status</span><strong>{profile.is_active ? 'Active' : 'Inactive'}</strong></div>
                <div className={styles.infoItem}><span>Last Seen</span><strong>{profile.last_seen ? new Date(profile.last_seen).toLocaleString() : 'Never'}</strong></div>
                <div className={styles.infoItem}><span>Role</span><strong>{profile.is_staff ? 'Admin' : 'User'}</strong></div>
                {profile.profile_updated_at && (
                  <div className={styles.infoItem} style={{gridColumn:'span 2', background:'#fffbeb', border:'1px solid #fde68a'}}>
                    <span>Profile Last Updated by User</span>
                    <strong style={{color:'#92400e'}}>{new Date(profile.profile_updated_at).toLocaleString()}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Farm Settings */}
            {profile.farm_settings && (
              <div className={styles.detailSection}>
                <p className={styles.detailSectionTitle}>Farm Settings</p>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}><span>Soil Type</span><strong>{profile.farm_settings.soil_type || '—'}</strong></div>
                  <div className={styles.infoItem}><span>Plant Type</span><strong>{profile.farm_settings.plant_type || '—'}</strong></div>
                  <div className={styles.infoItem}><span>Moisture Range</span><strong>{profile.farm_settings.moisture_min ?? '—'}% – {profile.farm_settings.moisture_max ?? '—'}%</strong></div>
                  <div className={styles.infoItem}><span>Irrigation</span><strong>{profile.farm_settings.irrigation_duration ?? '—'} min</strong></div>
                  <div className={styles.infoItem}><span>Weather Location</span><strong>{profile.farm_settings.admin_weather_location || profile.farm_settings.weather_location || '—'}</strong></div>
                  {profile.farm_settings.notes && <div className={styles.infoItem} style={{gridColumn:'span 2'}}><span>Notes</span><strong>{profile.farm_settings.notes}</strong></div>}
                </div>
              </div>
            )}

            {/* Devices */}
            <div className={styles.detailSection}>
              <p className={styles.detailSectionTitle}><Cpu size={11} style={{marginRight:4}} />Devices ({profile.devices.length})</p>
              {profile.devices.length === 0 ? (
                <p className={styles.seenNever}>No devices registered.</p>
              ) : (
                <div className={styles.infoGrid}>
                  {profile.devices.map((d) => (
                    <div key={d.id} className={styles.infoItem}>
                      <span>{d.device_name}</span>
                      <strong>{d.device_id}</strong>
                      <span style={{fontSize:'0.7rem',color: d.status==='Online'?'#10b981':'#9ca3af'}}>
                        {d.status} · {d.total_readings} readings
                        {d.crop_type ? ` · ${d.crop_type}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Notifications */}
            <div className={styles.detailSection}>
              <p className={styles.detailSectionTitle}><Bell size={11} style={{marginRight:4}} />Recent Notifications ({profile.notifications.length})</p>
              {profile.notifications.length === 0 ? (
                <p className={styles.seenNever}>No notifications.</p>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:'0.4rem'}}>
                  {profile.notifications.map((n, i) => (
                    <div key={i} className={styles.infoItem}>
                      <span>{new Date(n.created_at).toLocaleString()} · {n.type}{n.device_name ? ` · ${n.device_name}` : ''}</span>
                      <strong>{n.title}</strong>
                      <span style={{fontSize:'0.72rem',color:'#6b7280'}}>{n.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weather Activity */}
            {profile.recent_weather.length > 0 && (
              <div className={styles.detailSection}>
                <p className={styles.detailSectionTitle}><CloudSun size={11} style={{marginRight:4}} />Recent Weather Lookups</p>
                <div className={styles.infoGrid}>
                  {profile.recent_weather.map((w, i) => (
                    <div key={i} className={styles.infoItem}>
                      <span>{new Date(w.accessed_at).toLocaleString()}</span>
                      <strong>{w.location || '—'}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

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
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState('');
  const [confirm, setConfirm]   = useState(null);
  const [toast, setToast]       = useState('');
  const [showAll, setShowAll]   = useState(false);
  const [profileId, setProfileId] = useState(null);
  const PAGE = 5;

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const sortUsers = (list) => [...list].sort((a, b) => {
    // Active before inactive
    if (b.is_active !== a.is_active) return b.is_active - a.is_active;
    // Then newest joined first
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/users/admin/users/'); setUsers(sortUsers(data)); }
    catch { /* interceptor handles */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleActive = async (user) => {
    try {
      const { data } = await api.patch(`/users/admin/users/${user.id}/`, { is_active: !user.is_active });
      setUsers((prev) => sortUsers(prev.map((x) => x.id === user.id ? { ...x, is_active: data.is_active } : x)));
      showToast(`User ${data.is_active ? 'activated' : 'deactivated'}.`);
    } catch { showToast('Action failed.'); }
  };

  const handleDeleteUser = async (id) => {
    try {
      await api.delete(`/users/admin/users/${id}/`);
      setUsers((prev) => prev.filter((x) => x.id !== id));
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
              onChange={(e) => { setSearch(e.target.value); setShowAll(false); }}
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
                  <th>Role</th><th>Status</th><th>Joined</th><th>Last Seen</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(showAll ? filtered : filtered.slice(0, PAGE)).map((u) => (
                  <tr key={u.id} className={styles.clickableRow} onClick={() => setProfileId(u.id)}>
                    <td className={styles.nameCell}>
                      {u.avatar_url
                        ? <img src={u.avatar_url} alt={u.full_name} className={styles.avatarImg} />
                        : <div className={styles.avatar}>{u.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}</div>
                      }
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
                    <td className={styles.dateCell}>
                      <LastSeenCell last_seen={u.last_seen} />
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.iconBtn} title={u.is_active ? 'Deactivate' : 'Activate'} onClick={(e) => { e.stopPropagation(); handleToggleActive(u); }}>
                          {u.is_active ? <ShieldOff size={15} color="#f59e0b" /> : <ShieldCheck size={15} color="#10b981" />}
                        </button>
                        {!u.is_staff && (
                          <button className={styles.iconBtn} title="Delete user" onClick={(e) => { e.stopPropagation(); setConfirm({ id: u.id, name: u.full_name }); }}>
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
          {filtered.length > PAGE && (
            <button className={styles.viewMoreBtn} onClick={() => setShowAll(v => !v)}>
              {showAll ? 'Show less' : `View more (${filtered.length - PAGE} more)`}
            </button>
          )}
        </div>
      </div>

      {profileId && <UserProfileModal userId={profileId} onClose={() => setProfileId(null)}
        onUserUpdated={(updated) => setUsers(u => u.map(x => x.id === updated.id ? { ...x, full_name: updated.full_name, email: updated.email, phone_number: updated.phone_number } : x))}
      />}

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
