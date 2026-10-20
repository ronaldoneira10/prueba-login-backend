import axios from "axios";

// Instancia unica: si cambia la URL del backend, se cambia en UN solo lugar (.env).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4500/api",
  headers: { "Content-Type": "application/json" },
});

/**
 * Conecta axios con el store de auth sin importarlo aqui (evita imports circulares).
 * - Request: agrega la cabecera x-token cuando hay sesion.
 * - Response: ante un 401 avisa a la app para que cierre la sesion.
 */
export function installInterceptors({ getToken, onUnauthorized }) {
  api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers["x-token"] = token;
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) onUnauthorized(error);
      return Promise.reject(error);
    }
  );
}

export default api;
