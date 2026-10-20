import { createRouter, createWebHashHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

const routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("../views/LoginView.vue"),
    meta: { guestOnly: true },
  },
  {
    path: "/",
    component: () => import("../layouts/MainLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      { path: "", redirect: { name: "cursos" } },
      {
        path: "cursos",
        name: "cursos",
        component: () => import("../views/CursosView.vue"),
        meta: { title: "Cursos", searchable: true, searchPlaceholder: "Buscar curso…" },
      },
      {
        path: "aprendices",
        name: "aprendices",
        component: () => import("../views/AprendicesView.vue"),
        meta: { title: "Aprendices", searchable: true, searchPlaceholder: "Buscar aprendiz…" },
      },
      {
        path: "usuarios",
        name: "usuarios",
        component: () => import("../views/UsuariosView.vue"),
        meta: { title: "Usuarios" },
      },
    ],
  },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  // Modo hash (/#/cursos): el backend ya esta preparado para servir asi el build.
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isLoggedIn) return { name: "login" };
  if (to.meta.guestOnly && auth.isLoggedIn) return { name: "cursos" };
});

export default router;
