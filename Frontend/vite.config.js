import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// The site's own origin, used so the app can detect whether it's already
// installed via navigator.getInstalledRelatedApps() (that API matches the
// manifest URL listed in `related_applications`).
// - On Vercel, VERCEL_PROJECT_PRODUCTION_URL is set automatically at build.
// - Override locally/anywhere with PUBLIC_SITE_URL (e.g. http://localhost:5173).
const siteUrl =
  process.env.PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : '')

const relatedApps = siteUrl
  ? {
      prefer_related_applications: false,
      related_applications: [
        { platform: 'webapp', url: `${siteUrl}/manifest.webmanifest` },
      ],
    }
  : {}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // A new deploy refreshes the installed app automatically — no manual
      // "clear cache" step for the user.
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'app-icon.svg'],
      manifest: {
        id: '/',
        name: 'DS-Accounts',
        short_name: 'DS-Accounts',
        description:
          'Record and analyze income & payments for a driving-licence service business.',
        theme_color: '#0ca678',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        ...relatedApps,
      },
      workbox: {
        // Precache only the built app shell. API calls go to a different origin
        // (Render) and are intentionally NOT cached — financial data must always
        // be fresh. The denylist is a belt-and-suspenders guard for same-origin.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
      // Service worker + manifest are also served in `npm run dev` so the app is
      // installable on localhost while developing (test the install flow in
      // Chrome/Edge). If you ever hit stale-cache weirdness in dev, hard-reload
      // (Ctrl+Shift+R) or unregister the SW in DevTools → Application.
      devOptions: {
        enabled: true,
        type: "module",
        navigateFallback: "index.html",
      },
    }),
  ],
})
