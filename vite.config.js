import { resolve } from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
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
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
