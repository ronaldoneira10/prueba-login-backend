import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { Quasar, Loading } from "quasar";
import quasarLang from "quasar/lang/es";

import "@quasar/extras/roboto-font/roboto-font.css";
import "@quasar/extras/material-icons/material-icons.css";
import "quasar/dist/quasar.css";
import "./css/app.css";

import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "./stores/auth";
import { installInterceptors } from "./services/api";
import { notifyError } from "./utils/errors";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate); // permite `persist: true` en los stores

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(Quasar, {
  // Sin Notify ni Dialog: todas las alertas pasan por SweetAlert2 (src/utils/alerts.js).
  plugins: { Loading },
  lang: quasarLang,
});

// axios necesita el token (que vive en Pinia) y saber que hacer ante un 401.
// Se conecta aqui, cuando Pinia y el router ya existen.
const auth = useAuthStore();
installInterceptors({
  getToken: () => auth.token,
  onUnauthorized: (e) => {
    // 401 = token vencido o invalido -> cerrar sesion y mandar al login
    // (el login mismo responde 400, no 401, asi que no entra aqui).
    if (auth.isLoggedIn) {
      auth.logout();
      notifyError(e);
      router.push({ name: "login" });
    }
  },
});

app.mount("#app");
