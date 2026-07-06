import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import { ShoppingCart, RefreshCw, Search, X, Phone, MapPin, Package, Zap, ChevronDown } from 'lucide-react';
import styles from './Admin.module.css';

const STATUS_COLORS = {
  pending:   { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  confirmed: { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
  shipped:   { bg: '#ede9fe', color: '#6d28d9', dot: '#8b5cf6' },
  delivered: { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
  cancelled: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
};

const KIT_META = {
  basic:    { label: 'Basic Kit',    price: 500000,   Icon: Package, color: '#22c55e', bg: '#dcfce7' },
  advanced: { label: 'Advanced Kit', price: 2000000,  Icon: Zap,     color: '#3b82f6', bg: '#dbeafe' },
};

const STATUSES = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const fmt = (n) => `UGX ${Number(n).toLocaleString()}`;

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.25rem 0.65rem', borderRadius: 999,
      fontSize: '0.72rem', fontWeight: 700,
      background: s.bg, color: s.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function OrderDetailModal({ order, onClose, onStatusChange }) {
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const kit = KIT_META[order.kit_type] || KIT_META.basic;

  const save = async (newStatus) => {
    setSaving(true);
    setOpen(false);
    try {
      await api.patch(`/orders/hardware/${order.id}/`, { status: newStatus });
      setStatus(newStatus);
      onStatusChange(order.id, newStatus);
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.detailModal} onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        {/* Header */}
        <div className={styles.genHeader}>
          <span className={styles.genTitle}>
            <ShoppingCart size={15} color="#2d7a4f" />
            Order #{order.id}
          </span>
          <button className={styles.closeBtn} onClick={onClose}><X size={15} /></button>
        </div>

        <div className={styles.detailBody}>
          {/* Kit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', background: kit.bg, borderRadius: 12 }}>
            <kit.Icon size={22} color={kit.color} />
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>{kit.label} × {order.quantity}</p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: kit.color, fontWeight: 700 }}>{fmt(order.total_ugx)}</p>
            </div>
            <div style={{ marginLeft: 'auto' }}><StatusBadge status={status} /></div>
          </div>

          {/* Customer */}
          <div className={styles.detailSection}>
            <p className={styles.detailSectionTitle}>Customer</p>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}><span>Name</span><strong>{order.name}</strong></div>
              <div className={styles.infoItem}><span>Phone</span><strong>{order.phone}</strong></div>
              {order.email && <div className={styles.infoItem}><span>Email</span><strong>{order.email}</strong></div>}
              {order.location && <div className={styles.infoItem}><span>Location</span><strong>{order.location}</strong></div>}
              <div className={styles.infoItem}><span>Ordered</span><strong>{new Date(order.created_at).toLocaleString()}</strong></div>
            </div>
          </div>

          {order.notes && (
            <div className={styles.detailSection}>
              <p className={styles.detailSectionTitle}>Notes</p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#374151', background: '#f9fafb', padding: '0.65rem 0.85rem', borderRadius: 8 }}>{order.notes}</p>
            </div>
          )}

          {/* Status update */}
          <div className={styles.detailSection}>
            <p className={styles.detailSectionTitle}>Update Status</p>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setOpen(v => !v)}
                disabled={saving}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '0.6rem 0.85rem',
                  background: '#fff', border: '1.5px solid #d1d5db', borderRadius: 8,
                  fontSize: '0.875rem', fontWeight: 600, color: '#374151',
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                <StatusBadge status={status} />
                <ChevronDown size={14} />
              </button>
              {open && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                  background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 10,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 10,
                  padding: '0.3rem',
                }}>
                  {STATUSES.filter(s => s !== 'all').map(s => (
                    <button key={s} onClick={() => save(s)} style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      width: '100%', padding: '0.5rem 0.65rem', border: 'none',
                      background: s === status ? '#f0fdf4' : 'none',
                      borderRadius: 7, cursor: 'pointer', textAlign: 'left',
                    }}>
                      <StatusBadge status={s} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/256${order.phone.replace(/^0/, '')}?text=${encodeURIComponent(`Hi ${order.name}, your EducFarm order #${order.id} (${kit.label} ×${order.quantity}) status: ${status.toUpperCase()}. Total: ${fmt(order.total_ugx)}.`)}`}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
              padding: '0.6rem 1.1rem', background: '#25d366', color: '#fff',
              borderRadius: 9, fontWeight: 700, textDecoration: 'none', fontSize: '0.85rem',
              alignSelf: 'flex-start',
            }}
          >
            💬 WhatsApp Customer
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');
  const [selected, setSelected] = useState(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders/hardware/list/');
      setOrders(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleStatusChange = (id, newStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    if (selected?.id === id) setSelected(o => ({ ...o, status: newStatus }));
  };

  const filtered = orders.filter(o => {
    const matchStatus = filter === 'all' || o.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || o.name.toLowerCase().includes(q) || o.phone.includes(q) || o.location?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // Stats
  const total     = orders.length;
  const pending   = orders.filter(o => o.status === 'pending').length;
  const confirmed = orders.filter(o => o.status === 'confirmed').length;
  const revenue   = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total_ugx, 0);

  return (
    <DashboardLayout>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Hardware Orders</h1>
            <p className={styles.subtitle}>Manage kit orders placed by customers</p>
          </div>
          <button className={styles.refreshBtn} onClick={fetch_} disabled={loading}>
            <RefreshCw size={14} className={loading ? styles.spinning : ''} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          {[
            { label: 'Total Orders',  value: total,     color: '#2d7a4f' },
            { label: 'Pending',       value: pending,   color: '#f59e0b' },
            { label: 'Confirmed',     value: confirmed, color: '#3b82f6' },
            { label: 'Total Revenue', value: fmt(revenue), color: '#6d28d9', small: true },
          ].map(({ label, value, color, small }) => (
            <div key={label} className={styles.statCard}>
              <ShoppingCart size={18} color={color} />
              <div>
                <span className={styles.statVal} style={{ fontSize: small ? '0.85rem' : undefined, color }}>{loading ? '—' : value}</span>
                <span className={styles.statLabel}>{label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={14} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search name, phone, location…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.filterGroup}>
            {STATUSES.map(s => (
              <button
                key={s}
                className={`${styles.filterBtn} ${filter === s ? styles.filterActive : ''}`}
                onClick={() => setFilter(s)}
              >
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                {s !== 'all' && (
                  <span style={{
                    marginLeft: 4, background: STATUS_COLORS[s]?.dot,
                    color: '#fff', fontSize: '0.6rem', fontWeight: 800,
                    padding: '0 5px', borderRadius: 999,
                  }}>
                    {orders.filter(o => o.status === s).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableWrap}>
          {loading ? (
            <div className={styles.empty}>Loading orders…</div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>No orders found.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Kit</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => {
                  const kit = KIT_META[order.kit_type] || KIT_META.basic;
                  return (
                    <tr key={order.id} className={`${styles.clickableRow}`} onClick={() => setSelected(order)}>
                      <td className={styles.dateCell}>#{order.id}</td>
                      <td>
                        <div className={styles.contactCell}>
                          <span style={{ fontWeight: 600, color: '#111827' }}>{order.name}</span>
                          <span className={styles.phone} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Phone size={10} /> {order.phone}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          padding: '0.2rem 0.6rem', borderRadius: 999,
                          background: kit.bg, color: kit.color,
                          fontSize: '0.72rem', fontWeight: 700,
                        }}>
                          <kit.Icon size={11} /> {kit.label}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: '#374151' }}>{order.quantity}</td>
                      <td style={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>{fmt(order.total_ugx)}</td>
                      <td className={styles.dateCell}>
                        {order.location
                          ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={10} />{order.location}</span>
                          : <span style={{ color: '#d1d5db' }}>—</span>}
                      </td>
                      <td><StatusBadge status={order.status} /></td>
                      <td className={styles.dateCell}>{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </DashboardLayout>
  );
}
