import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import EducFarmLogo from '../../components/EducFarmLogo';
import styles from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm]                 = useState(() => ({
    email: sessionStorage.getItem('auth_identifier') || '',
    password: '',
  }));
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [done, setDone]                 = useState(false);
  const [isStaff, setIsStaff]           = useState(false);
  const [error, setError]               = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'email') sessionStorage.setItem('auth_identifier', value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Show wheel immediately
    setLoading(true);
    try {
      const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      const identifier = form.email.trim();
      const { data } = await api.post('/users/login/', {
        ...(isEmail(identifier) ? { email: identifier } : { phone_number: identifier }),
        password: form.password,
      });
      login(data.access, data.refresh, data.user);
      setIsStaff(data.user.is_staff);
      sessionStorage.removeItem('auth_identifier');

      // Show tick immediately — server already responded
      setDone(true);
      await new Promise((r) => setTimeout(r, 500));

      sessionStorage.setItem('justLoggedIn', '1');
      navigate(data.user.must_change_password ? '/set-password' : data.user.is_staff ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      const d = err.response?.data;
      setError(
        d?.detail || d?.non_field_errors?.[0] || d?.message ||
        'Login failed. Please check your credentials.'
      );
      setLoading(false);
      setDone(false);
    }
  };

  return (
    <div className={styles.page}>

      {/* ── Wheel modal ─────────────────────────────── */}
      {loading && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalBox}>
            {!done ? (
              <>
                <div className={styles.wheel}>
                  <svg viewBox="0 0 120 120" className={styles.wheelSvg}>
                    <circle cx="60" cy="60" r="52" className={styles.trackOuter} />
                    <circle cx="60" cy="60" r="52" className={styles.arcOuter} />
                    <circle cx="60" cy="60" r="36" className={styles.trackInner} />
                    <circle cx="60" cy="60" r="36" className={styles.arcInner} />
                    <circle cx="60" cy="8"  r="5"  className={styles.orbitDot} />
                  </svg>
                  <div className={styles.wheelCenter}>
                    <EducFarmLogo size={30} variant="dark" showText={false} />
                  </div>
                </div>
                <p className={styles.modalTitle}>Signing you in…</p>
                <p className={styles.modalSub}>Please wait a moment</p>
              </>
            ) : (
              <>
                <div className={styles.successRing}>
                  <svg viewBox="0 0 120 120" className={styles.successSvg}>
                    <circle cx="60" cy="60" r="52" className={styles.successTrack} />
                    <circle cx="60" cy="60" r="52" className={styles.successArc} />
                  </svg>
                  <div className={styles.successTick}>✓</div>
                </div>
                <p className={styles.modalTitle}>Welcome back!</p>
                <p className={styles.modalSub}>Taking you to your {isStaff ? 'admin panel' : 'dashboard'}</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Card — fully hidden while wheel runs ────── */}
      <div className={loading ? styles.cardHidden : ''} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div className={styles.card}>
          <div className={styles.logoWrap}>
            <div className={styles.logoBorder}>
              <EducFarmLogo size={38} variant="dark" showText={true} />
            </div>
          </div>

          <p className={styles.title}>Welcome back</p>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>Email or Phone Number</label>
              <input id="email" name="email" type="text" autoComplete="email" required
                placeholder="ssematasabira24@mail.com or 0786023858" value={form.email} onChange={handleChange}
                className={styles.input} />
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <div className={styles.passwordWrapper}>
                <input id="password" name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password" required placeholder="••••••••"
                  value={form.password} onChange={handleChange}
                  className={styles.input} />
                <button type="button" className={styles.toggleBtn}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn}>
              Sign In
            </button>
          </form>

          <p className={styles.footer}>
            Don&apos;t have an account?{' '}
            <Link to="/signup" className={styles.link}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
