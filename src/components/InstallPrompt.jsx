import { useEffect, useState } from 'react';
import { Download, X, Share, Smartphone, CheckCircle, Info } from 'lucide-react';
import EducFarmLogo from './EducFarmLogo';
import styles from './InstallPrompt.module.css';

// Capture the prompt as early as possible — before React mounts
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.__pwaDeferred = e;
  });
}

const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// Chrome/Firefox on iOS cannot install PWAs — user must use Safari
const isIOSNonSafari = () =>
  isIOS() && !/^((?!chrome|android).)*safari/i.test(navigator.userAgent);

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

// SCREEN STATES
const S = { INSTALL: 'install', IOS: 'ios', IOS_BROWSER: 'ios_browser', SUCCESS: 'success', ALREADY: 'already', MANUAL: 'manual' };

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow]                     = useState(false);
  const [screen, setScreen]                 = useState(S.INSTALL);

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa_dismissed');
    if (dismissed) {
      const age = Date.now() - parseInt(dismissed, 10);
      if (age < 3 * 24 * 60 * 60 * 1000) {
        window.__pwaPromptShow = () => openPrompt();
        return;
      }
      localStorage.removeItem('pwa_dismissed');
    }
    if (!isStandalone()) setTimeout(openPrompt, 1500);
    window.__pwaPromptShow = () => openPrompt();
    return () => { delete window.__pwaPromptShow; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Also listen for beforeinstallprompt in case it fires after mount
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      window.__pwaDeferred = e;
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    // Pick up already-captured prompt
    if (window.__pwaDeferred) setDeferredPrompt(window.__pwaDeferred);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const openPrompt = () => {
    if (isStandalone()) { setScreen(S.ALREADY); setShow(true); return; }
    if (isIOSNonSafari()) { setScreen(S.IOS_BROWSER); setShow(true); return; }
    if (isIOS()) { setScreen(S.IOS); setShow(true); return; }
    const prompt = window.__pwaDeferred;
    if (prompt) { setDeferredPrompt(prompt); setScreen(S.INSTALL); setShow(true); }
    else { setScreen(S.MANUAL); setShow(true); }
  };

  const handleInstall = async () => {
    let prompt = deferredPrompt || window.__pwaDeferred;
    // If not ready yet, wait up to 3s for the browser to fire it
    if (!prompt) {
      for (let i = 0; i < 15; i++) {
        await new Promise((r) => setTimeout(r, 200));
        prompt = window.__pwaDeferred;
        if (prompt) break;
      }
    }
    if (!prompt) return; // browser doesn't support it — nothing to do
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    window.__pwaDeferred = null;
    setDeferredPrompt(null);
    if (outcome === 'accepted') {
      setScreen(S.SUCCESS);
    } else {
      localStorage.setItem('pwa_dismissed', Date.now().toString());
      setShow(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    if (screen !== S.SUCCESS && screen !== S.ALREADY) {
      localStorage.setItem('pwa_dismissed', Date.now().toString());
    }
  };

  if (!show) return null;

  return (
    <div className={styles.backdrop} onClick={handleDismiss}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>

        <button className={styles.closeBtn} onClick={handleDismiss} aria-label="Close">
          <X size={18} strokeWidth={2} />
        </button>

        {/* ── SUCCESS ── */}
        {screen === S.SUCCESS && (
          <div className={styles.successScreen}>
            <div className={styles.successIconWrap}>
              <CheckCircle size={56} strokeWidth={1.5} color="#22c55e" />
            </div>
            <h3 className={styles.title}>App Installed!</h3>
            <p className={styles.desc}>
              EducFarm has been added to your home screen. You can now open it like a native app — even offline.
            </p>
            <button className={styles.installBtn} onClick={handleDismiss}>
              Got it
            </button>
          </div>
        )}

        {/* ── ALREADY INSTALLED ── */}
        {screen === S.ALREADY && (
          <div className={styles.successScreen}>
            <div className={styles.alreadyIconWrap}>
              <Info size={48} strokeWidth={1.5} color="#3b82f6" />
            </div>
            <h3 className={styles.title}>Already Installed</h3>
            <p className={styles.desc}>
              EducFarm is already installed on your device and running as a native app.
            </p>
            <button className={styles.installBtn} onClick={handleDismiss}>
              OK
            </button>
          </div>
        )}

        {/* ── MANUAL (no prompt available, non-iOS) ── */}
        {screen === S.MANUAL && (
          <div className={styles.successScreen}>
            <div className={styles.logoWrap}>
              <EducFarmLogo size={44} variant="dark" showText={false} />
            </div>
            <h3 className={styles.title}>Install EducFarm</h3>
            <p className={styles.desc}>Your browser is preparing the install prompt…</p>
            <button className={styles.installBtn} onClick={handleInstall}>
              <Download size={16} strokeWidth={2} />
              Install App
            </button>
            <button className={styles.laterBtn} onClick={handleDismiss}>Maybe later</button>
          </div>
        )}

        {/* ── iOS non-Safari (Chrome/Firefox on iPhone) ── */}
        {screen === S.IOS_BROWSER && (
          <>
            <div className={styles.logoWrap}>
              <EducFarmLogo size={44} variant="dark" showText={false} />
            </div>
            <h3 className={styles.title}>Open in Safari to Install</h3>
            <p className={styles.desc}>
              iPhone and iPad only allow installing apps from <strong>Safari</strong>. Please open this page in Safari, then tap Install.
            </p>
            <div className={styles.iosSteps}>
              <div className={styles.iosStep}>
                <span className={styles.stepNum}>1</span>
                <span>Copy this page URL</span>
              </div>
              <div className={styles.iosStep}>
                <span className={styles.stepNum}>2</span>
                <span>Open <strong>Safari</strong> and paste the URL</span>
              </div>
              <div className={styles.iosStep}>
                <span className={styles.stepNum}>3</span>
                <span>Tap <strong>Share</strong> <span className={styles.iosIcon}>⎙</span> then <strong>"Add to Home Screen"</strong></span>
              </div>
            </div>
            <button className={styles.laterBtn} onClick={handleDismiss}>Maybe later</button>
          </>
        )}

        {/* ── iOS Safari instructions ── */}
        {screen === S.IOS && (
          <>
            <div className={styles.logoWrap}>
              <EducFarmLogo size={44} variant="dark" showText={false} />
            </div>
            <h3 className={styles.title}>Install on iPhone / iPad</h3>
            <p className={styles.desc}>Follow these steps in Safari to add EducFarm to your home screen.</p>
            <div className={styles.iosSteps}>
              <div className={styles.iosStep}>
                <span className={styles.stepNum}>1</span>
                <span>Tap the <strong>Share</strong> button <span className={styles.iosIcon}>⎙</span> at the bottom of Safari</span>
              </div>
              <div className={styles.iosStep}>
                <span className={styles.stepNum}>2</span>
                <span>Scroll and tap <strong>"Add to Home Screen"</strong></span>
              </div>
              <div className={styles.iosStep}>
                <span className={styles.stepNum}>3</span>
                <span>Tap <strong>"Add"</strong> to confirm</span>
              </div>
            </div>
            <button className={styles.laterBtn} onClick={handleDismiss}>Maybe later</button>
          </>
        )}

        {/* ── INSTALL (Android / Desktop) ── */}
        {screen === S.INSTALL && (
          <>
            <div className={styles.logoWrap}>
              <EducFarmLogo size={44} variant="dark" showText={false} />
            </div>
            <h3 className={styles.title}>Install EducFarm</h3>
            <p className={styles.desc}>
              Get the full app experience — works offline, loads instantly, and sits right on your home screen.
            </p>
            <div className={styles.features}>
              <div className={styles.feature}><Smartphone size={15} color="#4ade80" /><span>Works offline</span></div>
              <div className={styles.feature}><Download   size={15} color="#4ade80" /><span>Instant access</span></div>
              <div className={styles.feature}><Share      size={15} color="#4ade80" /><span>No app store needed</span></div>
            </div>
            <button className={styles.installBtn} onClick={handleInstall}>
              <Download size={16} strokeWidth={2} />
              Install App
            </button>
            <button className={styles.laterBtn} onClick={handleDismiss}>Maybe later</button>
          </>
        )}

      </div>
    </div>
  );
}
