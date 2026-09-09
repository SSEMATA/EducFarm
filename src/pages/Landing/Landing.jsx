import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMeta } from '../../hooks/useMeta';
import ShopModal from '../../components/ShopModal';
import PublicHeader from '../../components/PublicHeader';
import PublicFooter from '../../components/PublicFooter';
import { useAuth } from '../../context/AuthContext';
import styles from './Landing.module.css';

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
  { platform: 'Android',       hint: 'Tap the browser menu → "Add to Home Screen"' },
  { platform: 'iPhone / iPad', hint: 'Tap Share → "Add to Home Screen" in Safari' },
  { platform: 'Desktop',       hint: 'Click the install icon in your browser address bar' },
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
      {INSTALL_ITEMS.map(({ platform, hint }, i) => (
        <div
          key={platform}
          className={`${styles.installCard} ${visible ? styles.installCardVisible : ''}`}
          style={{ transitionDelay: `${i * 120}ms` }}
        >
          <strong className={styles.installPlatform}>{platform}</strong>
          <span className={styles.installHint}>{hint}</span>
        </div>
      ))}
    </div>
  );
}

// ── Static data ──────────────────────────────────────────
const YONDER_EFFECTS = [
  { title: 'Water use cut by 60%', desc: 'The automated system eliminated over-irrigation, reducing daily water consumption significantly across Yonder Farm\'s plots.' },
  { title: 'Real-time crop visibility', desc: 'Soil moisture, temperature, and pump activity were monitored live — giving the Stanbic team and farm managers instant field insight.' },
  { title: 'Proof of concept validated', desc: 'The inspection confirmed the system performs reliably in real field conditions, opening the door for wider deployment across partner farms.' },
];

const PRODUCT_HIGHLIGHTS = [
  { label: 'Smart hardware', desc: 'Solar-powered irrigation equipment built to sense field conditions and control water delivery reliably.' },
  { label: 'Automated decisions', desc: 'EducFarm combines soil moisture and weather intelligence to irrigate at the right time, without guesswork.' },
  { label: 'Clear visibility', desc: 'Farmers can follow essential conditions, pump activity, and alerts from wherever they are.' },
];

const STATS = [
  { value: '60%',  label: 'Less water used' },
  { value: '3×',   label: 'Faster crop response' },
  { value: '80%',  label: 'Less manual labour' },
  { value: '24/7', label: 'Automated monitoring' },
];

