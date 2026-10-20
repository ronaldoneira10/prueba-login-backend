import { toastOk, toastError, alertaErrores } from "./alerts";

/**
 * Convierte cualquier error de axios en una lista de mensajes legibles.
 * Backend: 400 validacion -> { msg, errors: [..] } | otros -> { msg }
 */
export function getErrors(e) {
  const data = e?.response?.data;
  if (Array.isArray(data?.errors) && data.errors.length) {
    return data.errors.map((x) => (typeof x === "string" ? x : x?.msg ?? String(x)));
  }
  if (data?.msg) return [data.msg];
  if (!e?.response) return ["No hay conexión con el servidor"];
  return ["Ocurrió un error inesperado"];
}

/** Aviso corto de error (cargas de datos, sesion vencida...). */
export function notifyError(e) {
  toastError(getErrors(e).join(" · "));
}

/** Aviso corto de exito. */
export function notifyOk(message) {
  toastOk(message);
}

/**
 * Ventana de error con la lista completa (formularios).
 * Un 401 no se muestra aqui: el interceptor ya cerro la sesion y avisó.
 */
export function mostrarError(e, titulo) {
  if (e?.response?.status === 401) return;
  return alertaErrores(getErrors(e), titulo);
}
