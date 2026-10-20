import api from "./api";

export const usuariosService = {
  login: (data) => api.post("/usuarios/login", data), // publico -> { usuario, token }
  crear: (data) => api.post("/usuarios/register", data), // requiere token
};
