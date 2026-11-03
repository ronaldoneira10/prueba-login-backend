import { defineStore } from "pinia";
import { ref } from "vue";
import { usuariosService } from "../services/usuarios.service";

export const useUsuariosStore = defineStore("usuarios", () => {
  const items = ref([]);
  const loading = ref(false);

  async function cargar() {
    loading.value = true;
    try {
      const { data } = await usuariosService.listar();
      items.value = data;
    } finally {
      loading.value = false;
    }
  }

  // Crea o actualiza segun haya id. Devuelve el msg del backend.
  async function guardar(payload, id = null) {
    const { data } = id
      ? await usuariosService.actualizar(id, payload)
      : await usuariosService.crear(payload);
    await cargar();
    return data.msg;
  }

  async function cambiarEstado(usuario) {
    const { data } =
      usuario.status === 0
        ? await usuariosService.desactivar(usuario._id)
        : await usuariosService.activar(usuario._id);
    await cargar();
    return data.msg;
  }

  return { items, loading, cargar, guardar, cambiarEstado };
});
