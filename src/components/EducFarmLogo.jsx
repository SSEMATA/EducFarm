/**
 * EducFarmLogo
 * Props:
 *   size     — icon size in px (default 36)
 *   variant  — 'dark' (white text, for dark bg) | 'light' (dark text, for light bg)
 *   showText — show wordmark beside icon (default true)
 */
import { useId } from 'react';

export default function EducFarmLogo({ size = 36, variant = 'dark', showText = true }) {
  const uid       = useId().replace(/:/g, '');
  const textColor = variant === 'dark' ? '#ffffff' : '#0f2e1a';
  const subColor  = variant === 'dark' ? 'rgba(255,255,255,0.55)' : '#6b7280';

  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}>
      {/* Icon mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id={`${uid}-leaf`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4ade80"/>
            <stop offset="100%" stopColor="#15803d"/>
          </linearGradient>
          <linearGradient id={`${uid}-stem`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e"/>
            <stop offset="100%" stopColor="#166534"/>
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width="48" height="48" rx="12" fill="#0f2e1a"/>

        {/* ── Leaf (top-right) ── */}
        <path
          d="M26 6 C26 6 41 10 41 24 C41 33 34 38 26 39 C26 39 26 22 11 18 C11 18 15 6 26 6 Z"
          fill={`url(#${uid}-leaf)`} opacity="0.95"
        />
        <path
          d="M26 6 C26 6 11 10 11 24 C11 33 18 38 26 39 C26 39 26 22 11 18 C11 18 15 6 26 6 Z"
          fill="white" opacity="0.13"
        />
        {/* Leaf veins */}
        <path d="M26 39 C26 39 26 22 11 18" stroke="#166534" strokeWidth="1.1" strokeLinecap="round" opacity="0.5"/>
        <path d="M26 30 C30 26 36 24 41 24" stroke="#166534" strokeWidth="0.9" strokeLinecap="round" opacity="0.4"/>
        <path d="M26 22 C30 19 35 18 38 17" stroke="#166534" strokeWidth="0.9" strokeLinecap="round" opacity="0.4"/>
        <path d="M26 30 C22 26 16 24 11 24" stroke="white"   strokeWidth="0.9" strokeLinecap="round" opacity="0.22"/>
        <path d="M26 22 C22 19 17 18 14 17" stroke="white"   strokeWidth="0.9" strokeLinecap="round" opacity="0.22"/>

        {/* ── Microcontroller chip (bottom-left, overlapping leaf base) ── */}
        {/* Chip body */}
        <rect x="5" y="30" width="18" height="14" rx="2" fill="#fff" stroke="#fff" strokeWidth="1"/>
        {/* Chip label stripe */}
        <rect x="7" y="33" width="14" height="5" rx="1" fill="#fff" opacity="0.4"/>
        {/* Chip center dot */}
        <circle cx="14" cy="37" r="1.5" fill="#0f2e1a" opacity="0.7"/>
        {/* Left pins */}
        <line x1="5"  y1="33" x2="3"  y2="33" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>
        <line x1="5"  y1="36" x2="3"  y2="36" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>
        <line x1="5"  y1="39" x2="3"  y2="39" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>
        <line x1="5"  y1="42" x2="3"  y2="42" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>
        {/* Right pins */}
        <line x1="23" y1="33" x2="25" y2="33" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>
        <line x1="23" y1="36" x2="25" y2="36" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>
        <line x1="23" y1="39" x2="25" y2="39" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>
        <line x1="23" y1="42" x2="25" y2="42" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>
        {/* Top pins */}
        <line x1="9"  y1="30" x2="9"  y2="28" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>
        <line x1="14" y1="30" x2="14" y2="28" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>
        <line x1="19" y1="30" x2="19" y2="28" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>

        {/* Connector wire: chip top-pin to leaf stem */}
        <path d="M19 28 C22 25 24 30 26 39" stroke="#fff" strokeWidth="0.8" strokeLinecap="round" strokeDasharray="1.5 1.5" opacity="0.5"/>
      </svg>

      {/* Wordmark */}
      {showText && (
        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <span style={{
            fontSize: size * 0.42,
            fontWeight: 800,
            color: textColor,
            letterSpacing: '-0.3px',
            fontFamily: "system-ui, 'Segoe UI', sans-serif",
          }}>
            Educ<span style={{ color: '#4ade80' }}>Farm</span>
          </span>
          <span style={{
            fontSize: size * 0.24,
            color: subColor,
            fontWeight: 500,
            letterSpacing: '0.2px',
            fontFamily: "system-ui, 'Segoe UI', sans-serif",
          }}>
            Smart Irrigation
          </span>
        </span>
      )}
    </span>
  );
}
