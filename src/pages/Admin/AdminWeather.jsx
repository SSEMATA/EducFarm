import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import {
  CloudSun, RefreshCw, CheckCircle2, XCircle, AlertTriangle,
  Activity, Users, ToggleLeft, ToggleRight, MapPin, Clock,
  Search, Wifi, WifiOff, Key,
} from 'lucide-react';
import styles from './Admin.module.css';
import wStyles from './AdminWeather.module.css';

export default function AdminWeather() {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [toast, setToast]       = useState('');
  const [toggling, setToggling] = useState(null);
  const [error, setError]       = useState('');
  const [showAllLogs, setShowAllLogs]   = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const PAGE = 5;

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: d } = await api.get('/users/admin/weather/');
      setData(d);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load. Try refreshing.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleAccess = async (user, value) => {
    setToggling(user.id);
    try {
      await api.patch('/users/admin/weather/', { user_id: user.id, weather_access: value });
      setData(d => ({
        ...d,
        user_access: d.user_access.map(u =>
          u.id === user.id ? { ...u, weather_access: value } : u
        ),
      }));
      showToast(`Weather ${value ? 'enabled' : 'disabled'} for ${user.full_name}.`);
    } catch { showToast('Failed to update access.'); }
    finally { setToggling(null); }
  };

  const filteredLogs = (data?.recent_logs || []).filter(log => {
    const q = logSearch.toLowerCase();
    return (
      log.user_name?.toLowerCase().includes(q) ||
      log.user_email?.toLowerCase().includes(q) ||
      log.location?.toLowerCase().includes(q)
    );
  });
  const visibleLogs = showAllLogs ? filteredLogs : filteredLogs.slice(0, PAGE);

  const filteredUsers = (data?.user_access || []).filter(u => {
    const q = search.toLowerCase();
    return u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });
  const visibleUsers = showAllUsers ? filteredUsers : filteredUsers.slice(0, PAGE);

  const apiStatus = !data ? null
    : data.api_working   ? { label: 'Working',               color: '#10b981', Icon: CheckCircle2  }
    : data.api_key_set   ? { label: 'Key set but failing',   color: '#ef4444', Icon: XCircle       }
    :                      { label: 'API key not configured', color: '#f59e0b', Icon: AlertTriangle };

  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Weather API</h1>
            <p className={styles.subtitle}>Monitor API status, usage logs, and control per-user access</p>
          </div>
          <button className={styles.refreshBtn} onClick={fetchData} disabled={loading}>
            <RefreshCw size={14} className={loading ? styles.spinning : ''} /> Refresh
          </button>
        </div>

        {loading && <div className={wStyles.stateBox}>Loading…</div>}
        {!loading && error && <div className={wStyles.stateBox} style={{ color: '#ef4444' }}>{error}</div>}

        {!loading && data && apiStatus && (
          <>
            {/* ── API Status card ── */}
            <div className={wStyles.statusCard}>
              <div className={wStyles.statusLeft}>
                <CloudSun size={36} color={apiStatus.color} />
                <div>
                  <div className={wStyles.statusTitle}>OpenWeatherMap API</div>
                  <div className={wStyles.statusBadge} style={{ color: apiStatus.color }}>
                    <apiStatus.Icon size={14} /> {apiStatus.label}
                  </div>
                  {data.api_error && <div className={wStyles.statusError}>{data.api_error}</div>}
                </div>
              </div>
              <div className={wStyles.statusRight}>
                <div className={wStyles.keyRow}>
                  <Key size={13} color="#6b7280" />
                  <span>API Key: <code className={wStyles.keyCode}>{data.api_key_hint}</code></span>
                </div>
                <p className={wStyles.keyNote}>
                  Update <code>OPENWEATHER_API_KEY</code> in Railway environment variables to change the key.
                </p>
              </div>
            </div>

            {/* ── Stats ── */}
            <div className={wStyles.statsGrid}>
              <div className={wStyles.statCard}>
                <Activity size={20} color="#6366f1" />
                <div><span className={wStyles.statVal}>{data.stats.total}</span><span className={wStyles.statLabel}>Total Requests</span></div>
              </div>
              <div className={wStyles.statCard}>
                <Clock size={20} color="#10b981" />
                <div><span className={wStyles.statVal}>{data.stats.today}</span><span className={wStyles.statLabel}>Today</span></div>
              </div>
              <div className={wStyles.statCard}>
                <CloudSun size={20} color="#3b82f6" />
                <div><span className={wStyles.statVal}>{data.stats.week}</span><span className={wStyles.statLabel}>This Week</span></div>
              </div>
              <div className={wStyles.statCard}>
                <Users size={20} color="#f59e0b" />
                <div>
                  <span className={wStyles.statVal}>{data.user_access.filter(u => u.weather_access).length}</span>
                  <span className={wStyles.statLabel}>Users with Access</span>
                </div>
              </div>
            </div>

            {/* ── Recent API Calls ── */}
            <div className={wStyles.section}>
              <div className={wStyles.sectionHeader}>
                <div className={wStyles.sectionTitle} style={{ padding: 0, borderBottom: 'none' }}>
                  <Activity size={15} /> Recent API Calls
                </div>
                <div className={styles.searchWrap}>
                  <Search size={13} className={styles.searchIcon} />
                  <input
                    className={styles.searchInput}
                    placeholder="Search by user, email, location…"
                    value={logSearch}
                    onChange={e => { setLogSearch(e.target.value); setShowAllLogs(false); }}
                  />
                </div>
              </div>
              {filteredLogs.length === 0 ? (
                <div className={wStyles.emptyState}>
                  <CloudSun size={32} color="#d1d5db" />
                  <p>{logSearch ? 'No matching logs.' : 'No weather requests yet. Calls will appear here once users open the Irrigation Planner.'}</p>
                </div>
              ) : (
                <>
                  <div className={wStyles.logList}>
                    {visibleLogs.map((log, i) => (
                      <div key={i} className={wStyles.logRow}>
                        {log.avatar_url
                          ? <img src={log.avatar_url} alt={log.user_name} className={wStyles.logAvatarImg} />
                          : <div className={wStyles.logAvatar}>{log.user_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}</div>
                        }
                        <div className={wStyles.logInfo}>
                          <span className={wStyles.logName}>{log.user_name}</span>
                          <span className={wStyles.logEmail}>{log.user_email}</span>
                        </div>
                        <div className={wStyles.logLocation}>
                          <MapPin size={12} color="#6b7280" />
                          <span>{log.location || (log.lat != null ? `${log.lat.toFixed(2)}, ${log.lon.toFixed(2)}` : '—')}</span>
                        </div>
                        <div className={wStyles.logTime}>
                          <Clock size={11} color="#9ca3af" />
                          <span>{new Date(log.accessed_at).toLocaleString()}</span>
                        </div>
                        <div className={wStyles.logStatus}>
                          {log.success
                            ? <span className={wStyles.successDot}><Wifi size={13} /> OK</span>
                            : <span className={wStyles.failDot}><WifiOff size={13} /> Failed</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  {filteredLogs.length > PAGE && (
                    <button className={wStyles.viewMoreBtn} onClick={() => setShowAllLogs(v => !v)}>
                      {showAllLogs ? 'Show less' : `View more (${filteredLogs.length - PAGE} more)`}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* ── User Access Control ── */}
            <div className={wStyles.section}>
              <div className={wStyles.sectionHeader}>
                <div className={wStyles.sectionTitle} style={{ padding: 0, borderBottom: 'none' }}>
                  <Users size={15} /> User Weather Access
                </div>
                <div className={styles.searchWrap}>
                  <Search size={13} className={styles.searchIcon} />
                  <input
                    className={styles.searchInput}
                    placeholder="Search users…"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setShowAllUsers(false); }}
                  />
                </div>
              </div>
              {filteredUsers.length === 0 ? (
                <div className={wStyles.emptyState}><p>No users found.</p></div>
              ) : (
                <>
                <div className={wStyles.userList}>
                  {visibleUsers.map(u => (
                    <div key={u.id} className={wStyles.userRow}>
                      {u.avatar_url
                        ? <img src={u.avatar_url} alt={u.full_name} className={wStyles.logAvatarImg} />
                        : <div className={wStyles.logAvatar}>{u.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}</div>
                      }
                      <div className={wStyles.logInfo}>
                        <span className={wStyles.logName}>{u.full_name}</span>
                        <span className={wStyles.logEmail}>{u.email}</span>
                      </div>
                      <div className={wStyles.userMeta}>
                        <span className={wStyles.usageCount}><Activity size={11} /> {u.usage_count} requests</span>
                        <span className={wStyles.lastUsed}>
                          {u.last_used
                            ? <><Clock size={11} /> {new Date(u.last_used).toLocaleDateString()}</>
                            : 'Never used'}
                        </span>
                      </div>
                      <button
                        className={`${wStyles.toggleBtn} ${u.weather_access ? wStyles.toggleOn : wStyles.toggleOff}`}
                        onClick={() => toggleAccess(u, !u.weather_access)}
                        disabled={toggling === u.id}
                      >
                        {toggling === u.id
                          ? <RefreshCw size={14} className={styles.spinning} />
                          : u.weather_access
                          ? <><ToggleRight size={16} /> Enabled</>
                          : <><ToggleLeft size={16} /> Disabled</>}
                      </button>
                    </div>
                  ))}
                </div>
                {filteredUsers.length > PAGE && (
                  <button className={wStyles.viewMoreBtn} onClick={() => setShowAllUsers(v => !v)}>
                    {showAllUsers ? 'Show less' : `View more (${filteredUsers.length - PAGE} more)`}
                  </button>
                )}
                </>
              )}
            </div>
          </>
        )}
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
    </DashboardLayout>
  );
}
