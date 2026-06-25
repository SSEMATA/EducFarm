import { useEffect, useState, useRef, useCallback } from 'react';
import { WifiOff, Wifi, Loader } from 'lucide-react';
import styles from './OfflineBanner.module.css';

const PING_URL   = `${import.meta.env.VITE_API_URL}/api/users/system/status/`;
const INTERVAL   = 20_000; // probe every 20 s
const TIMEOUT    = 6_000;  // give up after 6 s

async function probe() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const res = await fetch(PING_URL, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export default function OfflineBanner() {
  // null = unknown (first probe in progress), true = reachable, false = unreachable
  const [reachable, setReachable] = useState(null);
  const [checking, setChecking]   = useState(true);
  const prevRef = useRef(null);
  const backTimer = useRef(null);
  const [showBack, setShowBack]   = useState(false);

  const runProbe = useCallback(async () => {
    setChecking(true);
    const ok = await probe();
    setChecking(false);
    setReachable(ok);

    if (ok && prevRef.current === false) {
      // just came back — show "back online" toast then hide
      setShowBack(true);
      clearTimeout(backTimer.current);
      backTimer.current = setTimeout(() => {
        setShowBack(false);
      }, 3000);
    }
    prevRef.current = ok;
  }, []);

  useEffect(() => {
    runProbe();
    const id = setInterval(runProbe, INTERVAL);

    // also re-probe immediately when browser says we're back
    window.addEventListener('online', runProbe);
    // and when an api call fails with no response
    window.addEventListener('api:networkerror', runProbe);

    return () => {
      clearInterval(id);
      clearTimeout(backTimer.current);
      window.removeEventListener('online', runProbe);
      window.removeEventListener('api:networkerror', runProbe);
    };
  }, [runProbe]);

  // nothing to show while first probe is still running
  if (reachable === null) return null;

  // reachable and no "back online" toast to show
  if (reachable && !showBack) return null;

  return (
    <div className={`${styles.banner} ${reachable ? styles.online : styles.offline}`}>
      {reachable ? (
        <>
          <Wifi size={15} strokeWidth={2.5} />
          <span>Back online!</span>
        </>
      ) : (
        <>
          <WifiOff size={15} strokeWidth={2.5} />
          <span>No internet — data may be outdated.</span>
          {checking && <Loader size={13} className={styles.spin} />}
        </>
      )}
    </div>
  );
}
