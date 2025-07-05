import { resolve } from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import checker from "vite-plugin-checker";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      // Setting up routes for different stand-alone pages a la https://vite.dev/guide/build.html#multi-page-app
      input: {
        main: resolve(__dirname, "index.html"),
        dbauthpopup: resolve(__dirname, "dbauthpopup/index.html"),
      },
    },
  },
  plugins: [
    vue(),
    tailwindcss(),
    checker({
      vueTsc: true,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,woff,woff2,ttf,eot}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.dropboxapi\.com\/.*$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'dropbox-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/content\.dropboxapi\.com\/.*$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'dropbox-content-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/api\.dropbox\.com\/.*$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'dropbox-legacy-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
        ],
      },
      includeAssets: [
        'favicon/favicon.ico',
        'favicon/apple-touch-icon.png',
        'favicon/favicon-96x96.png',
        'favicon/web-app-manifest-192x192.png',
        'favicon/web-app-manifest-512x512.png',
      ],
      manifest: {
        name: 'Flogger',
        short_name: 'Flogger',
        description: 'A personal logging and journaling application',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/favicon/favicon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/favicon/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/favicon/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/favicon/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any'
          }
        ],
        categories: ['productivity', 'utilities'],
        lang: 'en',
        dir: 'ltr'
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@composables": path.resolve(__dirname, "./src/composables"),
      "@modules": path.resolve(__dirname, "./src/modules"),
    },
  },
  // setting up stylus per https://stackoverflow.com/questions/73228198/global-variables-stylus-vue-vite
  css: {
    preprocessorOptions: {
      stylus: {
        additionalData: `@import "${path.resolve(
          __dirname,
          "src/globalcss.styl"
        )}"`,
      },
    },
  },
});
