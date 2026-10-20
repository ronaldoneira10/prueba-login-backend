/**
 * Reglas de validacion para los campos de Quasar (:rules="[...]").
 * Cada una devuelve true si el valor es valido o el mensaje de error si no.
 * El error se pinta bajo el campo: nunca usa la validacion nativa del navegador.
 */
const vacio = (v) => v === null || v === undefined || String(v).trim() === "";

export const requerido = (msg) => (v) => !vacio(v) || msg;

export const correo =
  (msg = "El correo no es válido") =>
  (v) =>
    vacio(v) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim()) || msg;

export const minimo = (n, msg) => (v) =>
  vacio(v) || String(v).length >= n || msg || `Debe tener al menos ${n} caracteres`;

export const enteroPositivo = (msg = "Debe ser un número entero mayor a 0") => (v) =>
  vacio(v) || (Number.isInteger(v) && v >= 1) || msg;
