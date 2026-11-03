import api from "./api";

export const usuariosService = {
  login: (data) => api.post("/usuarios/login", data), // publico -> { usuario, token }
  listar: () => api.get("/usuarios"),
  crear: (data) => api.post("/usuarios/register", data), // requiere token
  actualizar: (id, data) => api.put(`/usuarios/update/${id}`, data),
  activar: (id) => api.put(`/usuarios/active/${id}`),
  desactivar: (id) => api.put(`/usuarios/inactive/${id}`),
};
