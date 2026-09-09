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
    title: 'Investor Application — EducFarm',
    description: 'Submit your investor enquiry to EducFarm. Share your investment interest, goals, and timeline. Help scale smart irrigation technology across Africa.',
    image: 'https://res.cloudinary.com/d5qqtsou/image/upload/w_1200,h_630,c_fill,q_80,f_jpg/v1788947769/rt_tzoxtn.jpg',
  },
  {
    path: 'partnership',
    title: 'Partnership Application — EducFarm',
    description: 'Become an EducFarm partner. Whether you are a trader, buyer, distributor, institution, or technology partner — let\'s grow the future of farming together.',
    image: 'https://res.cloudinary.com/d5qqtsou/image/upload/w_1200,h_630,c_fill,q_80,f_jpg/v1788426936/sm_smo9sk.jpg',
  },
  {
    path: 'invest/request',
    title: 'Business Request — EducFarm',
    description: 'Explore strategic partnerships and distribution opportunities with EducFarm. Submit your business request and let\'s build something meaningful.',
    image: 'https://res.cloudinary.com/d5qqtsou/image/upload/w_1200,h_630,c_fill,q_80,f_jpg/v1788947769/rt_tzoxtn.jpg',
  },
  {
    path: 'invest',
    title: 'EducFarm | Invest in Smart Irrigation for Africa',
    description: 'Invest in EducFarm and help scale proven smart irrigation technology across Africa. Support solar-powered agriculture, water conservation, food security, and climate-resilient farming.',
    image: 'https://res.cloudinary.com/d5qqtsou/image/upload/w_1200,h_630,c_fill,q_80,f_jpg/v1788947769/rt_tzoxtn.jpg',
  },
  {
    path: 'about',
    title: 'EducFarm | About Us',
    description: 'Learn how EducFarm is transforming African agriculture with affordable solar-powered smart irrigation, real-time farm data, weather intelligence, and automated water management.',
    image: 'https://res.cloudinary.com/d5qqtsou/image/upload/w_1200,h_630,c_fill,q_80,f_jpg/v1788603321/wiring_gdlj4e.jpg',
  },
  {
    path: 'contact',
    title: 'Contact EducFarm — Get in Touch',
    description: 'Have a question, want to order a kit, or need support? Contact the EducFarm team by email, WhatsApp, or phone. Based in Fort Portal, Uganda.',
    image: 'https://res.cloudinary.com/d5qqtsou/image/upload/w_1200,h_630,c_fill,q_80,f_jpg/v1788426936/sm_smo9sk.jpg',
  },
];

function ogHtml({ path, title, description, image }) {
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
<meta property="og:image" content="${image}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="EducFarm" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />
<link rel="canonical" href="${url}" />
<script>
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
