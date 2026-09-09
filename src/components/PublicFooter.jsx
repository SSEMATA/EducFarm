import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTiktok, FaInstagram, FaLinkedin } from 'react-icons/fa6';
import { Phone, Mail, MapPin } from 'lucide-react';
import ShopModal from './ShopModal';
import EducFarmLogo from './EducFarmLogo';
import styles from './PublicFooter.module.css';

const SOCIALS = [
  { Icon: FaTiktok,    href: 'https://www.tiktok.com/@Kyebambe-educfarm-innovators',                   label: 'TikTok'    },
  { Icon: FaInstagram, href: 'https://www.instagram.com/Kyebambe-educfarm-innovators',                 label: 'Instagram' },
  { Icon: FaLinkedin,  href: 'https://www.linkedin.com/company/kyebambe-educfarm-innovators-limited/', label: 'LinkedIn'  },
];

export default function PublicFooter() {
  const [shopOpen, setShopOpen] = useState(false);

  return (
    <>
      {shopOpen && <ShopModal onClose={() => setShopOpen(false)} />}
      <footer className={styles.footer}>

        {/* ── Top accent bar ── */}
        <div className={styles.accentBar} />

        <div className={styles.shell}>

          {/* ── Brand ── */}
          <div className={styles.brand}>
            <EducFarmLogo size={32} variant="dark" showText />
            <p className={styles.brandTagline}>
              Smart irrigation systems that help farmers across Africa conserve water,
              protect crops, and grow more reliably.
            </p>
            <div className={styles.brandBadge}>
              <span className={styles.badgeDot} />
              Kyebambe, Fort Portal City · Uganda
            </div>
          </div>

          {/* ── Explore ── */}
          <div className={styles.col}>
            <h4 className={styles.colHeading}>Explore</h4>
            <nav className={styles.colLinks}>
              <Link to="/"        className={styles.colLink}>Home</Link>
              <Link to="/about"   className={styles.colLink}>About Us</Link>
              <Link to="/invest"  className={styles.colLink}>Invest</Link>
              <Link to="/contact" className={styles.colLink}>Contact</Link>
              <button type="button" onClick={() => setShopOpen(true)} className={styles.colLink}>
                Buy a System
              </button>
            </nav>
          </div>

          {/* ── Account ── */}
          <div className={styles.col}>
            <h4 className={styles.colHeading}>Account</h4>
            <nav className={styles.colLinks}>
              <Link to="/login"  className={styles.colLink}>Log In</Link>
              <Link to="/signup" className={styles.colLink}>Register a System</Link>
            </nav>
          </div>

          {/* ── Contact ── */}
          <div className={styles.col}>
            <h4 className={styles.colHeading}>Contact Us</h4>
            <div className={styles.colLinks}>
              <a href="tel:+256794448439" className={styles.contactRow}>
                <span className={styles.contactIcon}><Phone size={14} strokeWidth={2} /></span>
                <span>+256 794 448 439</span>
              </a>
              <a href="tel:+256754320214" className={styles.contactRow}>
                <span className={styles.contactIcon}><Phone size={14} strokeWidth={2} /></span>
                <span>+256 754 320 214</span>
              </a>
              <a href="tel:+256785905091" className={styles.contactRow}>
                <span className={styles.contactIcon}><Phone size={14} strokeWidth={2} /></span>
                <span>+256 785 905 091</span>
              </a>
              <a href="mailto:educarmcompanylimited@gmail.com" className={styles.contactRow}>
                <span className={styles.contactIcon}><Mail size={14} strokeWidth={2} /></span>
                <span>educarmcompanylimited@gmail.com</span>
              </a>
              <span className={styles.contactRow}>
                <span className={styles.contactIcon}><MapPin size={14} strokeWidth={2} /></span>
                <span>Kyebambe, Fort Portal City</span>
              </span>
            </div>
          </div>

          {/* ── Follow Us ── */}
          <div className={styles.col}>
            <h4 className={styles.colHeading}>Follow Us</h4>
            <div className={styles.socialsRow}>
              {SOCIALS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={styles.socialIcon}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div className={styles.bottom}>
          <span className={styles.bottomCopy}>
            &copy; {new Date().getFullYear()} Kyebambe EducFarm Innovators Limited. All rights reserved.
          </span>
          <span className={styles.bottomRight}>
            Built with care for African farmers.
          </span>
        </div>

      </footer>
    </>
  );
}
