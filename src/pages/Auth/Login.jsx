import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';
import EducFarmLogo from '../../components/EducFarmLogo';
import styles from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm]                 = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false); // wheel visible
  const [done, setDone]                 = useState(false); // tick phase
  const [error, setError]               = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Show wheel immediately
    setLoading(true);
    try {
      const { data } = await api.post('/login/', {
        email: form.email,
        password: form.password,
      });
      localStorage.setItem('token', data.access);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Wheel has been spinning since click — wait remaining time up to 3s total
      await new Promise((r) => setTimeout(r, 2500));
      setDone(true);
      await new Promise((r) => setTimeout(r, 900));

      sessionStorage.setItem('justLoggedIn', '1');
      navigate('/dashboard');
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
                <p className={styles.modalSub}>Taking you to your dashboard</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Card — fully hidden while wheel runs ────── */}
      <div className={loading ? styles.cardHidden : ''}>
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
              <label htmlFor="email" className={styles.label}>Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required
                placeholder="you@example.com" value={form.email} onChange={handleChange}
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
