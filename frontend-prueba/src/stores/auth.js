import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { usuariosService } from "../services/usuarios.service";

export const useAuthStore = defineStore(
  "auth",
  () => {
    const token = ref("");
    const usuario = ref(null);

    const isLoggedIn = computed(() => !!token.value);
    const isAdmin = computed(() => usuario.value?.rol === "ADMIN");

    async function login(credenciales) {
      const { data } = await usuariosService.login(credenciales);
      token.value = data.token;
      usuario.value = data.usuario;
    }

    function logout() {
      token.value = "";
      usuario.value = null;
    }

    return { token, usuario, isLoggedIn, isAdmin, login, logout };
  },
  // pinia-plugin-persistedstate: guarda token y usuario en localStorage
  // y los restaura al recargar la pagina (los computed no se persisten).
  { persist: true }
);
