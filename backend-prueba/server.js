import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

import dbConnection from "./database.js";
import { validateJWT } from "./middlewares/validateJWT.js";
import { routerUsuario } from "./routes/usuarios.routes.js";
import { routerCurso } from "./routes/cursos.routes.js";
import { routerAprendiz } from "./routes/aprendices.routes.js";

dotenv.config();

/**
 * Representa el servidor de la aplicacion.
 * @class
 */
class Server {
  /**
   * @constructor
   */
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 4500;
    this.middlewares();
    this.routes();
    this.conexionBd();
  }

  /**
   * Middlewares globales (se ejecutan en TODAS las peticiones).
   */
  middlewares() {
    this.app.use(express.json()); // permite leer req.body en formato JSON
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors()); // permite que el frontend (otro puerto) consuma la API
    this.app.use(morgan("dev")); // muestra en consola cada peticion que llega
  }

  /**
   * Registra las rutas de la aplicacion.
   * Cada modelo tiene su propio router montado bajo /api/<recurso>
   *
   * Aqui se ve de un vistazo QUE ESTA PROTEGIDO: el middleware validateJWT se
   * pone entre la URL y el router. Todo lo que pase por ahi necesita mandar la
   * cabecera x-token; si no, corta con un 401 y el controlador ni se entera.
   */
  routes() {
    // Publico: es por donde se consigue el token.
    this.app.use("/api/usuarios", routerUsuario);

    // Privado: requieren token.
    this.app.use("/api/cursos", validateJWT, routerCurso);
    this.app.use("/api/aprendices", validateJWT, routerAprendiz);

    // Ruta de cortesia para comprobar rapido que el servidor responde.
    // El nombre "/life" es un identificador y no se traduce; el mensaje si.
    this.app.use("/life", (req, res) => {
      res.send("El servidor esta funcionando");
    });

    // Cualquier otra ruta (incluida la raiz "/") responde 404 en JSON.
    // El backend es solo API: la pantalla de login vive en el frontend
    // (http://localhost:5173), no se sirve desde aqui.
    this.app.use((req, res) => {
      res.status(404).json({ msg: "La ruta solicitada no existe" });
    });
  }

  /**
   * Conecta a la base de datos.
   */
  async conexionBd() {
    await dbConnection();
  }

  /**
   * Inicia el servidor.
   */
  listen() {
    this.app.listen(this.port, () => {
      console.log(`Servidor en http://localhost:${this.port}`);
    });
  }
}

export default Server;