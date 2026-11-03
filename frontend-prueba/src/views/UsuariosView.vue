<script setup>
import { ref, computed, onMounted } from "vue";
import { useUsuariosStore } from "../stores/usuarios";
import { useAuthStore } from "../stores/auth";
import { useUiStore } from "../stores/ui";
import { notifyError, notifyOk, mostrarError, getErrors } from "../utils/errors";
import { confirmar, toastAviso } from "../utils/alerts";
import { requerido, correo, minimo } from "../utils/rules";
import PageHero from "../components/PageHero.vue";
import StatTile from "../components/StatTile.vue";

const store = useUsuariosStore();
const auth = useAuthStore();
const ui = useUiStore();

const estado = ref("todos"); // todos | activos | inactivos
const soloAdmin = ref(false);

const columns = [
  { name: "nombre", label: "Nombre", field: "nombre", align: "left", sortable: true },
  { name: "email", label: "Correo", field: "email", align: "left", sortable: true },
  { name: "rol", label: "Rol", field: "rol", align: "left", sortable: true },
  { name: "status", label: "Estado", field: "status", align: "center" },
  { name: "acciones", label: "Acciones", align: "center" },
];

// status: 0 = activo, 1 = inactivo
const totalActivos = computed(() => store.items.filter((u) => u.status === 0).length);
const totalInactivos = computed(() => store.items.length - totalActivos.value);
const totalAdmins = computed(() => store.items.filter((u) => u.rol === "ADMIN").length);

const rows = computed(() =>
  store.items.filter((u) => {
    const okEstado =
      estado.value === "todos" ? true : estado.value === "activos" ? u.status === 0 : u.status === 1;
    const okRol = !soloAdmin.value || u.rol === "ADMIN";
    return okEstado && okRol;
  })
);

function filtrar(valor) {
  estado.value = estado.value === valor ? "todos" : valor;
}

// La cuenta con la que se inicio sesion: no se puede desactivar a si misma.
const esYo = (u) => u._id === auth.usuario?._id;

// ---- formulario (crear / editar) ----
const vacio = () => ({ nombre: "", email: "", password: "" });
const dialog = ref(false);
const editId = ref(null);
const form = ref(vacio());
const guardando = ref(false);
const verClave = ref(false);
const emailEnUso = ref(false); // el backend dijo que ese correo ya existe

function nuevo() {
  editId.value = null;
  form.value = vacio();
  verClave.value = false;
  emailEnUso.value = false;
  dialog.value = true;
}

function editar(u) {
  editId.value = u._id;
  // La contraseña nunca viaja al frontend: se deja vacia y solo se envia si se escribe una nueva.
  form.value = { nombre: u.nombre, email: u.email, password: "" };
  verClave.value = false;
  emailEnUso.value = false;
  dialog.value = true;
}

async function guardar() {
  guardando.value = true;
  emailEnUso.value = false;
  try {
    const payload = {
      nombre: form.value.nombre.trim(),
      email: form.value.email.trim(),
      password: form.value.password,
    };
    const msg = await store.guardar(payload, editId.value);

    // Si se edito la propia cuenta, se refresca el nombre/correo que muestra el encabezado.
    if (editId.value && editId.value === auth.usuario?._id) {
      auth.usuario = {
        ...auth.usuario,
        nombre: payload.nombre.toUpperCase(),
        email: payload.email.toLowerCase(),
      };
    }

    dialog.value = false;
    notifyOk(msg);
  } catch (e) {
    // Correo repetido: alerta especifica y el campo se marca en rojo.
    const enUso = getErrors(e).some((m) => /en uso/i.test(m));
    emailEnUso.value = enUso;
    mostrarError(
      e,
      enUso
        ? "Correo ya en uso"
        : editId.value
          ? "No se pudo actualizar el usuario"
          : "No se pudo crear el usuario"
    );
  } finally {
    guardando.value = false;
  }
}

async function cambiarEstado(u) {
  const desactivar = u.status === 0;
  const ok = await confirmar({
    titulo: desactivar ? "¿Desactivar usuario?" : "¿Activar usuario?",
    texto: desactivar
      ? `${u.nombre} ya no podrá iniciar sesión.`
      : `${u.nombre} podrá volver a iniciar sesión.`,
    confirmar: desactivar ? "Sí, desactivar" : "Sí, activar",
    peligro: desactivar,
  });
  if (!ok) return;
  try {
    notifyOk(await store.cambiarEstado(u));
  } catch (e) {
    mostrarError(e, "No se pudo cambiar el estado");
  }
}

onMounted(() => {
  store.cargar().catch(notifyError);
});
</script>

