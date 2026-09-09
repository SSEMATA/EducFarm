import { Link } from 'react-router-dom';
import { useMeta } from '../../hooks/useMeta';
import {
  TrendingUp, Droplets, Globe, ShieldCheck,
  Rocket, Zap, Award,
} from 'lucide-react';
import PublicHeader from '../../components/PublicHeader';
import PublicFooter from '../../components/PublicFooter';
import styles from './Invest.module.css';

const METRICS = [
  { value: '$2.7B',  label: 'African agri-tech market by 2030' },
  { value: '60%',   label: 'Water savings per farm' },
  { value: '80%',   label: 'Reduction in manual labour' },
  { value: '3×',    label: 'Faster crop response time' },
];

const WHY = [
  { Icon: Globe,       title: 'Proven Solution',        desc: 'EducFarm has moved beyond the prototype stage. We have deployed our smart irrigation technology in real agricultural environments and demonstrated that it works.' },
  { Icon: Droplets,    title: 'Food Security Mission',   desc: 'We are addressing one of Africa\'s most important challenges: food insecurity. EducFarm supports continuous food production throughout the year — even when rainfall is unreliable.' },
  { Icon: TrendingUp,  title: 'Ready to Scale',          desc: 'We are looking for investors, strategic partners, and organizations who believe in the future of smart, sustainable agriculture.' },
  { Icon: Zap,         title: 'Scale Production',        desc: 'Your investment helps us scale production and deploy more systems to farms and institutions across Africa.' },
  { Icon: ShieldCheck, title: 'Sustainable Agriculture', desc: 'We expand solar-powered, sustainable agriculture — reaching more farmers, more markets, and building a stronger, more food-secure Africa.' },
  { Icon: Award,       title: 'More Than an Investment', desc: 'When you partner with EducFarm, you support a technology business with a clear purpose: making food production more reliable, sustainable, and resilient.' },
];

export default function Invest() {
  useMeta({
    title: 'EducFarm | Invest in Smart Irrigation for Africa',
    description: 'Invest in EducFarm and help scale proven smart irrigation technology across Africa. Support solar-powered agriculture, water conservation, food security, and climate-resilient farming.',
    url: 'https://www.educfarm.com/invest',
    ogImage: 'https://res.cloudinary.com/d5qqtsou/image/upload/w_1200,h_630,c_fill,q_80,f_jpg/v1788947769/rt_tzoxtn.jpg',
    keywords: 'EducFarm, invest in EducFarm, invest in smart irrigation, smart irrigation investment, smart irrigation Africa, agricultural investment Africa, agtech investment Africa, agricultural technology investment, smart agriculture investment, sustainable agriculture investment, climate smart agriculture investment, irrigation investment Africa, solar irrigation investment, agriculture investment Uganda, agtech Uganda, African agriculture investment, food security investment Africa, climate resilient agriculture, sustainable agriculture Africa, smart farming investment, agricultural technology Africa, irrigation technology Africa, solar powered irrigation, smart irrigation systems Africa, agricultural innovation Africa, farm technology investment, agricultural solutions Africa, water saving agriculture, water efficient farming, food security Africa, sustainable farming technology, agriculture innovation Africa',
  });
  return (
    <div className={styles.page}>

      <PublicHeader />

      {/* ── Hero ── */}
      <div className={styles.heroSection}>
        <video
          className={styles.heroBgVideo}
          src="https://res.cloudinary.com/d5qqtsou/video/upload/v1788421243/irrigation_1_mz9qzu.mp4"
          autoPlay muted loop playsInline
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}><TrendingUp size={13} /> Investor Relations</div>
          <h1 className={styles.heroTitle}>
            Growing Food. <span className={styles.heroAccent}>Protecting the Future.</span>
          </h1>
          <p className={styles.heroSub}>
            EducFarm has deployed smart irrigation technology in real agricultural environments
            and demonstrated that it works. Now, we are ready to scale.
          </p>
          <div className={styles.heroCtas}>
            <Link to="/invest/form" className={styles.ctaPrimary}><Rocket size={15} /> Invest Now</Link>
            <Link to="/partnership" className={styles.ctaSecondary}>Become a Partner</Link>
          </div>
        </div>
        <div className={styles.waveDivider}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#fff" />
          </svg>
        </div>
      </div>

      {/* ── Metrics strip ── */}
      <div className={styles.metricsStrip}>
        {METRICS.map(({ value, label }) => (
          <div key={label} className={styles.metricItem}>
            <span className={styles.metricVal}>{value}</span>
            <span className={styles.metricLabel}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Why invest ── */}
      <section className={styles.whySection} id="why-invest">
        <div className={styles.whyInner}>
          <span className={styles.sectionLabel}>The opportunity</span>
          <h2 className={styles.sectionTitle}>From Prototype to Proven Solution</h2>
          <p className={styles.sectionSub}><strong>Beyond Irrigation. Toward Food Security.</strong><br />With <strong>309 million Africans facing hunger</strong>, EducFarm provides smart irrigation that helps farmers <strong>produce food more reliably, throughout the year, despite unreliable rainfall.</strong></p>
          <div className={styles.whyGrid}>
            {WHY.map(({ Icon, title, desc }) => (
              <div key={title} className={styles.whyCard}>
                <span className={styles.whyIcon}><Icon size={24} strokeWidth={1.8} /></span>
                <h3 className={styles.whyTitle}>{title}</h3>
                <p className={styles.whyDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Invest CTA ── */}
      <section className={styles.formSection}>
        <div className={styles.investCta}>
          <div className={styles.investMessage}>
            <span className={styles.sectionLabel}>Take the next step</span>
            <h2 className={styles.sectionTitle}>Invest in EducFarm</h2>
            <p className={styles.sectionSub}>Help scale practical irrigation technology for a more productive and resilient agricultural future.</p>
          </div>
          <div className={styles.investDetails}>
            <span className={styles.investDetailsLabel}>Your next step</span>
            <h3>Start a meaningful conversation.</h3>
            <ul>
              <li>Share your investment interest</li>
              <li>Tell us about your goals and timeline</li>
              <li>Connect with the EducFarm team</li>
            </ul>
          </div>
          <Link to="/invest/form" className={styles.ctaPrimary}><Rocket size={15} /> Invest Now</Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
