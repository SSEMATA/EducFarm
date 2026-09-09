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
    title: 'EducFarm | Smart Irrigation Investment in Africa',
    description: 'Invest in EducFarm and be part of the future of African agriculture. Our smart irrigation systems combine solar-powered technology, real-time farm data, and automation to help farmers conserve water, reduce operating costs, and grow more reliably. Together, we are building scalable solutions for sustainable, climate-resilient irrigation across Africa.',
    url: 'https://www.educfarm.com/invest',
    ogImage: 'https://address-restaurant2.odoo.com/web/image/2152-993be8ba/Smart-Irrigation-Valve-System.webp',
    keywords: 'EducFarm investment, EducFarm investors, invest in EducFarm, investment opportunities EducFarm, agricultural investment Africa, agriculture investment Africa, invest in agriculture Africa, African agriculture investment, farming investment Africa, farm investment Africa, agricultural technology investment, agtech investment, agtech investment Africa, agritech investment Africa, smart agriculture investment, smart farming investment, smart irrigation investment, irrigation technology investment, irrigation investment Africa, sustainable agriculture investment, sustainable farming investment, climate smart agriculture investment, climate smart farming investment, agricultural innovation investment, agriculture startup investment, African startup investment, impact investment Africa, sustainable investment Africa, green investment Africa, climate investment Africa, agricultural impact investment, agriculture funding Africa, agricultural technology funding, agtech funding Africa, smart farming funding, farm technology investment, sustainable farming opportunities, agriculture investment opportunities Africa, investment opportunities in Africa, invest in African agriculture, invest in farming Africa, invest in sustainable agriculture, invest in smart farming, invest in agricultural technology, invest in irrigation technology, invest in solar irrigation, solar irrigation investment, solar agriculture investment, renewable energy agriculture investment, solar powered farming investment, climate resilient agriculture investment, water technology investment, agricultural water technology investment, sustainable water investment, smart water management investment, precision agriculture investment, precision farming investment, digital agriculture investment, agricultural automation investment, farm automation investment, IoT agriculture investment, agricultural technology Africa, agtech Africa, agritech Africa, smart farming Africa, precision agriculture Africa, digital agriculture Africa, sustainable agriculture Africa, climate smart agriculture Africa, agricultural innovation Africa, future of agriculture Africa, future farming Africa, impact investing in agriculture, impact investing Africa, sustainable investing Africa, ESG investment Africa, climate technology investment Africa, agricultural sustainability investment, food security investment Africa, food systems investment Africa, agricultural productivity investment, water efficient agriculture investment, water saving technology investment, smart irrigation technology Africa, automated irrigation investment, scalable agriculture solutions, scalable agricultural technology, scalable agtech Africa, technology for African farmers, supporting African farmers, investing in African farmers, agricultural transformation Africa, sustainable agricultural development, resilient agriculture investment, resilient food systems investment, agriculture for food security, food security Africa investment, agricultural growth Africa, private investment agriculture Africa, agribusiness investment Africa, agribusiness investment opportunities Africa, agricultural startup opportunities, startup investment Africa, impact startup investment, sustainable startup investment, climate startup investment Africa, agriculture innovation funding, agricultural technology opportunities Africa, smart irrigation opportunities Africa, solar irrigation opportunities Africa, future of farming investment, future of agriculture investment, invest in sustainable farming Africa, invest in agricultural innovation Africa, invest in climate smart agriculture Africa, invest in smart irrigation systems, invest in solar powered irrigation, invest in agricultural automation, invest in farm technology, African agritech investors, African agriculture investors, agriculture investment partners, agricultural investment partnerships, farm technology investors, agtech investors, agritech investors Africa, impact investors agriculture, sustainable agriculture investors, climate investors Africa, agricultural technology investors, smart farming investors, irrigation technology investors, solar agriculture investors, EducFarm smart irrigation investment, EducFarm agricultural technology investment, EducFarm sustainable agriculture investment, invest in smart agriculture Africa, invest in agricultural technology Africa, invest in sustainable agriculture Africa, invest in climate technology Africa, invest in food security Africa, invest in the future of African agriculture',
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
