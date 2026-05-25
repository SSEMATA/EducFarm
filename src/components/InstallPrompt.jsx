import { useEffect, useState } from 'react';
import { Download, X, Share, Smartphone } from 'lucide-react';
import EducFarmLogo from './EducFarmLogo';
import styles from './InstallPrompt.module.css';

// Detect iOS
const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// Detect already installed (standalone mode)
const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow]                     = useState(false);
  const [ios, setIos]                       = useState(false);

  useEffect(() => {
    // Already installed — never show
    if (isStandalone()) return;

    const dismissed = localStorage.getItem('pwa_dismissed');
    // Reset dismiss after 3 days so user gets another chance
    if (dismissed) {
      const age = Date.now() - parseInt(dismissed, 10);
      if (age < 3 * 24 * 60 * 60 * 1000) return;
      localStorage.removeItem('pwa_dismissed');
    }

    if (isIOS()) {
      setIos(true);
      setShow(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Expose globally so Settings page can trigger it
    window.__pwaPromptShow = () => setShow(true);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      delete window.__pwaPromptShow;
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShow(false);
    if (outcome === 'dismissed') {
      localStorage.setItem('pwa_dismissed', Date.now().toString());
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('pwa_dismissed', Date.now().toString());
  };

  if (!show) return null;

  return (
    <div className={styles.backdrop} onClick={handleDismiss}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>

        {/* Close */}
        <button className={styles.closeBtn} onClick={handleDismiss} aria-label="Close">
          <X size={18} strokeWidth={2} />
        </button>

        {/* Logo */}
        <div className={styles.logoWrap}>
          <EducFarmLogo size={44} variant="dark" showText={false} />
        </div>

        <h3 className={styles.title}>Install EducFarm</h3>
        <p className={styles.desc}>
          Get the full app experience — works offline, loads instantly, and sits right on your home screen.
        </p>

        {/* Features */}
        <div className={styles.features}>
          <div className={styles.feature}><Smartphone size={15} color="#4ade80" /><span>Works offline</span></div>
          <div className={styles.feature}><Download   size={15} color="#4ade80" /><span>Instant access</span></div>
          <div className={styles.feature}><Share      size={15} color="#4ade80" /><span>No app store needed</span></div>
        </div>

        {ios ? (
          /* iOS instructions */
          <div className={styles.iosSteps}>
            <p className={styles.iosHint}>To install on iOS:</p>
            <ol className={styles.iosList}>
              <li>Tap the <strong>Share</strong> button <span className={styles.iosIcon}>⎙</span> in Safari</li>
              <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
              <li>Tap <strong>"Add"</strong> to confirm</li>
            </ol>
          </div>
        ) : (
          <button className={styles.installBtn} onClick={handleInstall}>
            <Download size={16} strokeWidth={2} />
            Install App
          </button>
        )}

        <button className={styles.laterBtn} onClick={handleDismiss}>
          Maybe later
        </button>
      </div>
    </div>
  );
}
