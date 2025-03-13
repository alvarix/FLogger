import { resolve } from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

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
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // setting up stylus per https://stackoverflow.com/questions/73228198/global-variables-stylus-vue-vite
  css: {
    preprocessorOptions: {
      stylus: {
        additionalData: `@import "${path.resolve(__dirname, 'src/globalcss.styl')}"`
      }
    }
  },
});
