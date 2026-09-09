import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const OG_IMAGE = 'https://res.cloudinary.com/d5qqtsou/image/upload/v1787329124/spr_qtwrcq.png';
const BASE_URL = 'https://www.educfarm.com';

const OG_ROUTES = [
  {
    path: 'invest/form',
    title: 'Invest in EducFarm — Apply Now',
    description: 'Join us in building the future of African farming. Submit your investor application and help scale solar-powered smart irrigation to farms across Africa.',
  },
  {
    path: 'partnership',
    title: 'Partner with EducFarm — Grow Together',
    description: 'Become a distribution, trade, or technology partner with EducFarm. Let\'s grow the future of sustainable farming together across Africa.',
  },
  {
    path: 'invest/request',
    title: 'Business Request — EducFarm',
    description: 'Explore strategic partnerships and distribution opportunities with EducFarm. Submit your business request and let\'s build something meaningful.',
  },
  {
    path: 'invest',
    title: 'Invest in EducFarm — Smart Irrigation for Africa',
    description: 'EducFarm is ready to scale. Invest in proven solar-powered smart irrigation helping African farmers produce food reliably all year round.',
  },
];

function ogHtml({ path, title, description }) {
  const url = `${BASE_URL}/${path}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<meta name="description" content="${description}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${OG_IMAGE}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="EducFarm" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${OG_IMAGE}" />
<link rel="canonical" href="${url}" />
<script>
// Only redirect real browsers — bots that read OG tags don't run JS
(function(){
  var ua = navigator.userAgent || '';
  var isBot = /bot|crawl|slurp|spider|facebookexternalhit|whatsapp|telegrambot|linkedinbot|twitterbot/i.test(ua);
  if (!isBot) window.location.replace('/?p=' + encodeURIComponent('/' + '${path}'));
})();
</script>
</head>
<body></body>
</html>`;
}

function generateOgPages() {
  return {
    name: 'generate-og-pages',
    closeBundle() {
      for (const route of OG_ROUTES) {
        const dir = resolve(__dirname, 'dist', route.path);
        mkdirSync(dir, { recursive: true });
        writeFileSync(resolve(dir, 'index.html'), ogHtml(route));
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    generateOgPages(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'icons/pwa-192.png', 'icons/pwa-512.png'],
      manifest: {
        id: '/',
        name: 'EducFarm',
        short_name: 'EducFarm',
        description: 'Smart irrigation management and weather-based farm planning',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        background_color: '#0f2e1a',
        theme_color: '#0f2e1a',
        orientation: 'portrait-primary',
        categories: ['productivity', 'utilities'],
        icons: [
          {
            src: 'icons/pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icons/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,txt,xml}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/robots\.txt$/, /^\/sitemap\.xml$/, /^\/google.*\.html$/],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) return 'react-vendor';
          if (id.includes('node_modules/lucide-react')) return 'lucide';
        },
      },
    },
  },
})
