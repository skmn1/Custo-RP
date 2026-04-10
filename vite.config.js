import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // injectManifest gives full control — tasks 59 and 60 add custom SW code
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'ess-sw.js',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Exclude the large main bundle and pdf worker from precache —
        // the NavigationRoute / NetworkFirst handles SPA shell delivery.
        globIgnores: ['**/index-*.js', '**/pdf.worker*'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4 MB ceiling for remaining assets
      },
      // Scope matches the ESS route prefix
      scope: '/app/ess/',
      // Task 56 supplies ess-manifest.json — do not auto-generate one
      manifest: false,
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
