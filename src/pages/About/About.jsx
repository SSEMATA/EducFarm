import { Link } from 'react-router-dom';
import {
  Leaf, Droplets, Globe, Rocket, Sprout, Heart, Award,
} from 'lucide-react';
import { useMeta } from '../../hooks/useMeta';
import PublicHeader from '../../components/PublicHeader';
import PublicFooter from '../../components/PublicFooter';
import styles from './About.module.css';

const VALUES = [
  { img: 'https://res.cloudinary.com/d5qqtsou/image/upload/v1788420671/sunstanability_w2jslj.png', title: 'Sustainability', desc: 'Every drop of water saved is a step toward a greener planet. We build with nature in mind.' },
  { img: 'https://res.cloudinary.com/d5qqtsou/image/upload/v1788420866/innovation_tigfcj.png', title: 'Innovation', desc: 'Cutting-edge technology proving that world-class solutions can come from anywhere.' },
  { img: 'https://res.cloudinary.com/d5qqtsou/image/upload/v1788420867/community_sdlcke.jpg',      title: 'Community',     desc: 'We serve small and large farmers alike, making smart farming accessible to everyone.' },
  { img: 'https://res.cloudinary.com/d5qqtsou/image/upload/v1788420866/Reliability_n66ib9.png',    title: 'Reliability',   desc: "Farmers depend on us 24/7. We build systems that work even when the internet doesn't." },
];

const MILESTONES = [
  { year: '2025', label: 'Idea born',       desc: 'The EducFarm concept was conceived — a smart irrigation system to solve water waste and food insecurity across Africa.' },
  { year: 'June 2026', label: 'Development begins', desc: 'Engineering kicked off in early June 2026 — hardware design, embedded firmware, backend API, and the React PWA built in parallel.' },
  { year: 'July 2026', label: 'Deployed',    desc: 'EducFarm was deployed to real farms in Uganda — live sensor data, automated irrigation, SMS alerts, and GPS tracking all running in production.' },
];

const TEAM = [
  { name: 'Ainembabazi Junior', role: 'Managing Director', desc: 'Leads overall company strategy, operations and execution.', img: 'https://res.cloudinary.com/d5qqtsou/image/upload/v1788523928/jun_gzinul.png' },
  { name: 'Tuhaise Juliet', role: 'Growth Lead', desc: 'Leads business growth, partnerships, customer engagement and funding implementation.', img: 'https://res.cloudinary.com/d5qqtsou/image/upload/v1788523397/juliet_yh7zbq.jpg' },
  { name: 'Wembabazi Mariana', role: 'Head of Marketing and Communication Lead', desc: 'Leads marketing, customer outreach and brand communication.', img: 'https://res.cloudinary.com/d5qqtsou/image/upload/v1788523398/marianah_ykookg.jpg' },
  { name: 'Musoki Gracious', role: 'Production and Operational Lead', desc: 'Oversees production, quality control and delivery of irrigation systems.', img: 'https://res.cloudinary.com/d5qqtsou/image/upload/v1788524296/GR_zenx8f.jpg' },
  { name: 'Ssemata Sabira', role: 'Chief Technology Officer', desc: 'Leads technology development, system improvement and technical innovation.', img: 'https://res.cloudinary.com/d5qqtsou/image/upload/v1788523398/me_jr7tqk.jpg' },
];

