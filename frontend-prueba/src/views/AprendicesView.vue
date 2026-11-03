<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAprendicesStore } from "../stores/aprendices";
import { useCursosStore } from "../stores/cursos";
import { useUiStore } from "../stores/ui";
import { notifyError, notifyOk, mostrarError, getErrors } from "../utils/errors";
import { confirmar, toastAviso } from "../utils/alerts";
import { requerido, correo } from "../utils/rules";
import PageHero from "../components/PageHero.vue";
import StatTile from "../components/StatTile.vue";

const router = useRouter();
const store = useAprendicesStore();
const cursos = useCursosStore();
const ui = useUiStore();

const estado = ref("todos"); // todos | activos | inactivos
const cursoFiltro = ref(null); // _id del curso o null

const columns = [
  { name: "documento", label: "Documento", field: "documento", align: "left", sortable: true },
  { name: "nombre", label: "Nombre", field: "nombre", align: "left", sortable: true },
  { name: "email", label: "Email", field: "email", align: "left" },
  {
    name: "curso",
    label: "Curso",
    // `curso` viene poblado desde el backend; el ?. evita errores si quedo sin curso
    field: (row) => row.curso?.nombre ?? "—",
    align: "left",
    sortable: true,
  },
  { name: "status", label: "Estado", field: "status", align: "center" },
  { name: "acciones", label: "Acciones", align: "center" },
];

// status: 0 = activo, 1 = inactivo
const totalActivos = computed(() => store.items.filter((a) => a.status === 0).length);
const totalInactivos = computed(() => store.items.length - totalActivos.value);
const cursosActivos = computed(() => cursos.items.filter((c) => c.status === 0).length);

const rows = computed(() =>
  store.items.filter((a) => {
    const okEstado =
      estado.value === "todos" ? true : estado.value === "activos" ? a.status === 0 : a.status === 1;
    const okCurso = !cursoFiltro.value || a.curso?._id === cursoFiltro.value;
    return okEstado && okCurso;
  })
);

function filtrar(valor) {
  estado.value = estado.value === valor ? "todos" : valor;
}

const opcionesFiltroCurso = computed(() =>
  cursos.items.map((c) => ({ label: c.nombre, value: c._id }))
);

// ---- formulario (crear / editar) ----
const vacio = () => ({ documento: "", nombre: "", email: "", curso: null });
const dialog = ref(false);
const editId = ref(null);
const form = ref(vacio());
const guardando = ref(false);
const emailEnUso = ref(false); // el backend dijo que ese correo ya existe

// Solo cursos activos; si se edita un aprendiz de un curso inactivo, se conserva ese.
const opcionesCurso = computed(() =>
  cursos.items
    .filter((c) => c.status === 0 || c._id === form.value.curso)
    .map((c) => ({ label: `${c.codigo} — ${c.nombre}`, value: c._id }))
);

function nuevo() {
  editId.value = null;
  emailEnUso.value = false;
  form.value = vacio();
  dialog.value = true;
}

function editar(a) {
  editId.value = a._id;
  emailEnUso.value = false;
  form.value = {
    documento: a.documento,
    nombre: a.nombre,
    email: a.email,
    curso: a.curso?._id ?? null, // el backend espera el ObjectId, no el nombre
  };
  dialog.value = true;
}

async function guardar() {
  guardando.value = true;
  emailEnUso.value = false;
  try {
    const msg = await store.guardar(form.value, editId.value);
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
          ? "No se pudo actualizar el aprendiz"
          : "No se pudo crear el aprendiz"
    );
  } finally {
    guardando.value = false;
  }
}

async function cambiarEstado(a) {
  const desactivar = a.status === 0;
  const ok = await confirmar({
    titulo: desactivar ? "¿Desactivar aprendiz?" : "¿Activar aprendiz?",
    texto: `Vas a ${desactivar ? "desactivar" : "activar"} a ${a.nombre}.`,
    confirmar: desactivar ? "Sí, desactivar" : "Sí, activar",
    peligro: desactivar,
  });
  if (!ok) return;
  try {
    notifyOk(await store.cambiarEstado(a));
  } catch (e) {
    mostrarError(e, "No se pudo cambiar el estado");
  }
}

