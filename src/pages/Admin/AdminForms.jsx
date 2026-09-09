import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import { FileText, RefreshCw, Search, X, Phone, MapPin, Mail, Globe, TrendingUp, Handshake, MessageSquare } from 'lucide-react';
import styles from './Admin.module.css';

const TABS = [
  { key: 'investor',    label: 'Investor Applications', Icon: TrendingUp,  color: '#2d7a4f', bg: '#dcfce7' },
  { key: 'partnership', label: 'Partnership Applications', Icon: Handshake, color: '#3b82f6', bg: '#dbeafe' },
  { key: 'business',   label: 'Business Requests',     Icon: MessageSquare, color: '#8b5cf6', bg: '#ede9fe' },
];

function DetailModal({ item, tab, onClose }) {
  const cfg = TABS.find(t => t.key === tab);
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.detailModal} onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className={styles.genHeader}>
          <span className={styles.genTitle}><cfg.Icon size={15} color={cfg.color} /> {item.name}</span>
          <button className={styles.closeBtn} onClick={onClose}><X size={15} /></button>
        </div>
        <div className={styles.detailBody}>
          <div className={styles.detailSection}>
            <p className={styles.detailSectionTitle}>Contact</p>
            <div className={styles.infoGrid}>
              {item.organisation && <div className={styles.infoItem}><span>Organisation</span><strong>{item.organisation}</strong></div>}
              <div className={styles.infoItem}><span>Email</span><strong>{item.email}</strong></div>
              {item.phone && <div className={styles.infoItem}><span>Phone</span><strong>{item.phone}</strong></div>}
              <div className={styles.infoItem}><span>Location</span><strong>{item.location}, {item.village_parish}, {item.country}</strong></div>
              <div className={styles.infoItem}><span>Submitted</span><strong>{new Date(item.created_at).toLocaleString()}</strong></div>
            </div>
          </div>

          {tab === 'investor' && (
            <div className={styles.detailSection}>
              <p className={styles.detailSectionTitle}>Investment Details</p>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}><span>Amount</span><strong>{item.currency} {Number(item.amount).toLocaleString()}</strong></div>
                <div className={styles.infoItem}><span>Source</span><strong>{item.source}</strong></div>
                <div className={styles.infoItem}><span>Timeline</span><strong>{item.timeline}</strong></div>
              </div>
              {item.experience && <div className={styles.infoItem} style={{ marginTop: '0.5rem' }}><span>Experience</span><strong style={{ whiteSpace: 'pre-wrap' }}>{item.experience}</strong></div>}
              {item.message && <div className={styles.infoItem} style={{ marginTop: '0.5rem' }}><span>Message</span><strong style={{ whiteSpace: 'pre-wrap' }}>{item.message}</strong></div>}
            </div>
          )}

          {tab === 'partnership' && (
            <div className={styles.detailSection}>
              <p className={styles.detailSectionTitle}>Partnership Details</p>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}><span>Partner Type</span><strong>{item.partner_type}</strong></div>
                {item.business_area && <div className={styles.infoItem}><span>Business Area</span><strong>{item.business_area}</strong></div>}
                {item.markets && <div className={styles.infoItem}><span>Markets</span><strong>{item.markets}</strong></div>}
                {item.website && <div className={styles.infoItem}><span>Website</span><strong>{item.website}</strong></div>}
              </div>
              {item.products && <div className={styles.infoItem} style={{ marginTop: '0.5rem' }}><span>Products / Services</span><strong style={{ whiteSpace: 'pre-wrap' }}>{item.products}</strong></div>}
              {item.capacity && <div className={styles.infoItem} style={{ marginTop: '0.5rem' }}><span>Capacity</span><strong style={{ whiteSpace: 'pre-wrap' }}>{item.capacity}</strong></div>}
              {item.interest && <div className={styles.infoItem} style={{ marginTop: '0.5rem' }}><span>Partnership Interest</span><strong style={{ whiteSpace: 'pre-wrap' }}>{item.interest}</strong></div>}
              {item.message && <div className={styles.infoItem} style={{ marginTop: '0.5rem' }}><span>Message</span><strong style={{ whiteSpace: 'pre-wrap' }}>{item.message}</strong></div>}
            </div>
          )}

          {tab === 'business' && (
            <div className={styles.detailSection}>
              <p className={styles.detailSectionTitle}>Request Details</p>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}><span>Request Type</span><strong>{item.request_type}</strong></div>
              </div>
              {item.message && <div className={styles.infoItem} style={{ marginTop: '0.5rem' }}><span>Message</span><strong style={{ whiteSpace: 'pre-wrap' }}>{item.message}</strong></div>}
            </div>
          )}

          {item.email && (
            <a href={`mailto:${item.email}`} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
              padding: '0.6rem 1.1rem', background: '#2d7a4f', color: '#fff',
              borderRadius: 9, fontWeight: 700, textDecoration: 'none', fontSize: '0.85rem', alignSelf: 'flex-start',
            }}>
              <Mail size={14} /> Reply via Email
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminForms() {
  const [tab, setTab]         = useState('investor');
  const [data, setData]       = useState({ investor: [], partnership: [], business: [] });
  const [loading, setLoading] = useState(false);
  const [search, setSearch]   = useState('');
  const [selected, setSelected] = useState(null);

  const ENDPOINTS = {
    investor:    '/investor-applications/list/',
    partnership: '/partnership-applications/list/',
    business:    '/business-requests/list/',
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [inv, par, bus] = await Promise.all([
        api.get(ENDPOINTS.investor),
        api.get(ENDPOINTS.partnership),
        api.get(ENDPOINTS.business),
      ]);
      setData({ investor: inv.data, partnership: par.data, business: bus.data });
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const rows = data[tab].filter(r => {
    const q = search.toLowerCase();
    return !q || r.name?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q) || r.organisation?.toLowerCase().includes(q);
  });

  const cfg = TABS.find(t => t.key === tab);

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Submitted Forms</h1>
            <p className={styles.subtitle}>Investor applications, partnership requests, and business enquiries</p>
          </div>
          <button className={styles.refreshBtn} onClick={fetchAll} disabled={loading}>
            <RefreshCw size={14} className={loading ? styles.spinning : ''} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          {TABS.map(({ key, label, Icon, color }) => (
            <div key={key} className={styles.statCard}>
              <Icon size={18} color={color} />
              <div>
                <span className={styles.statVal} style={{ color }}>{loading ? '—' : data[key].length}</span>
                <span className={styles.statLabel}>{label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs + Search */}
        <div className={styles.toolbar}>
          <div className={styles.tabs}>
            {TABS.map(({ key, label, Icon }) => (
              <button key={key} className={`${styles.tab} ${tab === key ? styles.tabActive : ''}`} onClick={() => { setTab(key); setSearch(''); }}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
          <div className={styles.searchWrap}>
            <Search size={14} className={styles.searchIcon} />
            <input className={styles.searchInput} placeholder="Search name, email, org…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableWrap}>
          {loading ? (
            <div className={styles.empty}>Loading…</div>
          ) : rows.length === 0 ? (
            <div className={styles.empty}>No {cfg.label.toLowerCase()} found.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Location</th>
                  {tab === 'investor'    && <><th>Amount</th><th>Timeline</th></>}
                  {tab === 'partnership' && <><th>Partner Type</th><th>Business Area</th></>}
                  {tab === 'business'   && <th>Request Type</th>}
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className={styles.clickableRow} onClick={() => setSelected(r)}>
                    <td className={styles.dateCell}>#{r.id}</td>
                    <td>
                      <div className={styles.contactCell}>
                        <span style={{ fontWeight: 600, color: '#111827' }}>{r.name}</span>
                        {r.organisation && <span className={styles.phone}>{r.organisation}</span>}
                      </div>
                    </td>
                    <td className={styles.dateCell}><span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Mail size={10} />{r.email}</span></td>
                    <td className={styles.dateCell}><span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={10} />{r.location}, {r.country}</span></td>
                    {tab === 'investor'    && <><td style={{ fontWeight: 700, color: '#2d7a4f' }}>{r.currency} {Number(r.amount).toLocaleString()}</td><td className={styles.dateCell}>{r.timeline}</td></>}
                    {tab === 'partnership' && <><td><span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.6rem', borderRadius: 999, background: cfg.bg, color: cfg.color, fontSize: '0.72rem', fontWeight: 700 }}>{r.partner_type}</span></td><td className={styles.dateCell}>{r.business_area || '—'}</td></>}
                    {tab === 'business'   && <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.6rem', borderRadius: 999, background: cfg.bg, color: cfg.color, fontSize: '0.72rem', fontWeight: 700 }}>{r.request_type}</span></td>}
                    <td className={styles.dateCell}>{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selected && <DetailModal item={selected} tab={tab} onClose={() => setSelected(null)} />}
    </DashboardLayout>
  );
}
