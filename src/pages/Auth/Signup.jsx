import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';
import EducFarmLogo from '../../components/EducFarmLogo';
import styles from './Signup.module.css';

function Field({ name, label, error, children }) {
  return (
    <div className={styles.field}>
      <label htmlFor={name} className={styles.label}>{label}</label>
      {children}
      {error && <span className={styles.fieldError}>{error}</span>}
    </div>
  );
}

  const INITIAL = {
    name: '',
    identifier: sessionStorage.getItem('auth_identifier') || '',
    password: '',
    confirm_password: '',
  };

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm]                 = useState(INITIAL);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [done, setDone]                 = useState(false);
  const [identifierStatus, setIdentifierStatus] = useState(null); // null | 'checking' | 'available' | 'taken'
  const debounceRef = useRef(null);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'identifier') sessionStorage.setItem('auth_identifier', value);
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isPhone = (v) => /^\+?[\d\s\-()]{7,15}$/.test(v);

  // Debounced availability check
  useEffect(() => {
    const val = form.identifier.trim();
    if (!val || (!isEmail(val) && !isPhone(val))) {
      setIdentifierStatus(null);
      return;
    }
    setIdentifierStatus('checking');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get(`/check-identifier/?value=${encodeURIComponent(val)}`);
        setIdentifierStatus(data.available ? 'available' : 'taken');
      } catch {
        setIdentifierStatus(null);
      }
    }, 600);
    return () => clearTimeout(debounceRef.current);
  }, [form.identifier]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.identifier.trim()) {
      e.identifier = 'Email or phone number is required.';
    } else if (!isEmail(form.identifier) && !isPhone(form.identifier)) {
      e.identifier = 'Enter a valid email or phone number.';
    } else if (identifierStatus === 'taken') {
      e.identifier = 'This email or phone number is already registered.';
    }
    if (!form.password) {
      e.password = 'Password is required.';
    } else if (form.password.length < 8) {
      e.password = 'Password must be at least 8 characters.';
    }
    if (!form.confirm_password) {
      e.confirm_password = 'Please confirm your password.';
    } else if (form.password !== form.confirm_password) {
      e.confirm_password = 'Passwords do not match.';
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setServerError('');
    setLoading(true);
    try {
      const payload = {
        full_name: form.name,
        password: form.password,
        confirm_password: form.confirm_password,
        ...(isEmail(form.identifier)
          ? { email: form.identifier }
          : { phone_number: form.identifier }),
      };
      const { data } = await api.post('/signup/', payload);
      if (data?.access) {
        localStorage.setItem('token', data.access);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      await new Promise((r) => setTimeout(r, 2500));
      setDone(true);
      await new Promise((r) => setTimeout(r, 900));
      sessionStorage.setItem('justRegistered', '1');
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      setLoading(false);
      setDone(false);
      if (data && typeof data === 'object') {
        const fieldErrors = {};
        ['full_name', 'email', 'phone_number', 'password'].forEach((f) => {
          if (data[f]) fieldErrors[f === 'full_name' ? 'name' : f === 'email' || f === 'phone_number' ? 'identifier' : f]
            = Array.isArray(data[f]) ? data[f][0] : data[f];
        });
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        } else {
          setServerError(data.detail || data.non_field_errors?.[0] || data.message || 'Signup failed. Please try again.');
        }
      } else {
        setServerError('Signup failed. Please try again.');
      }
    }
  };

  const inputClass = (name) => `${styles.input} ${errors[name] ? styles.inputError : ''}`;

  return (
    <div className={styles.page}>

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
                <p className={styles.modalTitle}>Creating your account…</p>
                <p className={styles.modalSub}>Setting up your farm</p>
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
                <p className={styles.modalTitle}>Account created!</p>
                <p className={styles.modalSub}>Welcome to EducFarm</p>
              </>
            )}
          </div>
        </div>
      )}

      <div className={loading ? styles.cardHidden : ''} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div className={styles.card}>
          <div className={styles.logoWrap}>
            <div className={styles.logoBorder}>
              <EducFarmLogo size={38} variant="dark" showText={true} />
            </div>
          </div>

          <p className={styles.title}>Create your account</p>

          {serverError && <div className={styles.error}>{serverError}</div>}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <Field name="name" label="Name" error={errors.name}>
              <input id="name" name="name" type="text" placeholder="SSEMATA SABIRA"
                autoComplete="name" value={form.name} onChange={handleChange}
                className={inputClass('name')} />
            </Field>

            <Field name="identifier" label="Email or Phone Number" error={errors.identifier}>
              <div className={styles.identifierWrap}>
                <input id="identifier" name="identifier" type="text"
                  placeholder="ssematasabira24@mail.com or 0786023858"
                  autoComplete="email" value={form.identifier} onChange={handleChange}
                  className={`${inputClass('identifier')} ${identifierStatus === 'available' ? styles.inputValid : ''}`} />
                {identifierStatus === 'checking'  && <span className={styles.idChecking}>⏳</span>}
                {identifierStatus === 'available' && <span className={styles.idAvailable}>✓</span>}
                {identifierStatus === 'taken'     && <span className={styles.idTaken}>✗</span>}
              </div>
              {identifierStatus === 'available' && !errors.identifier && (
                <span className={styles.idAvailableMsg}>Looks good — this is available!</span>
              )}
              {identifierStatus === 'taken' && !errors.identifier && (
                <span className={styles.idTakenMsg}>Already registered. <Link to="/login" className={styles.link}>Sign in instead?</Link></span>
              )}
            </Field>

            <Field name="password" label="Password" error={errors.password}>
              <div className={styles.passwordWrapper}>
                <input id="password" name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters" autoComplete="new-password"
                  value={form.password} onChange={handleChange}
                  className={inputClass('password')} />
                <button type="button" className={styles.toggleBtn}
                  onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? <EyeOff size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
                </button>
              </div>
            </Field>

            <Field name="confirm_password" label="Confirm Password" error={errors.confirm_password}>
              <div className={styles.passwordWrapper}>
                <input id="confirm_password" name="confirm_password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat password" autoComplete="new-password"
                  value={form.confirm_password} onChange={handleChange}
                  className={inputClass('confirm_password')} />
                <button type="button" className={styles.toggleBtn}
                  onClick={() => setShowConfirm((v) => !v)}>
                  {showConfirm ? <EyeOff size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
                </button>
              </div>
            </Field>

            <button type="submit" className={styles.submitBtn}>
              Create Account
            </button>
          </form>

          <p className={styles.footer}>
            Already have an account?{' '}
            <Link to="/login" className={styles.link}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