onMounted(() => {
  Promise.all([cursos.cargar(), store.cargar()]).catch(notifyError);
});
</script>

<template>
  <q-page class="app-page">
    <PageHero
      title="Estado de tus aprendices"
      :subtitle="`${store.items.length} aprendices registrados`"
      :activos="totalActivos"
      :inactivos="totalInactivos"
    >
      <template #actions>
        <q-btn class="btn-accent" unelevated no-caps icon="person_add" label="Nuevo aprendiz" @click="nuevo" />
      </template>

      <StatTile
        icon="groups"
        label="Aprendices activos"
        :value="totalActivos"
        :active="estado === 'activos'"
        @click="filtrar('activos')"
      />
      <StatTile
        icon="person_off"
        label="Aprendices inactivos"
        :value="totalInactivos"
        :active="estado === 'inactivos'"
        @click="filtrar('inactivos')"
      />
      <StatTile
        icon="school"
        label="Cursos activos"
        :value="cursosActivos"
        hint="Ver cursos"
        :toggle="false"
        @click="router.push({ name: 'cursos' })"
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
        no-results-label="Ningún aprendiz coincide con la búsqueda"
      >
        <template #top>
          <div class="table-top">
            <h3 class="table-top__title">
              Listado de aprendices <span class="table-top__count">{{ rows.length }}</span>
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
            <q-space />
            <q-select
              v-model="cursoFiltro"
              :options="opcionesFiltroCurso"
              emit-value
              map-options
              clearable
              dense
              outlined
              label="Filtrar por curso"
              style="min-width: 240px"
            />
          </div>
        </template>

        <template #body-cell-documento="props">
          <q-td :props="props"><span class="cell-code">{{ props.row.documento }}</span></q-td>
        </template>

        <template #body-cell-nombre="props">
          <q-td :props="props"><span class="cell-main">{{ props.row.nombre }}</span></q-td>
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
            <q-btn
              flat
              round
              dense
              :color="props.row.status === 0 ? 'negative' : 'positive'"
              :icon="props.row.status === 0 ? 'block' : 'check_circle'"
              :aria-label="`${props.row.status === 0 ? 'Desactivar' : 'Activar'} ${props.row.nombre}`"
              @click="cambiarEstado(props.row)"
            >
              <q-tooltip>{{ props.row.status === 0 ? "Desactivar" : "Activar" }}</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <div class="table-empty">
            <q-icon name="groups" size="40px" />
            <strong>Aún no hay aprendices</strong>
            <span>Registra el primero con el botón «Nuevo aprendiz».</span>
          </div>
        </template>
      </q-table>
    </section>

    <q-dialog v-model="dialog" persistent>
      <q-card class="app-dialog" style="width: 480px; max-width: 94vw">
        <q-card-section>
          <div class="app-dialog__title">
            <span class="app-dialog__badge"><q-icon :name="editId ? 'edit' : 'person_add'" size="22px" /></span>
            {{ editId ? "Editar aprendiz" : "Nuevo aprendiz" }}
          </div>
        </q-card-section>

        <q-form @submit.prevent="guardar" @validation-error="toastAviso('Revisa los campos marcados en rojo')">
          <q-card-section class="q-gutter-md">
            <q-input
              v-model="form.documento"
              label="Documento"
              outlined
              autofocus
              :rules="[requerido('El documento es obligatorio')]"
            />
            <q-input
              v-model="form.nombre"
              label="Nombre"
              outlined
              :rules="[requerido('El nombre es obligatorio')]"
            />
            <q-input
              v-model="form.email"
              inputmode="email"
              label="Email"
              outlined
              :error="emailEnUso"
              :error-message="emailEnUso ? 'El correo del aprendiz ya está en uso' : undefined"
              :rules="[requerido('El email es obligatorio'), correo('El email no es válido')]"
              @update:model-value="emailEnUso = false"
            />
            <q-select
              v-model="form.curso"
              :options="opcionesCurso"
              emit-value
              map-options
              label="Curso"
              outlined
              :rules="[requerido('El curso es obligatorio')]"
            />
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