// ── Page ─────────────────────────────────────────────────
export default function Landing() {
  useMeta({
    title: 'EducFarm | Smart Irrigation Systems for African Farms',
    description: 'EducFarm builds smart irrigation systems for farms across Africa, combining solar-powered hardware, real-time soil and weather data, and automated irrigation to save water and improve crop productivity.',
    url: 'https://www.educfarm.com/',
    ogImage: 'https://res.cloudinary.com/d5qqtsou/image/upload/v1788426936/sm_smo9sk.jpg',
    keywords: 'EducFarm, EducFarm Africa, smart irrigation systems, smart irrigation, smart irrigation technology, smart irrigation solutions, smart irrigation systems Africa, smart irrigation Africa, smart irrigation Uganda, intelligent irrigation systems, intelligent irrigation technology, intelligent irrigation solutions, automated irrigation systems, automated irrigation, automatic irrigation systems, automated farm irrigation, smart farm irrigation, modern irrigation systems, advanced irrigation systems, digital irrigation systems, connected irrigation systems, precision irrigation systems, solar irrigation systems, solar powered irrigation, solar irrigation, solar irrigation system Africa, solar irrigation system Uganda, solar powered farm irrigation, solar water irrigation systems, solar powered farming systems, solar agricultural technology, solar irrigation technology, solar pump irrigation, solar water pumping for farms, solar powered water pumps, solar farming technology, solar agriculture solutions, solar irrigation solutions, solar irrigation technology Africa, solar irrigation technology Uganda, solar powered irrigation systems Africa, solar powered irrigation systems Uganda, agricultural technology, agricultural technology Africa, agricultural technology Uganda, agtech Africa, agtech Uganda, agricultural technology solutions, agriculture technology solutions, farming technology, smart farming technology, smart agriculture technology, digital agriculture, digital farming, digital farming technology, modern agriculture technology, modern farming technology, innovative farming technology, agricultural innovation Africa, agricultural innovation Uganda, agriculture innovation, technology in agriculture, smart farming, smart farming Africa, smart farming Uganda, smart farm technology, smart farm solutions, smart agriculture, smart agriculture Africa, smart agriculture Uganda, intelligent farming, intelligent agriculture, precision farming, precision agriculture, precision agriculture Africa, precision agriculture Uganda, digital farming solutions, farm technology solutions, technology for farmers, agricultural automation, farm automation, automated farming, water management for farms, agricultural water management, smart water management, smart water management systems, farm water management, irrigation water management, water efficient farming, water efficient irrigation, water conservation agriculture, water conservation farming, water saving irrigation, water saving irrigation systems, water efficient irrigation systems, sustainable water management, sustainable irrigation, sustainable irrigation systems, efficient irrigation systems, efficient farm irrigation, water management technology, agricultural water conservation, soil moisture monitoring, soil moisture monitoring systems, smart soil moisture monitoring, soil moisture sensors, agricultural soil sensors, farm soil monitoring, smart farming sensors, crop monitoring systems, crop monitoring technology, real time crop monitoring, real time farm monitoring, farm monitoring systems, agricultural monitoring systems, smart farm monitoring, soil monitoring technology, soil health monitoring, crop health monitoring, agricultural sensors, IoT agriculture sensors, IoT farming technology, agricultural weather monitoring, farm weather monitoring, smart weather monitoring, weather data for farmers, weather data agriculture, real time weather data agriculture, agricultural data technology, farm data analytics, agricultural data analytics, smart farming data, farm monitoring technology, real time farm data, real time agricultural data, weather based irrigation, weather based irrigation systems, climate smart irrigation, climate smart agriculture, climate smart farming, climate smart agriculture Africa, climate smart farming Uganda, farm irrigation systems, irrigation systems for farms, irrigation equipment, agricultural irrigation equipment, irrigation equipment Africa, irrigation equipment Uganda, farm irrigation equipment, modern irrigation equipment, automated farm irrigation systems, agricultural irrigation systems, commercial farm irrigation, irrigation solutions for farmers, irrigation solutions Africa, irrigation solutions Uganda, irrigation technology, irrigation technology Africa, irrigation technology Uganda, modern irrigation technology, precision irrigation technology, smart irrigation equipment, agriculture in Africa, farming in Africa, African agriculture, African farmers, farming technology Africa, farming solutions Africa, agricultural solutions Africa, agricultural solutions Uganda, farming solutions Uganda, agriculture solutions Uganda, agriculture technology Africa, agriculture technology Uganda, smart farming solutions Africa, smart farming solutions Uganda, irrigation solutions for Africa, irrigation solutions for Uganda, irrigation systems Africa, irrigation systems Uganda, farm technology Africa, farm technology Uganda, sustainable agriculture, sustainable agriculture Africa, sustainable agriculture Uganda, sustainable farming, sustainable farming Africa, sustainable farming Uganda, water efficient agriculture, agricultural productivity, farm productivity technology, improve farm productivity, increase crop productivity, reduce irrigation costs, reduce farm water usage, reduce agricultural water waste, agricultural investment Africa, agriculture investment Uganda, invest in agriculture Africa, agricultural technology investment, agtech investment Africa, smart agriculture investment, climate resilient agriculture, climate resilient farming, drought resistant farming solutions, irrigation for drought affected farms, water saving agriculture technology, sustainable irrigation technology, automated farming systems, IoT agriculture, IoT farming, agriculture IoT solutions, smart agriculture solutions, smart irrigation sensors, automated water management, remote farm monitoring, remote irrigation control, real time irrigation monitoring, agricultural automation technology, farm management technology, digital agriculture Africa, agricultural innovation technology, sustainable farming technology',
    googleVerification: 'hufG42z2WpIGyEJIWrH-DBZZB59hZGi1dCkdSYrzikY',
  });
  const [shopOpen, setShopOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const dashPath = user?.is_staff ? '/admin/dashboard' : '/dashboard';

  return (
    <div className={styles.page}>
      {shopOpen && <ShopModal onClose={() => setShopOpen(false)} />}

      <PublicHeader showIcons={false} showCartIcon />

      {/* ── Hero ────────────────────────────────────── */}
      <div className={styles.heroWrapper}>
        <video
          className={styles.heroBgVideo}
          src="https://res.cloudinary.com/d5qqtsou/video/upload/v1788421243/irrigation_1_mz9qzu.mp4"
          poster="https://res.cloudinary.com/d5qqtsou/video/upload/so_0,f_auto,q_auto/v1788421243/irrigation_1_mz9qzu.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
        />
        <div className={styles.heroOverlay} />
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <h1 className={styles.heroTitle}>
            <span style={{ display: 'block' }}>Feeding Africa.</span>
            <span className={styles.heroAccent} style={{ display: 'block' }}>One Farm at a Time.</span>
          </h1>
          <p className={styles.heroSub}>
            EducFarm specializes in producing smart irrigation systems that help farmers across Africa
            conserve water, protect crops, and grow more reliably — with solar-powered hardware,
            real-time data, and automated intelligence.
          </p>

          <div className={styles.heroActions}>
            {user ? (
              <button className={styles.ctaPrimary} onClick={() => navigate(dashPath)}>
                View My Dashboard
              </button>
            ) : (
              <Link to="/signup" className={styles.ctaPrimary}>Register a System</Link>
            )}
            <Link to="/invest/form" className={styles.ctaSecondary}>
              Invest Now
            </Link>
          </div>
        </div>
      </section>
      </div>

      {/* ── Problem and solution ─────────────────────── */}
      <section className={styles.conserveSection}>
        <div className={styles.conserveGrid}>
          <div className={styles.conserveItem}>
            <span className={styles.sectionLabel}>The challenge</span>
            <h2 className={styles.conserveTitle}>The Problem We&apos;re Solving</h2>
            <p className={styles.conserveDesc}>Farmers across Africa face unpredictable rainfall, water scarcity, and rising operating costs. Traditional irrigation often wastes water, depends on manual decisions, and leaves crops vulnerable when conditions change.</p>
          </div>
          <div className={styles.conserveItem}>
            <span className={styles.sectionLabel}>The opportunity</span>
            <h2 className={styles.conserveTitle}>Our Solution</h2>
            <p className={styles.conserveDesc}>EducFarm produces smart irrigation systems that combine solar-powered hardware, soil and weather data, and automated control. We give farmers a practical path to grow more efficiently while giving investors and partners a way to support resilient agriculture at scale.</p>
          </div>
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

      {/* ── Yonder Farm ─────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.exploreLayout}>
          <div className={styles.exploreVisual}>
            <img
              className={styles.exploreImage}
              src="https://res.cloudinary.com/d5qqtsou/image/upload/f_auto,q_auto,w_640/v1788426936/sm_smo9sk.jpg"
              alt="Students and Stanbic Bank team inspecting EducFarm system at Yonder Farm"
              loading="lazy"
              fetchpriority="high"
              width="640"
              height="460"
            />
            <span className={styles.exploreBadge}>Yonder Farm, Fort Portal City</span>
          </div>
          <div className={styles.exploreContent}>
            <div className={styles.sectionLabel}>In the Field</div>
            <h2 className={styles.sectionTitle}>Students &amp; Stanbic Bank inspect the system at Yonder Farm</h2>
            <p className={styles.sectionSub}>
              Students from Kyebambe alongside a Stanbic Bank team visited Yonder Farm to inspect
              the EducFarm smart irrigation system they installed. The visit confirmed the system
              was operating reliably in real field conditions — automating irrigation, monitoring
              soil health, and delivering measurable results from day one.
            </p>
            <div className={styles.featureGrid}>
              {YONDER_EFFECTS.map(({ title, desc }) => (
                <div key={title} className={styles.featureCard}>
                  <h3 className={styles.featureTitle}>{title}</h3>
                  <p className={styles.featureDesc}>{desc}</p>
                </div>
              ))}
            </div>
            <div className={styles.featureLinks}>
              <Link to="/about" className={styles.textLink}>Read our story <span aria-hidden="true">→</span></Link>
              <Link to="/invest" className={styles.textLink}>Explore the opportunity <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STEM: Wiring ────────────────────────────── */}
      <section className={styles.stemSection}>
        <div className={styles.stemInner}>
          {/* decorative circle image block */}
          <div className={styles.stemCircleWrap}>
            <div className={styles.stemRing1} />
            <div className={styles.stemRing2} />
            <div className={styles.stemRing3} />
            <div className={styles.stemCircle}>
              <img
                src="https://res.cloudinary.com/d5qqtsou/image/upload/f_auto,q_auto,w_360/v1788603321/wiring_gdlj4e.jpg"
                alt="Students wiring an EducFarm irrigation system"
                className={styles.stemCircleImg}
                loading="lazy"
                width="360"
                height="360"
              />
            </div>
            <span className={styles.stemFloatBadge}>Hands-on Wiring</span>
            <span className={styles.stemFloatStat}>STEM<br/>Education</span>
          </div>

          {/* content */}
          <div className={styles.stemContent}>
            <span className={styles.stemChip}>Education &amp; Innovation</span>
            <h2 className={styles.stemTitle}>Students build real systems that solve real problems</h2>
            <p className={styles.stemSub}>EducFarm promotes STEM education in schools — making students confident with technology by putting tools directly in their hands. Using available local resources, students assemble working irrigation systems and deploy solutions that address real challenges faced by farmers.</p>
            <div className={styles.stemPoints}>
              {[
                { text: 'Confident with sensors, microcontrollers, and software' },
                { text: 'Physically wire and assemble irrigation hardware' },
                { text: 'Deploy solutions using locally available resources' },
              ].map(({ text }) => (
                <div key={text} className={styles.stemPoint}>
                  <span className={styles.stemPointText}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STEM: Certification ─────────────────────── */}
      <section className={styles.stemSectionAlt}>
        {/* full-bleed image */}
        <img
          className={styles.certBgImg}
          src="https://res.cloudinary.com/d5qqtsou/image/upload/f_auto,q_auto,w_1100/v1788603321/honoring_gjmrrr.jpg"
          alt="Students honoured at AYuTe Africa competition"
          loading="lazy"
          width="1100"
          height="560"
        />
        {/* diagonal fade: right=image visible, left=dark for text */}
        <div className={styles.certDiagOverlay} />

        {/* all content sits on top */}
        <div className={styles.certInner}>
          <div className={styles.stemContent}>
            <span className={styles.stemChip}>Recognition &amp; Opportunity</span>
            <h2 className={styles.stemTitle}>Students represent EducFarm on bigger stages</h2>
            <p className={styles.stemSub}>EducFarm opens doors beyond the classroom. Students are connected to business bootcamps, seminars, and real competitions — including the AYuTe Africa Challenge and Heifer International programmes — where they pitch, compete, and grow as young agri-entrepreneurs.</p>
            <div className={styles.stemPoints}>
              {[
                { text: 'Represented EducFarm at the AYuTe Africa agri-tech competition' },
                { text: 'Participated in Heifer International entrepreneurship programmes' },
                { text: 'Attended business bootcamps and seminars as EducFarm ambassadors' },
              ].map(({ text }) => (
                <div key={text} className={styles.stemPoint}>
                  <span className={styles.stemPointText}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── The product ─────────────────────────────── */}
      <section className={styles.processSection}>
        <div className={styles.processContent}>
          <div className={styles.sectionLabel} style={{ color: '#4ade80', textAlign: 'left' }}>The EducFarm product</div>
          <h2 className={styles.processTitle}>Intelligent irrigation, built for real farms</h2>
          <p className={styles.processIntro}>EducFarm is a complete smart irrigation system that brings together dependable field hardware, useful data, and automation in one practical product.</p>
          <div className={styles.productHighlights}>
            {PRODUCT_HIGHLIGHTS.map(({ label, desc }) => (
              <div key={label} className={styles.productHighlight}>
                <span className={styles.productMarker} aria-hidden="true" />
                <div>
                  <h3 className={styles.stepLabel}>{label}</h3>
                  <p className={styles.stepDesc}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.processVisual}>
          <img
            className={styles.processImage}
            src="https://res.cloudinary.com/d5qqtsou/image/upload/f_auto,q_auto,w_640/v1788421593/irrigation_ntubcn.jpg"
            alt="EducFarm smart irrigation system"
            loading="lazy"
            width="640"
            height="440"
          />
          <div className={styles.processCaption}>Smart irrigation, made practical</div>
        </div>
      </section>

      {/* ── Investor CTA ────────────────────────────── */}
      <section className={`${styles.sectionDark} ${styles.investorSection}`} style={{ textAlign: 'center' }}>
        <div className={styles.sectionLabel} style={{ color: '#4ade80' }}>Invest in the future of farming</div>
        <h2 className={styles.sectionTitle} style={{ color: '#fff' }}>
          Help build a more resilient agricultural future.
        </h2>
        <p className={styles.sectionSub} style={{ color: '#9ca3af', maxWidth: 480, margin: '0 auto 2rem' }}>
          Support EducFarm as we produce smart irrigation systems that help farmers use resources wisely and grow with greater confidence.
        </p>
        <div className={styles.heroCta} style={{ justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/invest/form" className={styles.ctaPrimary}>
            Invest Now
          </Link>
        </div>
        <p style={{ color: '#6b7280', fontSize: '0.78rem', marginTop: '1.2rem' }}>
          Learn about our vision, opportunity, and plans for growth.
        </p>
      </section>

      <PublicFooter />

    </div>
  );
}
