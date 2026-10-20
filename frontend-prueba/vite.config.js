import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";

export default defineConfig({
  plugins: [
    vue({ template: { transformAssetUrls } }),
    // Auto-importa solo los componentes de Quasar que se usan en los templates.
    quasar(),
  ],
  // Puerto que el backend espera en URL_FRONTEND (.env del backend).
  server: { port: 5173 },
});
