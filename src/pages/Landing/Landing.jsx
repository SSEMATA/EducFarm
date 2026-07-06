import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Droplets, Radio, CloudRain, MessageSquare,
  MapPin, ShieldCheck, Rocket, Download,
  Smartphone, Tablet, Monitor, Leaf, Heart,
  TrendingUp, TrendingDown, ShoppingCart, LogOut, LayoutDashboard,
} from 'lucide-react';
import { FaTiktok, FaInstagram, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import ShopModal from '../../components/ShopModal';
import EducFarmLogo from '../../components/EducFarmLogo';
import { useAuth } from '../../context/AuthContext';
import styles from './Landing.module.css';

const SOCIALS = [
  { Icon: FaTiktok,    href: 'https://www.tiktok.com/@Kyebambe-educfarm-innovators',  label: 'TikTok'    },
  { Icon: FaInstagram, href: 'https://www.instagram.com/Kyebambe-educfarm-innovators', label: 'Instagram' },
  { Icon: FaLinkedin,  href: 'https://www.linkedin.com/company/kyebambe-educfarm-innovators-limited/', label: 'LinkedIn'  },
  { Icon: FaXTwitter,  href: 'https://x.com/Kyebambe-educfarm-innovators',             label: 'X'         },
];

// ── Live dashboard metrics ───────────────────────────────
const METRICS = [
  { key: 'soil', label: 'Soil Moisture', base: 68, min: 28, max: 92, step: 3,   unit: '%',  color: '#22c55e' },
  { key: 'tank', label: 'Water Tank',    base: 82, min: 20, max: 98, step: 2,   unit: '%',  color: '#3b82f6' },
  { key: 'temp', label: 'Temperature',   base: 24, min: 18, max: 38, step: 0.5, unit: '°C', color: '#f59e0b' },
  { key: 'rain', label: 'Rain Chance',   base: 15, min: 0,  max: 85, step: 4,   unit: '%',  color: '#8b5cf6' },
];

function useLiveMetrics() {
  const [vals, setVals] = useState(() =>
    Object.fromEntries(METRICS.map(m => [m.key, m.base]))
  );
  const [prev, setPrev] = useState(() =>
    Object.fromEntries(METRICS.map(m => [m.key, m.base]))
  );
  const dirs = useRef(Object.fromEntries(METRICS.map(m => [m.key, 1])));

  useEffect(() => {
    const id = setInterval(() => {
      setVals(old => {
        const next = { ...old };
        METRICS.forEach(({ key, min, max, step }) => {
          const nudge = (Math.random() * step * 2 - step) + dirs.current[key] * step * 0.4;
          let nv = parseFloat((old[key] + nudge).toFixed(1));
          if (nv >= max) { nv = max; dirs.current[key] = -1; }
          if (nv <= min) { nv = min; dirs.current[key] =  1; }
          next[key] = nv;
        });
        return next;
      });
      setPrev(old => ({ ...old }));
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return { vals, prev };
}

function LiveCard() {
  const { vals, prev } = useLiveMetrics();
  const pumpOn = vals.soil < 60;

  return (
    <div className={styles.heroCard}>
      <div className={styles.heroCardHeader}>
        <span className={styles.dot} style={{ background: '#ef4444' }} />
        <span className={styles.dot} style={{ background: '#f59e0b' }} />
        <span className={styles.dot} style={{ background: '#22c55e' }} />
        <span className={styles.heroCardTitle}>EducFarm · Live Dashboard</span>
        <span className={styles.liveChip}><span className={styles.liveDot} />LIVE</span>
      </div>
      <div className={styles.heroCardBody}>
        {METRICS.map(({ key, label, unit, color, max }) => {
          const v   = vals[key];
          const p   = prev[key];
          const up  = v >= p;
          const pct = Math.round((v / max) * 100);
          const disp = unit === '°C' ? `${v.toFixed(1)}${unit}` : `${Math.round(v)}${unit}`;
          return (
            <div key={key} className={styles.heroStat}>
              <div className={styles.heroStatTop}>
                <span className={styles.heroStatLabel}>{label}</span>
                <span className={styles.heroStatRight}>
                  <span className={styles.trendIcon} style={{ color: up ? '#22c55e' : '#ef4444' }}>
                    {up
                      ? <TrendingUp  size={13} strokeWidth={2.5} />
                      : <TrendingDown size={13} strokeWidth={2.5} />}
                  </span>
                  <span className={styles.heroStatValue} style={{ color }}>{disp}</span>
                </span>
              </div>
              <div className={styles.heroStatTrack}>
                <div className={styles.heroStatFill} style={{ width: `${pct}%`, background: color }} />
              </div>
            </div>
          );
        })}
        <div className={styles.pumpBadge} style={{
          background:   pumpOn ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.12)',
          borderColor:  pumpOn ? 'rgba(34,197,94,0.3)'  : 'rgba(239,68,68,0.3)',
        }}>
          <span className={styles.pumpDot} style={{
            background: pumpOn ? '#22c55e' : '#ef4444',
            boxShadow:  `0 0 6px ${pumpOn ? '#22c55e' : '#ef4444'}`,
          }} />
          <span style={{ color: pumpOn ? '#4ade80' : '#f87171' }}>
            Pump: <strong>{pumpOn ? 'AUTO — ON' : 'AUTO — OFF'}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Animated install cards ───────────────────────────────
const INSTALL_ITEMS = [
  { Icon: Smartphone, platform: 'Android',       hint: 'Tap the browser menu → "Add to Home Screen"' },
  { Icon: Tablet,     platform: 'iPhone / iPad', hint: 'Tap Share → "Add to Home Screen" in Safari' },
  { Icon: Monitor,    platform: 'Desktop',       hint: 'Click the install icon in your browser address bar' },
];

function InstallCards() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className={styles.installCards} ref={ref}>
      {INSTALL_ITEMS.map(({ Icon, platform, hint }, i) => (
        <div
          key={platform}
          className={`${styles.installCard} ${visible ? styles.installCardVisible : ''}`}
          style={{ transitionDelay: `${i * 120}ms` }}
        >
          <span className={styles.installIcon}><Icon size={36} strokeWidth={1.5} /></span>
          <strong className={styles.installPlatform}>{platform}</strong>
          <span className={styles.installHint}>{hint}</span>
        </div>
      ))}
    </div>
  );
}

// ── Static data ──────────────────────────────────────────
const FEATURES = [
  { Icon: Droplets,      title: 'Smart Auto-Irrigation',  desc: 'Soil moisture sensors trigger the pump automatically — crops get water only when they need it.' },
  { Icon: Radio,         title: 'Real-Time Monitoring',   desc: 'Live soil moisture, temperature, water tank level and pump status from anywhere in the world.' },
  { Icon: CloudRain,     title: 'Weather Intelligence',   desc: 'Integrates Weathermap forecasts to skip irrigation when rain is expected, saving water.' },
  { Icon: MessageSquare, title: 'SMS Alerts',             desc: 'Instant SMS alerts and remote pump control via text message — no internet needed on the farm.' },
  { Icon: MapPin,        title: 'GPS Location Tracking',  desc: 'Built-in GPS provides coordinates and reverse-geocoded place names for every reading.' },
  { Icon: ShieldCheck,   title: 'Secure Device Pairing',  desc: 'Each device has a unique pairing code and secret key — only you can access your farm data.' },
];

const STEPS = [
  { n: '1', label: 'Create an account', desc: 'Sign up with your email in under a minute.' },
  { n: '2', label: 'Pair your device',  desc: 'Enter the Device ID and Pairing Code printed on your ESP32 unit.' },
  { n: '3', label: 'Configure WiFi',    desc: 'Set your farm WiFi from the Settings page — the device applies it automatically.' },
  { n: '4', label: 'Watch it work',     desc: 'Your dashboard shows live sensor data and the pump runs itself.' },
];

const STATS = [
  { value: '60%',  label: 'Less water used' },
  { value: '3×',   label: 'Faster crop response' },
  { value: '80%',  label: 'Less manual labour' },
  { value: '24/7', label: 'Automated monitoring' },
];

// ── Page ─────────────────────────────────────────────────
export default function Landing() {
  const [shopOpen, setShopOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dashPath = user?.is_staff ? '/admin/dashboard' : '/dashboard';

  return (
    <div className={styles.page}>
      {shopOpen && <ShopModal onClose={() => setShopOpen(false)} />}

      {/* ── Nav ─────────────────────────────────────── */}
      <nav className={styles.nav}>
        <EducFarmLogo size={36} variant="dark" showText />
        <div className={styles.navLinks}>
          <button
            className={styles.navOrder}
            onClick={() => setShopOpen(true)}
          >
            <ShoppingCart size={13} strokeWidth={2.5} /> Order Kit
          </button>
          {user ? (
            <>
              <button className={styles.navLogin} onClick={() => { logout(); }}>
                <LogOut size={13} strokeWidth={2.5} /> Sign Out
              </button>
              <button className={styles.navSignup} onClick={() => navigate(dashPath)}>
                <LayoutDashboard size={13} strokeWidth={2.5} /> View Dashboard
              </button>
            </>
          ) : (
            <>
              <Link to="/login"  className={styles.navLogin}>Log In</Link>
              <Link to="/signup" className={styles.navSignup}>Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.heroBadge}><Leaf size={13} strokeWidth={2.5} /> Smart Farming · Grow More, Work Less</div>
          <h1 className={styles.heroTitle}>
            Your Farm,<br />
            <span className={styles.heroAccent}>Running Itself.</span>
          </h1>
          <p className={styles.heroSub}>
            Intelligent irrigation that waters your crops automatically, skips when rain is coming,
            and alerts you by SMS — all from one dashboard.
          </p>

          <div className={styles.heroPills}>
            <span className={styles.pill}><Droplets size={13}/> Auto Pump</span>
            <span className={styles.pill}><CloudRain size={13}/> Rain Skip</span>
            <span className={styles.pill}><MessageSquare size={13}/> SMS Alerts</span>
            <span className={styles.pill}><MapPin size={13}/> GPS Tracking</span>
            <span className={styles.pill}><Radio size={13}/> Live Data</span>
          </div>

          <div className={styles.heroActions}>
            {user ? (
              <button className={styles.ctaPrimary} onClick={() => navigate(dashPath)}>
                <LayoutDashboard size={15} strokeWidth={2.2}/> View My Dashboard
              </button>
            ) : (
              <Link to="/signup" className={styles.ctaPrimary}><Rocket size={15} strokeWidth={2.2}/> Get Started Free</Link>
            )}
            <a href="https://www.educfarm.com" className={styles.ctaSecondary} target="_blank" rel="noopener noreferrer">
              <Download size={14}/> Open Web App
            </a>
          </div>
        </div>

        <div className={styles.heroRight}>
          <LiveCard />
        </div>
      </section>

      {/* ── Stats strip ─────────────────────────────── */}
      <div className={styles.statsStrip}>
        {STATS.map(({ value, label }) => (
          <div key={label} className={styles.statItem}>
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statLabel}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Features ────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>Features</div>
        <h2 className={styles.sectionTitle}>Everything your farm needs</h2>
        <p className={styles.sectionSub}>
          Built on smart embedded hardware, powered by a Django backend and a React PWA.
        </p>
        <div className={styles.featureGrid}>
          {FEATURES.map(({ Icon, title, desc }) => (
            <div key={title} className={styles.featureCard}>
              <span className={styles.featureIcon}><Icon size={28} strokeWidth={1.8} /></span>
              <h3 className={styles.featureTitle}>{title}</h3>
              <p className={styles.featureDesc}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────── */}
      <section className={styles.sectionDark}>
        <div className={styles.sectionLabel} style={{ color: '#4ade80' }}>How it works</div>
        <h2 className={styles.sectionTitle} style={{ color: '#fff' }}>Up and running in 4 steps</h2>
        <div className={styles.stepsRow}>
          {STEPS.map(({ n, label, desc }, i) => (
            <div key={n} className={styles.step}>
              {i < STEPS.length - 1 && <div className={styles.stepConnector} />}
              <div className={styles.stepNum}>{n}</div>
              <h3 className={styles.stepLabel}>{label}</h3>
              <p className={styles.stepDesc}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Install ─────────────────────────────────── */}
      <section className={styles.section} style={{ textAlign: 'center' }}>
        <div className={styles.sectionLabel}>Install</div>
        <h2 className={styles.sectionTitle}>Take EducFarm anywhere</h2>
        <p className={styles.sectionSub}>
          EducFarm is a Progressive Web App — install it on your phone or desktop straight from the browser.
          No app store, no download fees.
        </p>
        <InstallCards />
        <div className={styles.heroCta} style={{ justifyContent: 'center', marginTop: '2.5rem' }}>
          {user ? (
            <button className={styles.ctaPrimary} onClick={() => navigate(dashPath)}>
              <LayoutDashboard size={16} strokeWidth={2.2} /> View My Dashboard
            </button>
          ) : (
            <>
              <Link to="/signup" className={styles.ctaPrimary}><Rocket size={16} strokeWidth={2.2} /> Create Free Account</Link>
              <Link to="/login"  className={styles.ctaSecondary}>I already have an account</Link>
            </>
          )}
        </div>
      </section>

      {/* ── Persuasive CTA ──────────────────────────── */}
      <section className={styles.sectionDark} style={{ textAlign: 'center' }}>
        <div className={styles.sectionLabel} style={{ color: '#4ade80' }}>Ready to transform your farm?</div>
        <h2 className={styles.sectionTitle} style={{ color: '#fff' }}>
          Stop guessing. Start growing.
        </h2>
        <p className={styles.sectionSub} style={{ color: '#9ca3af', maxWidth: 480, margin: '0 auto 2rem' }}>
          Every day without EducFarm is water wasted and crops at risk.
          Join farmers already irrigating smarter.
        </p>
        <div className={styles.heroCta} style={{ justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {user ? (
            <button className={styles.ctaPrimary} onClick={() => navigate(dashPath)}>
              <LayoutDashboard size={16} strokeWidth={2.2} /> View My Dashboard
            </button>
          ) : (
            <Link to="/signup" className={styles.ctaPrimary}>
              <Rocket size={16} strokeWidth={2.2} /> Create Free Account
            </Link>
          )}
          <button
            className={styles.ctaSecondary}
            style={{ borderColor: '#4ade80', color: '#4ade80', cursor: 'pointer' }}
            onClick={() => setShopOpen(true)}
          >
            <ShoppingCart size={15} strokeWidth={2.2} /> Order Hardware Kit
          </button>
        </div>
        <p style={{ color: '#6b7280', fontSize: '0.78rem', marginTop: '1.2rem' }}>
          Free account · No credit card · Hardware ships across Uganda
        </p>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className={styles.footer}>
        <EducFarmLogo size={30} variant="dark" showText />
        <p className={styles.footerBuilt}>
          Built with <Heart size={13} strokeWidth={2.5} className={styles.heartIcon} /> by students of{' '}
          <img
            src="https://kyebambegirls.sc.ug/assets/images/school_badge.png"
            alt="Kyebambe Girls School Badge"
            style={{ width: 22, height: 22, objectFit: 'contain', verticalAlign: 'middle', margin: '0 0.3rem' }}
          />
          <strong>Kyebambe Girls&apos; Secondary School</strong>
        </p>

        <div style={{ display: 'flex', gap: '1.1rem', justifyContent: 'center', marginTop: '0.75rem' }}>
          {SOCIALS.map(({ Icon, href, label }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
              style={{ color: '#6b7280', fontSize: '1.25rem', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#4ade80'}
              onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
            >
              <Icon />
            </a>
          ))}
        </div>
        <div className={styles.footerLinks}>
          <Link to="/login"  className={styles.footerLink}>Log In</Link>
          <span className={styles.footerDot}>·</span>
          <Link to="/signup" className={styles.footerLink}>Sign Up</Link>
        </div>
        <p style={{ color: '#4b5563', fontSize: '0.75rem', marginTop: '0.75rem' }}>
          &copy; {new Date().getFullYear()} All rights reserved by Kyebambe EducFarm Innovators Limited
        </p>
      </footer>

    </div>
  );
}
