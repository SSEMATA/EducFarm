import { useState } from 'react';
import { X, ShoppingCart, Plus, Minus, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const ORDER_URL = `${import.meta.env.VITE_API_URL}/api/orders/hardware/`;

const KITS = [
  {
    id: 'basic',
    name: 'Basic Kit',
    price: 500000,
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.07)',
    border: 'rgba(34,197,94,0.25)',
    badge: null,
    features: ['Auto pump by soil moisture', 'Temp & humidity sensing', 'Water tank tracking', 'Works offline'],
    missing: ['No app / remote access', 'No SMS or call alerts', 'No display', 'No GPS'],
  },
  {
    id: 'advanced',
    name: 'Advanced Kit',
    price: 2000000,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.07)',
    border: 'rgba(59,130,246,0.3)',
    badge: 'Most Popular',
    features: ['Everything in Basic', 'Live app dashboard', 'SMS & call alerts', 'TFT display screen', 'GPS tracking', 'Weather integration', 'Remote pump control'],
    missing: [],
  },
];

const fmt = (n) => `UGX ${n.toLocaleString()}`;

export default function ShopModal({ onClose }) {
  const [cart, setCart]     = useState({ basic: 0, advanced: 0 });
  const [step, setStep]     = useState('shop');
  const [form, setForm]     = useState({ name: '', phone: '', email: '', location: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]   = useState('');
  const [result, setResult] = useState(null);

  const totalItems = cart.basic + cart.advanced;
  const totalPrice = cart.basic * 500000 + cart.advanced * 2000000;
  const adjust = (id, d) => setCart(c => ({ ...c, [id]: Math.max(0, Math.min(10, c[id] + d)) }));

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      let lastResult = null;
      for (const kit of KITS) {
        if (cart[kit.id] === 0) continue;
        const { data } = await axios.post(ORDER_URL, {
          name: form.name, phone: form.phone, email: form.email,
          location: form.location, notes: form.notes,
          kit_type: kit.id, quantity: cart[kit.id],
        });
        lastResult = data;
      }
      setResult(lastResult);
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || err.message || 'Order failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0.75rem',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#0f2e1a', border: '1px solid #2d7a4f', borderRadius: 18,
        width: '100%', maxWidth: step === 'shop' ? 680 : 460,
        /* never taller than viewport — content fits, no scroll */
        maxHeight: 'calc(100vh - 1.5rem)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', position: 'relative',
      }}>

        {/* close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 10, right: 10, zIndex: 2,
          background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 7,
          color: '#9ca3af', cursor: 'pointer', padding: '4px 6px', display: 'flex',
        }}><X size={14} /></button>

        {/* only scroll if truly needed on tiny screens */}
        <div style={{ overflowY: 'auto', padding: '1.1rem 1.25rem 1.25rem' }}>

          {/* ── SHOP ── */}
          {step === 'shop' && (<>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
              <ShoppingCart size={15} color="#4ade80" />
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>Order Hardware Kit</span>
            </div>
            <p style={{ margin: '0 0 0.9rem', color: '#6b7280', fontSize: '0.7rem' }}>
              Ships across Uganda · We confirm by phone
            </p>

            {/* cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' }}>
              {KITS.map(({ id, name, price, color, bg, border, badge, features, missing }) => (
                <div key={id} style={{
                  background: bg, border: `1.5px solid ${cart[id] > 0 ? color : border}`,
                  borderRadius: 12, padding: '0.75rem',
                  display: 'flex', flexDirection: 'column', gap: '0.45rem',
                  position: 'relative',
                  boxShadow: cart[id] > 0 ? `0 0 0 1px ${color}30` : 'none',
                  transition: 'border-color 0.2s',
                }}>
                  {badge && (
                    <span style={{
                      position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)',
                      background: color, color: '#0f2e1a', fontSize: '0.58rem', fontWeight: 800,
                      padding: '1px 8px', borderRadius: 999, whiteSpace: 'nowrap',
                    }}>{badge}</span>
                  )}

                  {/* name + price */}
                  <div>
                    <p style={{ margin: 0, color: '#fff', fontWeight: 700, fontSize: '0.82rem' }}>{name}</p>
                    <p style={{ margin: '3px 0 0', color, fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em' }}>
                      {fmt(price)}
                    </p>
                  </div>

                  {/* features */}
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {features.map(f => (
                      <li key={f} style={{ display: 'flex', gap: '0.3rem', fontSize: '0.67rem', color: '#d1fae5', lineHeight: 1.35 }}>
                        <span style={{ color, flexShrink: 0 }}>✓</span>{f}
                      </li>
                    ))}
                    {missing.map(f => (
                      <li key={f} style={{ display: 'flex', gap: '0.3rem', fontSize: '0.65rem', color: '#374151', lineHeight: 1.35 }}>
                        <span style={{ flexShrink: 0 }}>✕</span>{f}
                      </li>
                    ))}
                  </ul>

                  {/* qty */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginTop: 'auto', paddingTop: '0.45rem',
                    borderTop: `1px solid ${border}`,
                  }}>
                    <span style={{ color: '#6b7280', fontSize: '0.65rem' }}>Qty</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <button onClick={() => adjust(id, -1)} style={qBtn}><Minus size={10} /></button>
                      <span style={{ color: '#fff', fontWeight: 700, minWidth: 16, textAlign: 'center', fontSize: '0.82rem' }}>{cart[id]}</span>
                      <button onClick={() => adjust(id, +1)} style={qBtn}><Plus size={10} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* total + cta */}
            <div style={{ borderTop: '1px solid #1a4a2e', paddingTop: '0.75rem', marginTop: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                  {totalItems === 0 ? 'No items selected' : `${totalItems} item${totalItems !== 1 ? 's' : ''}`}
                </span>
                <span style={{ color: '#4ade80', fontWeight: 800, fontSize: '0.95rem' }}>{fmt(totalPrice)}</span>
              </div>
              <button disabled={totalItems === 0} onClick={() => setStep('form')} style={{
                width: '100%', padding: '0.65rem', borderRadius: 9, border: 'none',
                background: totalItems === 0 ? '#1a4a2e' : '#4ade80',
                color: totalItems === 0 ? '#4b5563' : '#0f2e1a',
                fontWeight: 700, fontSize: '0.85rem',
                cursor: totalItems === 0 ? 'not-allowed' : 'pointer',
              }}>
                {totalItems === 0 ? 'Select a kit to continue' : 'Proceed to Order →'}
              </button>
            </div>
          </>)}

          {/* ── FORM ── */}
          {step === 'form' && (<>
            <button onClick={() => setStep('shop')} style={{ background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer', marginBottom: '0.75rem', padding: 0, fontSize: '0.78rem' }}>
              ← Back
            </button>
            <p style={{ margin: '0 0 0.85rem', color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>Your Details</p>

            <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {[
                { key: 'name',     label: 'Full Name *',       type: 'text',  placeholder: 'Your full name',       required: true  },
                { key: 'phone',    label: 'Phone *',           type: 'tel',   placeholder: '0786023858',           required: true  },
                { key: 'email',    label: 'Email',             type: 'email', placeholder: 'your@email.com',       required: false },
                { key: 'location', label: 'Delivery Location', type: 'text',  placeholder: 'Town / district',      required: false },
                { key: 'notes',    label: 'Notes',             type: 'text',  placeholder: 'Any special requests', required: false },
              ].map(({ key, label, type, placeholder, required }) => (
                <div key={key}>
                  <label style={{ color: '#9ca3af', fontSize: '0.68rem', display: 'block', marginBottom: 2 }}>{label}</label>
                  <input
                    type={type} placeholder={placeholder} required={required}
                    value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{
                      width: '100%', padding: '0.5rem 0.7rem', borderRadius: 7, boxSizing: 'border-box',
                      background: '#1a4a2e', border: '1px solid #2d7a4f', color: '#fff',
                      fontSize: '0.82rem', outline: 'none',
                    }}
                  />
                </div>
              ))}

              {/* summary */}
              <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: 8, padding: '0.6rem' }}>
                {KITS.filter(k => cart[k.id] > 0).map(k => (
                  <div key={k.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#d1fae5', fontSize: '0.75rem', marginBottom: 2 }}>
                    <span>{k.name} × {cart[k.id]}</span>
                    <span>{fmt(k.price * cart[k.id])}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ade80', fontWeight: 800, borderTop: '1px solid rgba(74,222,128,0.15)', paddingTop: '0.35rem', marginTop: '0.3rem', fontSize: '0.8rem' }}>
                  <span>Total</span><span>{fmt(totalPrice)}</span>
                </div>
              </div>

              {error && <p style={{ color: '#f87171', fontSize: '0.72rem', margin: 0 }}>{error}</p>}

              <button type="submit" disabled={submitting} style={{
                padding: '0.65rem', borderRadius: 9, border: 'none',
                background: submitting ? '#1a4a2e' : '#4ade80',
                color: submitting ? '#4b5563' : '#0f2e1a',
                fontWeight: 700, fontSize: '0.85rem', cursor: submitting ? 'not-allowed' : 'pointer',
              }}>
                {submitting ? 'Placing order…' : 'Place Order'}
              </button>
            </form>
          </>)}

          {/* ── SUCCESS ── */}
          {step === 'success' && result && (
            <div style={{ textAlign: 'center', padding: '1.25rem 0' }}>
              <CheckCircle2 size={44} color="#4ade80" style={{ marginBottom: '0.7rem' }} />
              <p style={{ color: '#fff', margin: '0 0 0.25rem', fontWeight: 700, fontSize: '1.05rem' }}>Order Placed!</p>
              <p style={{ color: '#9ca3af', margin: '0 0 0.15rem', fontSize: '0.8rem' }}>Order #{result.order_id} · {fmt(result.total_ugx)}</p>
              <p style={{ color: '#6b7280', fontSize: '0.72rem', margin: '0 0 1.25rem' }}>
                Our team will contact you shortly.
              </p>
              <a href={result.whatsapp_url} target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.6rem 1.25rem', background: '#25d366', color: '#fff',
                borderRadius: 9, fontWeight: 700, textDecoration: 'none', fontSize: '0.85rem',
              }}>
                💬 Chat on WhatsApp
              </a>
              <br />
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer', fontSize: '0.78rem', marginTop: '0.75rem' }}>
                Close
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

const qBtn = {
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 5, color: '#fff', cursor: 'pointer', padding: '2px 5px', display: 'flex', alignItems: 'center',
};
