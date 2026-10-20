/**
 * Alertas de la app con SweetAlert2.
 *
 * Es el UNICO lugar que dibuja alertas, confirmaciones y avisos. Ninguna vista
 * usa alert() / confirm() / prompt() del navegador ni Notify / Dialog de Quasar.
 *
 *   toastOk("Guardado")                      aviso corto que se cierra solo
 *   toastError("Algo fallo")
 *   toastAviso("Revisa los campos")
 *   await confirmar({ titulo, texto })       -> true / false
 *   alertaErrores(["...", "..."], "Titulo")  ventana con la lista de errores
 */
import Swal from "sweetalert2";

const COLORES = {
  success: "#b6f23a",
  error: "#ff7a6e",
  warning: "#ffc857",
  info: "#7cc4ff",
  question: "#b6f23a",
};
const COLORES_CLARO = { ...COLORES, success: "#39a900", question: "#39a900", error: "#d23b2f" };

const esOscuro = () => document.body.classList.contains("body--dark");

// Todo texto que viene del servidor se escapa antes de meterlo en HTML.
const escapar = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function estilo({ dark, icon, extra = "", peligro = false }) {
  const oscuro = dark ?? esOscuro();
  return {
    iconColor: (oscuro ? COLORES : COLORES_CLARO)[icon],
    customClass: {
      popup: `app-swal ${oscuro ? "app-swal--dark" : "app-swal--light"} ${extra}`.trim(),
      title: "app-swal__title",
      htmlContainer: "app-swal__text",
      actions: "app-swal__actions",
      confirmButton: `app-swal__btn ${peligro ? "app-swal__btn--danger" : "app-swal__btn--confirm"}`,
      cancelButton: "app-swal__btn app-swal__btn--cancel",
    },
    buttonsStyling: false,
    heightAuto: false,
    scrollbarPadding: false,
  };
}

// ---------- avisos cortos (toast) ----------
function toast(icon, title, dark) {
  return Swal.fire({
    ...estilo({ dark, icon, extra: "app-swal--toast" }),
    toast: true,
    position: "top-end",
    icon,
    title,
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
    didOpen: (el) => {
      el.addEventListener("mouseenter", Swal.stopTimer);
      el.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });
}
export const toastOk = (msg, o = {}) => toast("success", msg, o.dark);
export const toastError = (msg, o = {}) => toast("error", msg, o.dark);
export const toastAviso = (msg, o = {}) => toast("warning", msg, o.dark);

// ---------- confirmacion (devuelve true / false) ----------
export async function confirmar({
  titulo = "¿Estás seguro?",
  texto = "",
  confirmar: textoOk = "Aceptar",
  cancelar = "Cancelar",
  peligro = false,
  dark,
} = {}) {
  const { isConfirmed } = await Swal.fire({
    ...estilo({ dark, icon: peligro ? "warning" : "question", peligro }),
    icon: peligro ? "warning" : "question",
    title: titulo,
    html: texto ? escapar(texto) : undefined,
    showCancelButton: true,
    confirmButtonText: textoOk,
    cancelButtonText: cancelar,
    reverseButtons: true,
    focusCancel: peligro,
  });
  return isConfirmed;
}

// ---------- lista de errores (validacion del backend, login, etc.) ----------
export function alertaErrores(errores, titulo = "No se pudo completar la acción", o = {}) {
  const lista = (Array.isArray(errores) ? errores : [errores]).filter(Boolean);
  const html =
    lista.length === 1
      ? escapar(lista[0])
      : `<ul class="app-swal__list">${lista.map((e) => `<li>${escapar(e)}</li>`).join("")}</ul>`;
  return Swal.fire({
    ...estilo({ dark: o.dark, icon: "error" }),
    icon: "error",
    title: titulo,
    html,
    confirmButtonText: "Entendido",
  });
}
