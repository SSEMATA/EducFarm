import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ChevronDown, Search, X } from 'lucide-react';
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

const TOP_COUNTRIES = [
  { name: 'Uganda',        flag: '🇺🇬' },
  { name: 'Kenya',         flag: '🇰🇪' },
  { name: 'Nigeria',       flag: '🇳🇬' },
  { name: 'Tanzania',      flag: '🇹🇿' },
  { name: 'Ghana',         flag: '🇬🇭' },
  { name: 'United States', flag: '🇺🇸' },
];

const ALL_COUNTRIES = [
  { name: 'Afghanistan',    flag: '🇦🇫' }, { name: 'Albania',       flag: '🇦🇱' },
  { name: 'Algeria',        flag: '🇩🇿' }, { name: 'Angola',        flag: '🇦🇴' },
  { name: 'Argentina',      flag: '🇦🇷' }, { name: 'Australia',     flag: '🇦🇺' },
  { name: 'Austria',        flag: '🇦🇹' }, { name: 'Bangladesh',    flag: '🇧🇩' },
  { name: 'Belgium',        flag: '🇧🇪' }, { name: 'Bolivia',       flag: '🇧🇴' },
  { name: 'Brazil',         flag: '🇧🇷' }, { name: 'Burkina Faso',  flag: '🇧🇫' },
  { name: 'Cameroon',       flag: '🇨🇲' }, { name: 'Canada',        flag: '🇨🇦' },
  { name: 'Chad',           flag: '🇹🇩' }, { name: 'Chile',         flag: '🇨🇱' },
  { name: 'China',          flag: '🇨🇳' }, { name: 'Colombia',      flag: '🇨🇴' },
  { name: 'Congo',          flag: '🇨🇬' }, { name: "Côte d'Ivoire", flag: '🇨🇮' },
  { name: 'DR Congo',       flag: '🇨🇩' }, { name: 'Denmark',       flag: '🇩🇰' },
  { name: 'Ecuador',        flag: '🇪🇨' }, { name: 'Egypt',         flag: '🇪🇬' },
  { name: 'Ethiopia',       flag: '🇪🇹' }, { name: 'Finland',       flag: '🇫🇮' },
  { name: 'France',         flag: '🇫🇷' }, { name: 'Germany',       flag: '🇩🇪' },
  { name: 'Ghana',          flag: '🇬🇭' }, { name: 'Greece',        flag: '🇬🇷' },
  { name: 'Guatemala',      flag: '🇬🇹' }, { name: 'Guinea',        flag: '🇬🇳' },
  { name: 'Haiti',          flag: '🇭🇹' }, { name: 'Honduras',      flag: '🇭🇳' },
  { name: 'India',          flag: '🇮🇳' }, { name: 'Indonesia',     flag: '🇮🇩' },
  { name: 'Iran',           flag: '🇮🇷' }, { name: 'Iraq',          flag: '🇮🇶' },
  { name: 'Ireland',        flag: '🇮🇪' }, { name: 'Italy',         flag: '🇮🇹' },
  { name: 'Japan',          flag: '🇯🇵' }, { name: 'Jordan',        flag: '🇯🇴' },
  { name: 'Kenya',          flag: '🇰🇪' }, { name: 'Madagascar',    flag: '🇲🇬' },
  { name: 'Malawi',         flag: '🇲🇼' }, { name: 'Malaysia',      flag: '🇲🇾' },
  { name: 'Mali',           flag: '🇲🇱' }, { name: 'Mexico',        flag: '🇲🇽' },
  { name: 'Morocco',        flag: '🇲🇦' }, { name: 'Mozambique',    flag: '🇲🇿' },
  { name: 'Myanmar',        flag: '🇲🇲' }, { name: 'Nepal',         flag: '🇳🇵' },
  { name: 'Netherlands',    flag: '🇳🇱' }, { name: 'New Zealand',   flag: '🇳🇿' },
  { name: 'Niger',          flag: '🇳🇪' }, { name: 'Nigeria',       flag: '🇳🇬' },
  { name: 'Norway',         flag: '🇳🇴' }, { name: 'Pakistan',      flag: '🇵🇰' },
  { name: 'Peru',           flag: '🇵🇪' }, { name: 'Philippines',   flag: '🇵🇭' },
  { name: 'Poland',         flag: '🇵🇱' }, { name: 'Portugal',      flag: '🇵🇹' },
  { name: 'Romania',        flag: '🇷🇴' }, { name: 'Russia',        flag: '🇷🇺' },
  { name: 'Rwanda',         flag: '🇷🇼' }, { name: 'Saudi Arabia',  flag: '🇸🇦' },
  { name: 'Senegal',        flag: '🇸🇳' }, { name: 'Sierra Leone',  flag: '🇸🇱' },
  { name: 'Somalia',        flag: '🇸🇴' }, { name: 'South Africa',  flag: '🇿🇦' },
  { name: 'South Sudan',    flag: '🇸🇸' }, { name: 'Spain',         flag: '🇪🇸' },
  { name: 'Sri Lanka',      flag: '🇱🇰' }, { name: 'Sudan',         flag: '🇸🇩' },
  { name: 'Sweden',         flag: '🇸🇪' }, { name: 'Switzerland',   flag: '🇨🇭' },
  { name: 'Tanzania',       flag: '🇹🇿' }, { name: 'Thailand',      flag: '🇹🇭' },
  { name: 'Tunisia',        flag: '🇹🇳' }, { name: 'Turkey',        flag: '🇹🇷' },
  { name: 'Uganda',         flag: '🇺🇬' }, { name: 'Ukraine',       flag: '🇺🇦' },
  { name: 'United Kingdom', flag: '🇬🇧' }, { name: 'United States', flag: '🇺🇸' },
  { name: 'Uzbekistan',     flag: '🇺🇿' }, { name: 'Venezuela',     flag: '🇻🇪' },
  { name: 'Vietnam',        flag: '🇻🇳' }, { name: 'Yemen',         flag: '🇾🇪' },
  { name: 'Zambia',         flag: '🇿🇲' }, { name: 'Zimbabwe',      flag: '🇿🇼' },
];