<template>
  <q-page class="app-page">
    <PageHero
      title="Estado de tus usuarios"
      :subtitle="`${store.items.length} usuarios registrados`"
      :activos="totalActivos"
      :inactivos="totalInactivos"
    >
      <template #actions>
        <q-btn class="btn-accent" unelevated no-caps icon="person_add" label="Nuevo usuario" @click="nuevo" />
      </template>

      <StatTile
        icon="manage_accounts"
        label="Usuarios activos"
        :value="totalActivos"
        :active="estado === 'activos'"
        @click="filtrar('activos')"
      />
      <StatTile
        icon="person_off"
        label="Usuarios inactivos"
        :value="totalInactivos"
        :active="estado === 'inactivos'"
        @click="filtrar('inactivos')"
      />
      <StatTile
        icon="admin_panel_settings"
        label="Administradores"
        :value="totalAdmins"
        :active="soloAdmin"
        @click="soloAdmin = !soloAdmin"
      />
    </PageHero>

    <section class="app-card q-pa-md">
      <q-table
        class="app-table"
        flat
        row-key="_id"
        :rows="rows"
        :columns="columns"
        :loading="store.loading"
        :filter="ui.busqueda || ''"
        :rows-per-page-options="[10, 25, 50, 100]"
        rows-per-page-label="Filas por página"
        no-results-label="Ningún usuario coincide con la búsqueda"
      >
        <template #top>
          <div class="table-top">
            <h3 class="table-top__title">
              Listado de usuarios <span class="table-top__count">{{ rows.length }}</span>
            </h3>
            <q-chip
              v-if="estado !== 'todos'"
              removable
              color="transparent"
              text-color="inherit"
              icon="filter_alt"
              @remove="estado = 'todos'"
            >
              Mostrando solo {{ estado }}
            </q-chip>
            <q-chip
              v-if="soloAdmin"
              removable
              color="transparent"
              text-color="inherit"
              icon="admin_panel_settings"
              @remove="soloAdmin = false"
            >
              Mostrando solo administradores
            </q-chip>
          </div>
        </template>

        <template #body-cell-nombre="props">
          <q-td :props="props">
            <span class="cell-main">{{ props.row.nombre }}</span>
            <q-badge v-if="esYo(props.row)" outline class="q-ml-sm">Tú</q-badge>
          </q-td>
        </template>

        <template #body-cell-rol="props">
          <q-td :props="props"><span class="cell-code">{{ props.row.rol }}</span></q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <span class="pill" :class="props.row.status === 0 ? 'pill--on' : 'pill--off'">
              {{ props.row.status === 0 ? "Activo" : "Inactivo" }}
            </span>
          </q-td>
        </template>

        <template #body-cell-acciones="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              dense
              icon="edit"
              style="color: var(--link)"
              :aria-label="`Editar ${props.row.nombre}`"
              @click="editar(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <span class="inline-block">
              <q-btn
                flat
                round
                dense
                :color="props.row.status === 0 ? 'negative' : 'positive'"
                :icon="props.row.status === 0 ? 'block' : 'check_circle'"
                :disable="esYo(props.row) && props.row.status === 0"
                :aria-label="`${props.row.status === 0 ? 'Desactivar' : 'Activar'} ${props.row.nombre}`"
                @click="cambiarEstado(props.row)"
              >
                <q-tooltip v-if="!esYo(props.row)">
                  {{ props.row.status === 0 ? "Desactivar" : "Activar" }}
                </q-tooltip>
              </q-btn>
              <q-tooltip v-if="esYo(props.row) && props.row.status === 0">
                No puedes desactivar tu propia cuenta
              </q-tooltip>
            </span>
          </q-td>
        </template>

        <template #no-data>
          <div class="table-empty">
            <q-icon name="manage_accounts" size="40px" />
            <strong>Aún no hay usuarios</strong>
            <span>Registra el primero con el botón «Nuevo usuario».</span>
          </div>
        </template>
      </q-table>
    </section>

    <q-dialog v-model="dialog" persistent>
      <q-card class="app-dialog" style="width: 480px; max-width: 94vw">
        <q-card-section>
          <div class="app-dialog__title">
            <span class="app-dialog__badge"><q-icon :name="editId ? 'edit' : 'person_add'" size="22px" /></span>
            {{ editId ? "Editar usuario" : "Nuevo usuario" }}
          </div>
        </q-card-section>

        <q-form @submit.prevent="guardar" @validation-error="toastAviso('Revisa los campos marcados en rojo')">
          <q-card-section class="q-gutter-md">
            <q-input
              v-model="form.nombre"
              label="Nombre"
              outlined
              autofocus
              :rules="[requerido('El nombre es obligatorio')]"
            />
            <q-input
              v-model="form.email"
              type="email"
              label="Correo"
              outlined
              :error="emailEnUso"
              :error-message="emailEnUso ? 'El correo del usuario ya está en uso' : undefined"
              :rules="[requerido('El correo es obligatorio'), correo()]"
              @update:model-value="emailEnUso = false"
            />
            <q-input
              v-model="form.password"
              :type="verClave ? 'text' : 'password'"
              :label="editId ? 'Nueva contraseña (opcional)' : 'Contraseña'"
              :hint="editId ? 'Déjala vacía para conservar la actual' : ''"
              outlined
              autocomplete="new-password"
              :rules="
                editId
                  ? [minimo(6, 'Debe tener al menos 6 caracteres')]
                  : [requerido('La contraseña es obligatoria'), minimo(6, 'Debe tener al menos 6 caracteres')]
              "
            >
              <template #append>
                <q-btn
                  flat
                  round
                  dense
                  :icon="verClave ? 'visibility_off' : 'visibility'"
                  :aria-label="verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  @click="verClave = !verClave"
                />
              </template>
            </q-input>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Cancelar" no-caps v-close-popup />
            <q-btn class="btn-accent" unelevated type="submit" label="Guardar" no-caps :loading="guardando" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>
