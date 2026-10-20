import { defineStore } from "pinia";
import { ref } from "vue";
import { aprendicesService } from "../services/aprendices.service";

export const useAprendicesStore = defineStore("aprendices", () => {
  const items = ref([]);
  const loading = ref(false);

  // El backend devuelve cada aprendiz con `curso` poblado (objeto completo).
  async function cargar() {
    loading.value = true;
    try {
      const { data } = await aprendicesService.listar();
      items.value = data;
    } finally {
      loading.value = false;
    }
  }

  async function guardar(payload, id = null) {
    const { data } = id
      ? await aprendicesService.actualizar(id, payload)
      : await aprendicesService.crear(payload);
    await cargar();
    return data.msg;
  }

  async function cambiarEstado(aprendiz) {
    const { data } =
      aprendiz.status === 0
        ? await aprendicesService.desactivar(aprendiz._id)
        : await aprendicesService.activar(aprendiz._id);
    await cargar();
    return data.msg;
  }

  return { items, loading, cargar, guardar, cambiarEstado };
});
