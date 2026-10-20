import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { cursosService } from "../services/cursos.service";

export const useCursosStore = defineStore("cursos", () => {
  const items = ref([]);
  const loading = ref(false);

  // status: 0 = activo, 1 = inactivo
  const activos = computed(() => items.value.filter((c) => c.status === 0));

  async function cargar() {
    loading.value = true;
    try {
      const { data } = await cursosService.listar();
      items.value = data;
    } finally {
      loading.value = false;
    }
  }

  // Crea o actualiza segun haya id. Devuelve el msg del backend.
  async function guardar(payload, id = null) {
    const { data } = id
      ? await cursosService.actualizar(id, payload)
      : await cursosService.crear(payload);
    await cargar();
    return data.msg;
  }

  async function cambiarEstado(curso) {
    const { data } =
      curso.status === 0
        ? await cursosService.desactivar(curso._id)
        : await cursosService.activar(curso._id);
    await cargar();
    return data.msg;
  }

  return { items, loading, activos, cargar, guardar, cambiarEstado };
});
