import Usuario from "../models/Usuario.js";

/**
 * Funciones de apoyo para las validaciones de usuario.
 * Un helper solo consulta la base de datos y lanza un Error si algo no cumple.
 * @namespace usuarioHelper
 */
const usuarioHelper = {};

/**
 * Valida que el correo no este ya en uso por otro usuario.
 * @param {string} email
 * @param {string} [id=null] - Id a excluir (se usa al actualizar).
 * @throws {Error} Si el correo ya esta en uso.
 */
usuarioHelper.validateExistEmail = async (email, id = null) => {
  const usuario = await Usuario.findOne({ email: email.toLowerCase().trim() });
  if (usuario) {
    if (!id || usuario._id.toString() !== id.toString()) {
      throw new Error("El correo del usuario ya está en uso");
    }
  }
};

/**
 * Valida que exista un usuario con ese id.
 * @param {string} id
 * @throws {Error} Si el usuario no existe.
 */
usuarioHelper.validateExistUsuarioById = async (id) => {
  const usuario = await Usuario.findById(id);
  if (!usuario) {
    throw new Error("El usuario no existe");
  }
};

export { usuarioHelper };