function CountryPicker({ value, onChange, error }) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef         = useRef(null);
  const searchRef           = useRef(null);
  const selected = ALL_COUNTRIES.find((c) => c.name === value);
  const filtered = ALL_COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pick = (name) => { onChange(name); setOpen(false); setSearch(''); };

  return (
    <div className={styles.countryPicker} ref={dropdownRef}>
      <div className={styles.countryCards}>
        {TOP_COUNTRIES.map((c) => (
          <button key={c.name} type="button"
            className={`${styles.countryCard} ${value === c.name ? styles.countryCardActive : ''}`}
            onClick={() => pick(c.name)}>
            <span className={styles.countryFlag}>{c.flag}</span>
            <span className={styles.countryCardName}>{c.name}</span>
          </button>
        ))}
      </div>
      <button type="button"
        className={`${styles.countryTrigger} ${error ? styles.inputError : ''} ${value && !TOP_COUNTRIES.find(c => c.name === value) ? styles.countryTriggerSelected : ''}`}
        onClick={() => setOpen((v) => !v)}>
        {selected
          ? <span className={styles.countryTriggerVal}><span className={styles.countryFlag}>{selected.flag}</span>{selected.name}</span>
          : <span className={styles.countryTriggerPlaceholder}>Other country…</span>}
        <ChevronDown size={15} className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} />
      </button>
      {open && (
        <div className={styles.countryDropdown}>
          <div className={styles.countrySearch}>
            <Search size={14} className={styles.searchIcon} />
            <input ref={searchRef} type="text" placeholder="Search country…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput} />
            {search && <button type="button" className={styles.clearSearch} onClick={() => setSearch('')}><X size={13} /></button>}
          </div>
          <div className={styles.countryList}>
            {filtered.length === 0
              ? <p className={styles.noResults}>No countries found</p>
              : filtered.map((c) => (
                <button key={c.name} type="button"
                  className={`${styles.countryOption} ${value === c.name ? styles.countryOptionActive : ''}`}
                  onClick={() => pick(c.name)}>
                  <span className={styles.countryFlag}>{c.flag}</span>{c.name}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

const INITIAL = {
  full_name: '', email: '', phone_number: '',
  password: '', confirm_password: '', farm_name: '', country: '',
};

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm]                 = useState(INITIAL);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false); // wheel visible
  const [done, setDone]                 = useState(false); // tick phase
  const [errors, setErrors]             = useState({});
  const [serverError, setServerError]   = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const setCountry = (name) => {
    setForm((prev) => ({ ...prev, country: name }));
    setErrors((prev) => ({ ...prev, country: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim())   e.full_name = 'Full name is required.';
    if (!form.email.trim()) {
      e.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Enter a valid email address.';
    }
    if (!form.phone_number.trim()) {
      e.phone_number = 'Phone number is required.';
    } else if (!/^\+?[\d\s\-()]{7,15}$/.test(form.phone_number)) {
      e.phone_number = 'Enter a valid phone number.';
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
    if (!form.farm_name.trim()) e.farm_name = 'Farm name is required.';
    if (!form.country)          e.country   = 'Please select your country.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setServerError('');
    // Show wheel immediately on click
    setLoading(true);
    try {
      const { data } = await api.post('/signup/', {
        full_name: form.full_name, email: form.email,
        phone_number: form.phone_number, password: form.password,
        confirm_password: form.confirm_password,
        farm_name: form.farm_name, country: form.country,
      });
      // Auto-login: store token if returned, otherwise navigate to login
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
        ['full_name','email','phone_number','password','farm_name','country'].forEach((f) => {
          if (data[f]) fieldErrors[f] = Array.isArray(data[f]) ? data[f][0] : data[f];
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

      {/* Wheel modal — full screen, card invisible behind it */}
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

      {/* Card — fully invisible while wheel runs */}
      <div className={loading ? styles.cardHidden : ''}>
        <div className={styles.card}>
          <div className={styles.logoWrap}>
            <div className={styles.logoBorder}>
              <EducFarmLogo size={38} variant="dark" showText={true} />
            </div>
          </div>

          <p className={styles.title}>Create your account</p>

          {serverError && <div className={styles.error}>{serverError}</div>}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.row}>
              <Field name="full_name" label="Full Name" error={errors.full_name}>
                <input id="full_name" name="full_name" type="text" placeholder="John Doe"
                  autoComplete="name" value={form.full_name} onChange={handleChange}
                  className={inputClass('full_name')} />
              </Field>
              <Field name="farm_name" label="Farm Name" error={errors.farm_name}>
                <input id="farm_name" name="farm_name" type="text" placeholder="Green Valley Farm"
                  autoComplete="organization" value={form.farm_name} onChange={handleChange}
                  className={inputClass('farm_name')} />
              </Field>
            </div>

            <div className={styles.row}>
              <Field name="email" label="Email" error={errors.email}>
                <input id="email" name="email" type="email" placeholder="you@example.com"
                  autoComplete="email" value={form.email} onChange={handleChange}
                  className={inputClass('email')} />
              </Field>
              <Field name="phone_number" label="Phone Number" error={errors.phone_number}>
                <input id="phone_number" name="phone_number" type="tel" placeholder="+1 234 567 8900"
                  autoComplete="tel" value={form.phone_number} onChange={handleChange}
                  className={inputClass('phone_number')} />
              </Field>
            </div>

            <Field name="country" label="Country" error={errors.country}>
              <CountryPicker value={form.country} onChange={setCountry} error={errors.country} />
            </Field>

            <div className={styles.row}>
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
            </div>

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
