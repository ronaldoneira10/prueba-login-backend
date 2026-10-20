import { defineStore } from "pinia";
import { ref } from "vue";

export const useUiStore = defineStore(
  "ui",
  () => {
    const dark = ref(true); // el diseño es oscuro por defecto
    const drawer = ref(true);
    const busqueda = ref(""); // texto del buscador del encabezado (filtra la tabla activa)

    function toggleDark() {
      dark.value = !dark.value;
    }

    return { dark, drawer, busqueda, toggleDark };
  },
  { persist: { pick: ["dark"] } } // drawer y busqueda no hace falta recordarlos
);
