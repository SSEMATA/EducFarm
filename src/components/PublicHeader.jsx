import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, ShoppingCart, Menu, X } from 'lucide-react';
import ShopModal from './ShopModal';
import EducFarmLogo from './EducFarmLogo';
import { useAuth } from '../context/AuthContext';
import styles from './PublicHeader.module.css';

export default function PublicHeader({ showIcons = true, showCartIcon = showIcons }) {
  const [shopOpen, setShopOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);
  const navigate = useNavigate();
  const dashboardPath = user?.is_staff ? '/admin/dashboard' : '/dashboard';

  return (
    <>
      {shopOpen && <ShopModal onClose={() => setShopOpen(false)} showIcons={showIcons} />}
      <header className={styles.header}>
        <EducFarmLogo size={30} variant="dark" showText />
        {menuOpen && <div className={styles.overlay} onClick={() => setMenuOpen(false)} aria-hidden="true" />}
        <button type="button" className={styles.menuButton} onClick={() => setMenuOpen(true)} aria-label="Open navigation menu">
          <Menu size={20} />
        </button>
        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`} aria-label="Main navigation">
          <button type="button" className={styles.closeButton} onClick={() => setMenuOpen(false)} aria-label="Close navigation menu">
            <X size={20} />
          </button>
          <Link to="/" className={styles.navLink} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/invest" className={styles.navLink} onClick={() => setMenuOpen(false)}>Invest</Link>
          <Link to="/about" className={styles.navLink} onClick={() => setMenuOpen(false)}>About Us</Link>
          <Link to="/contact" className={styles.navLink} onClick={() => setMenuOpen(false)}>Contact Us</Link>
          <span className={styles.divider} aria-hidden="true" />
          <button type="button" className={styles.orderButton} onClick={() => { setMenuOpen(false); setShopOpen(true); }}>
            {showCartIcon && <ShoppingCart size={15} />} <span>Buy system</span>
          </button>
          {user ? (
            <>
              <button type="button" className={styles.dashboardButton} onClick={() => { setMenuOpen(false); navigate(dashboardPath); }}>
                {showIcons && <LayoutDashboard size={14} />} Dashboard
              </button>
              <button type="button" className={styles.logoutButton} onClick={() => { setMenuOpen(false); logout(); }}>
                {showIcons && <LogOut size={14} />} Logout
              </button>
            </>
          ) : (
            <Link to="/login" className={styles.actionLink} onClick={() => setMenuOpen(false)}>
              Log In
            </Link>
          )}
        </nav>
      </header>
    </>
  );
}