export default function About() {
  useMeta({
    title: 'EducFarm | About Us',
    description: 'Learn how EducFarm is transforming African agriculture with affordable solar-powered smart irrigation, real-time farm data, weather intelligence, and automated water management.',
    url: 'https://www.educfarm.com/about',
    ogImage: 'https://res.cloudinary.com/d5qqtsou/image/upload/w_1200,h_630,c_fill,q_80,f_jpg/v1788603321/wiring_gdlj4e.jpg',
    keywords: 'EducFarm, EducFarm Africa, about EducFarm, smart irrigation Africa, smart irrigation Uganda, smart irrigation systems, smart farming Africa, smart farming Uganda, smart agriculture Africa, smart agriculture Uganda, sustainable agriculture Africa, sustainable farming Africa, agricultural technology Africa, agricultural technology Uganda, agtech Africa, agtech Uganda, irrigation technology Africa, irrigation technology Uganda, automated irrigation systems, automated farm irrigation, solar powered irrigation, solar irrigation systems, solar irrigation Uganda, smart farming technology, intelligent irrigation systems, precision irrigation, precision agriculture Africa, digital agriculture Africa, agricultural innovation Africa, agricultural innovation Uganda, farm automation, automated farming, agricultural automation, smart farm technology, smart farm solutions, soil moisture sensors, soil moisture monitoring, weather intelligence for farmers, weather based irrigation, real time farm monitoring, farm monitoring systems, agricultural monitoring technology, smart farming sensors, water conservation agriculture, water saving irrigation, water efficient farming, water management for farms, agricultural water management, sustainable irrigation, climate smart agriculture, climate smart farming, climate resilient agriculture, climate resilient farming, food security Africa, food production Africa, African farmers, farming solutions Africa, agriculture solutions Africa, agricultural solutions Uganda, farming technology Africa, farming technology Uganda, technology for farmers, affordable smart irrigation, affordable irrigation systems, solar powered farming, sustainable farming technology, smart agriculture solutions, agricultural technology solutions, irrigation solutions Africa, irrigation solutions Uganda, modern irrigation systems, modern farming technology, innovative farming technology, farm technology Africa, farm technology Uganda, water efficient irrigation systems, water conservation farming, reduce water waste farming, smart irrigation technology, automated water management, remote irrigation control, real time irrigation monitoring, crop monitoring systems, crop health monitoring, soil health monitoring, agricultural data technology, farm data analytics, agricultural data analytics, digital farming solutions, IoT agriculture, IoT farming, agriculture IoT solutions, smart farm monitoring, smart agricultural technology, sustainable agriculture technology, agriculture innovation technology, African agriculture technology',
  });
  return (
    <div className={styles.page}>

      <PublicHeader />

      {/* ── Hero ── */}
      <div className={styles.heroSection}>
        <video
          className={styles.heroBgVideo}
          src="https://res.cloudinary.com/d5qqtsou/video/upload/v1788421243/irrigation_1_mz9qzu.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}><Leaf size={13} /> Our Story</div>
          <h1 className={styles.heroTitle}>
            Smart farming, <span className={styles.heroAccent}>built for Africa</span>
          </h1>
          <p className={styles.heroSub}>
            EducFarm was born from a real observation — watching crops wither and die during unexpected dry spells, seeing the environment change, and witnessing farmers lose harvests to a climate that no longer follows the old patterns. That frustration became a mission.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}><span className={styles.heroStatVal}>60%</span><span className={styles.heroStatLabel}>Less water used</span></div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}><span className={styles.heroStatVal}>24/7</span><span className={styles.heroStatLabel}>Automated monitoring</span></div>
          </div>
        </div>
        <div className={styles.waveDivider}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#fff" />
          </svg>
        </div>
      </div>

      {/* ── Mission ── */}
      <section className={styles.missionSection}>
        <div className={styles.missionGrid}>
          <div className={styles.missionText}>
            <span className={styles.sectionLabel}>Our Mission</span>
            <h2 className={styles.sectionTitle}>Feeding Africa with smarter farming</h2>
            <p className={styles.sectionDesc}>
              Millions of African farmers lose crops every year to over-watering, drought, and lack of
              real-time information. EducFarm exists to change that — putting affordable, solar-powered
              smart irrigation in the hands of every farmer, from a small backyard garden to a large
              commercial farm.
            </p>
            <p className={styles.sectionDesc}>
              We combine soil moisture sensors, weather intelligence, SMS alerts, and a beautiful
              dashboard into one system that works even in areas with limited connectivity.
            </p>
            <Link to="/contact" className={styles.missionCta}>
              <Rocket size={15} /> Get in touch <span>→</span>
            </Link>
          </div>
          <div className={styles.missionVisual}>
            <div className={styles.missionCard}>
              <Droplets size={32} strokeWidth={1.6} color="#3b82f6" />
              <h3>Water Conservation</h3>
              <p>Only irrigates when soil moisture drops below threshold — cutting waste by up to 60%.</p>
            </div>
            <div className={styles.missionCard}>
              <Globe size={32} strokeWidth={1.6} color="#22c55e" />
              <h3>Weather-Aware</h3>
              <p>Skips irrigation automatically when rain is forecast — working with nature, not against it.</p>
            </div>
            <div className={styles.missionCard}>
              <Sprout size={32} strokeWidth={1.6} color="#f59e0b" />
              <h3>Healthier Crops</h3>
              <p>Precise watering prevents waterlogging and soil erosion, keeping land fertile for seasons.</p>
            </div>
            <div className={styles.missionCard}>
              <Award size={32} strokeWidth={1.6} color="#8b5cf6" />
              <h3>Purpose-Driven</h3>
              <p>Designed and developed with a clear mission — making food production more reliable, sustainable, and resilient.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className={styles.valuesSection}>
        <div className={styles.valuesInner}>
          <span className={styles.sectionLabel} style={{ color: '#4ade80' }}>What drives us</span>
          <h2 className={styles.sectionTitle} style={{ color: '#fff' }}>Our core values</h2>
          <div className={styles.valuesGrid}>
            {VALUES.map(({ img, title, desc }) => (
              <div key={title} className={styles.valueCard}>
                <div className={styles.valueImgWrap}>
                  <img src={img} alt={title} className={styles.valueImg} />
                  <div className={styles.valueImgOverlay} />
                  <h3 className={styles.valueTitle}>{title}</h3>
                </div>
                <p className={styles.valueDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className={styles.timelineSection}>
        <span className={styles.sectionLabel}>How we got here</span>
        <h2 className={styles.sectionTitle}>Our journey</h2>
        <div className={styles.timeline}>
          {MILESTONES.map(({ year, label, desc }, i) => (
            <div key={year} className={styles.timelineItem}>
              <div className={styles.timelineLeft}>
                <span className={styles.timelineYear}>{year}</span>
              </div>
              <div className={styles.timelineLine}>
                <div className={styles.timelineDot} />
                {i < MILESTONES.length - 1 && <div className={styles.timelineConnector} />}
              </div>
              <div className={styles.timelineRight}>
                <h3 className={styles.timelineLabel}>{label}</h3>
                <p className={styles.timelineDesc}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Team ── */}
      <section className={styles.teamSection}>
        <div className={styles.teamInner}>
          <span className={styles.sectionLabel} style={{ color: '#4ade80' }}>The people behind it</span>
          <h2 className={styles.sectionTitle} style={{ color: '#fff' }}>Meet the team</h2>
          <div className={styles.teamGrid}>
            {TEAM.map(({ name, role, desc, img }) => (
              <div key={name} className={styles.teamCard}>
                <div className={styles.teamAvatar}>
                  {img ? <img src={img} alt={name} className={styles.teamPhoto} loading="lazy" /> : name.charAt(0)}
                </div>
                <h3 className={styles.teamName}>{name}</h3>
                <p className={styles.teamRole}>{role}</p>
                <p className={styles.teamDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <Heart size={28} strokeWidth={1.8} className={styles.ctaHeart} />
        <h2 className={styles.ctaTitle}>Ready to grow smarter?</h2>
        <p className={styles.ctaSub}>Join farmers across Uganda already using EducFarm to save water, reduce labour, and grow more.</p>
        <div className={styles.ctaButtons}>
          <Link to="/signup" className={styles.ctaPrimary}><Rocket size={15} /> Register a System</Link>
          <Link to="/contact" className={styles.ctaSecondary}>Contact Us →</Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
