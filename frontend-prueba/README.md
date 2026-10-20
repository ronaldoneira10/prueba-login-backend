# Frontend — Cursos y Aprendices

Vue 3 + Quasar + vue-router + axios + Pinia + pinia-plugin-persistedstate + SweetAlert2, para el backend `backend_prueba`.

## Uso

```bash
npm install            # instala también sweetalert2 (nueva dependencia)
npm run dev            # http://localhost:5173  (coincide con URL_FRONTEND del backend)
```

Requisitos: backend corriendo en `http://localhost:4500` (`npm run seed` y `npm run dev` allá).
Usuario de prueba: `admin@sena.edu.co` / `123456`.

La URL de la API está en `.env` (`VITE_API_URL`). Reinicia `npm run dev` si la cambias.

## Estructura

```
src/
├── main.js              Quasar + Pinia (con persistedstate) + router + interceptores
├── router/              rutas, guard de sesión (requiresAuth / guestOnly)
├── stores/
│   ├── auth.js          token + usuario (persistido)
│   ├── ui.js            modo oscuro (persistido)
│   ├── cursos.js        lista y acciones de cursos
│   └── aprendices.js    lista y acciones de aprendices
├── services/            api.js (axios + x-token + 401) y un servicio por recurso
├── layouts/MainLayout.vue
├── components/          PageHero, StatTile, HeroArt (tarjeta de resumen de cada sección)
├── views/               Login, Cursos, Aprendices, Usuarios
└── utils/
    ├── alerts.js        TODAS las alertas (SweetAlert2): toasts, confirmar, lista de errores
    ├── errors.js        errores del backend -> mensajes
    └── rules.js         reglas de validación de los formularios
```


## Alertas

No se usan `alert()`/`confirm()` del navegador ni `Notify`/`Dialog` de Quasar. Todo pasa por
`src/utils/alerts.js` (SweetAlert2). Las validaciones de campo se muestran bajo cada input (`rules.js`).
