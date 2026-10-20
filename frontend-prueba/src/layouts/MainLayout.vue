<script setup>
import { watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useAuthStore } from "../stores/auth";
import { useUiStore } from "../stores/ui";
import { confirmar } from "../utils/alerts";

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const ui = useUiStore();

// Aplica el modo oscuro guardado (Pinia persistido) al iniciar y al cambiarlo.
watch(() => ui.dark, (v) => $q.dark.set(v), { immediate: true });

// El buscador del encabezado filtra la tabla de la sección actual: se limpia al cambiar de sección.
watch(() => route.name, () => (ui.busqueda = ""));

const links = [
  { name: "cursos", label: "Cursos", icon: "school" },
  { name: "aprendices", label: "Aprendices", icon: "groups" },
  { name: "usuarios", label: "Usuarios", icon: "manage_accounts" },
];

const inicial = computed(() => (auth.usuario?.nombre || "?").trim().charAt(0).toUpperCase());

async function salir() {
  const ok = await confirmar({
    titulo: "¿Cerrar sesión?",
    texto: "Tendrás que ingresar de nuevo para continuar.",
    confirmar: "Sí, salir",
  });
  if (!ok) return;
  auth.logout();
  router.push({ name: "login" });
}
</script>

<template>
  <q-layout view="hHh lpR fFf" class="app-layout">
    <q-header class="app-header">
      <q-toolbar class="q-py-sm">
        <q-btn flat dense round icon="menu" aria-label="Abrir o cerrar el menú" @click="ui.drawer = !ui.drawer" />
        <q-toolbar-title class="app-title">{{ route.meta.title || "Cursos y Aprendices" }}</q-toolbar-title>

        <q-input
          v-if="route.meta.searchable"
          v-model="ui.busqueda"
          class="app-search gt-xs"
          dense
          outlined
          rounded
          clearable
          :placeholder="route.meta.searchPlaceholder || 'Buscar…'"
          aria-label="Buscar en la tabla"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>

        <q-btn
          flat
          round
          dense
          :icon="ui.dark ? 'light_mode' : 'dark_mode'"
          :aria-label="ui.dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
          @click="ui.toggleDark()"
        >
          <q-tooltip>{{ ui.dark ? "Modo claro" : "Modo oscuro" }}</q-tooltip>
        </q-btn>

        <q-btn flat no-caps class="q-ml-sm user-btn" aria-label="Menú de usuario">
          <q-avatar size="30px" class="user-btn__avatar">{{ inicial }}</q-avatar>
          <span class="gt-xs q-ml-sm">{{ auth.usuario?.nombre }}</span>
          <q-icon name="arrow_drop_down" />
          <q-menu>
            <q-list style="min-width: 220px">
              <q-item>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ auth.usuario?.nombre }}</q-item-label>
                  <q-item-label caption>{{ auth.usuario?.email }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="salir">
                <q-item-section avatar><q-icon name="logout" /></q-item-section>
                <q-item-section>Cerrar sesión</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>

      <!-- En móvil el buscador baja a su propia fila -->
      <div v-if="route.meta.searchable" class="lt-sm q-px-md q-pb-sm">
        <q-input
          v-model="ui.busqueda"
          dense
          outlined
          rounded
          clearable
          :placeholder="route.meta.searchPlaceholder || 'Buscar…'"
          aria-label="Buscar en la tabla"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
      </div>
    </q-header>

    <q-drawer v-model="ui.drawer" show-if-above :width="248" class="app-drawer">
      <div class="app-brand">
        <span class="app-brand__mark"><q-icon name="school" size="22px" /></span>
        Cursos y Aprendices
      </div>

      <div class="app-nav-label">Menú</div>
      <q-list class="app-nav">
        <q-item v-for="l in links" :key="l.name" :to="{ name: l.name }" clickable v-ripple>
          <q-item-section avatar><q-icon :name="l.icon" /></q-item-section>
          <q-item-section>{{ l.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.user-btn__avatar {
  background: var(--accent);
  color: var(--accent-ink);
  font-weight: 800;
}
</style>
