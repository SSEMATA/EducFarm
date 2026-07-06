/**
 * Generates public/icons/og-image.png (1200×630)
 * Run: node scripts/generate-og.mjs
 */
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT  = path.join(__dirname, '../public/icons/og-image.png');
const W = 1200, H = 630;

// ── 1. Resize logo to 110×110 ──────────────────────────────────────────────
const logoBuf     = readFileSync(path.join(__dirname, '../public/icons/pwa-512.png'));
const logoResized = await sharp(logoBuf).resize(110, 110).toBuffer();

// ── 2. Build SVG background (no rgba, no embedded images) ─────────────────
const pills = [
  { label: '☀ Solar Powered', x: 108 },
  { label: '💧 Auto Pump',    x: 310 },
  { label: '🌧 Rain Skip',    x: 490 },
  { label: '💬 SMS Alerts',   x: 668 },
  { label: '📡 Live Data',    x: 848 },
  { label: '📍 GPS Track',    x: 1018 },
];

const pillW = 172, pillH = 38, pillRx = 19;

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="#071810"/>
      <stop offset="60%"  stop-color="#0f2e1a"/>
      <stop offset="100%" stop-color="#1a4a2e"/>
    </linearGradient>
    <radialGradient id="topglow" cx="50%" cy="0%" r="60%">
      <stop offset="0%"   stop-color="#4ade80" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#4ade80" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="botglow" cx="50%" cy="100%" r="50%">
      <stop offset="0%"   stop-color="#166534" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#166534" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#topglow)"/>
  <rect width="${W}" height="${H}" fill="url(#botglow)"/>

  <!-- Subtle dot grid -->
  ${Array.from({length: 25}, (_,col) =>
    Array.from({length: 13}, (_,row) =>
      `<circle cx="${col*50+25}" cy="${row*50+25}" r="1" fill="#4ade80" fill-opacity="0.07"/>`
    ).join('')
  ).join('')}

  <!-- Left accent bar -->
  <rect x="0" y="0" width="5" height="${H}" fill="#4ade80" opacity="0.8"/>

  <!-- Logo placeholder (composited after) -->
  <!-- Logo sits at x=80, y=200, 110×110 -->

  <!-- EducFarm wordmark -->
  <text x="220" y="265"
    font-family="Arial Black, Arial, sans-serif"
    font-size="80" font-weight="900" letter-spacing="-3" fill="#ffffff">Educ</text>
  <text x="452" y="265"
    font-family="Arial Black, Arial, sans-serif"
    font-size="80" font-weight="900" letter-spacing="-3" fill="#4ade80">Farm</text>

  <!-- Tagline line 1 -->
  <text x="220" y="308"
    font-family="Arial, sans-serif"
    font-size="22" font-weight="400" fill="#a3e6be">Smart Irrigation for Small &amp; Big Farmers · Solar Powered</text>

  <!-- Divider -->
  <line x1="220" y1="332" x2="1100" y2="332" stroke="#4ade80" stroke-opacity="0.2" stroke-width="1"/>

  <!-- Persuasive line -->
  <text x="220" y="370"
    font-family="Arial, sans-serif"
    font-size="19" font-weight="400" fill="#d1fae5">Automate your farm irrigation · No electricity bills · Works 24/7</text>

  <!-- Pills row -->
  ${pills.map(({ label, x }) => `
  <rect x="${x}" y="400" width="${pillW}" height="${pillH}" rx="${pillRx}" fill="#163d25" stroke="#4ade80" stroke-opacity="0.4" stroke-width="1.2"/>
  <text x="${x + pillW/2}" y="${400 + pillH/2 + 6}" text-anchor="middle"
    font-family="Arial, sans-serif" font-size="14" font-weight="600" fill="#86efac">${label}</text>`).join('')}

  <!-- URL -->
  <text x="220" y="498"
    font-family="Arial, sans-serif" font-size="18" font-weight="500"
    fill="#4ade80" letter-spacing="0.5">www.educfarm.com</text>

  <!-- School credit -->
  <text x="220" y="526"
    font-family="Arial, sans-serif" font-size="13" font-weight="400"
    fill="#4a7a5a">Built by Kyebambe Girls' Secondary School, Uganda</text>

  <!-- Bottom green bar -->
  <rect x="0" y="${H - 6}" width="${W}" height="6" fill="#4ade80" opacity="0.85"/>
</svg>`;

// ── 3. Render SVG → PNG, then composite logo on top ───────────────────────
const base = await sharp(Buffer.from(svg)).png().toBuffer();

await sharp(base)
  .composite([{ input: logoResized, left: 80, top: 195 }])
  .png()
  .toFile(OUT);

console.log('✅  OG image saved →', OUT);
