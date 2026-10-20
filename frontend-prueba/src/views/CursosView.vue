<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCursosStore } from "../stores/cursos";
import { useAprendicesStore } from "../stores/aprendices";
import { useUiStore } from "../stores/ui";
import { notifyError, notifyOk, mostrarError } from "../utils/errors";
import { confirmar, toastAviso } from "../utils/alerts";
import { requerido, enteroPositivo } from "../utils/rules";
import PageHero from "../components/PageHero.vue";
import StatTile from "../components/StatTile.vue";

const router = useRouter();
const store = useCursosStore();
const aprendices = useAprendicesStore();
const ui = useUiStore();

const estado = ref("todos"); // todos | activos | inactivos

const columns = [
  { name: "codigo", label: "Código", field: "codigo", align: "left", sortable: true },
  { name: "nombre", label: "Nombre", field: "nombre", align: "left", sortable: true },
  { name: "duracion", label: "Duración (h)", field: "duracion", align: "right", sortable: true },
  { name: "status", label: "Estado", field: "status", align: "center" },
  { name: "acciones", label: "Acciones", align: "center" },
];

// status: 0 = activo, 1 = inactivo
const totalActivos = computed(() => store.items.filter((c) => c.status === 0).length);
const totalInactivos = computed(() => store.items.length - totalActivos.value);
const aprendicesActivos = computed(() => aprendices.items.filter((a) => a.status === 0).length);

const rows = computed(() =>
  store.items.filter((c) =>
    estado.value === "todos" ? true : estado.value === "activos" ? c.status === 0 : c.status === 1
  )
);

// Tocar el mismo filtro otra vez lo quita.
function filtrar(valor) {
  estado.value = estado.value === valor ? "todos" : valor;
}

// ---- formulario (crear / editar) ----
const vacio = () => ({ codigo: "", nombre: "", duracion: null });
const dialog = ref(false);
const editId = ref(null);
const form = ref(vacio());
const guardando = ref(false);

function nuevo() {
  editId.value = null;
  form.value = vacio();
  dialog.value = true;
}

function editar(curso) {
  editId.value = curso._id;
  form.value = { codigo: curso.codigo, nombre: curso.nombre, duracion: curso.duracion };
  dialog.value = true;
}

async function guardar() {
  guardando.value = true;
  try {
    const msg = await store.guardar(form.value, editId.value);
    dialog.value = false;
    notifyOk(msg);
  } catch (e) {
    mostrarError(e, editId.value ? "No se pudo actualizar el curso" : "No se pudo crear el curso");
  } finally {
    guardando.value = false;
  }
}

async function cambiarEstado(curso) {
  const desactivar = curso.status === 0;
  const ok = await confirmar({
    titulo: desactivar ? "¿Desactivar curso?" : "¿Activar curso?",
    texto: `Vas a ${desactivar ? "desactivar" : "activar"} el curso «${curso.nombre}».`,
    confirmar: desactivar ? "Sí, desactivar" : "Sí, activar",
    peligro: desactivar,
  });
  if (!ok) return;
  try {
    notifyOk(await store.cambiarEstado(curso));
  } catch (e) {
    mostrarError(e, "No se pudo cambiar el estado");
  }
}

onMounted(() => {
  Promise.all([store.cargar(), aprendices.cargar()]).catch(notifyError);
});
</script>

<template>
  <q-page class="app-page">
    <PageHero
      title="Estado de tus cursos"
      :subtitle="`${store.items.length} cursos registrados`"
      :activos="totalActivos"
      :inactivos="totalInactivos"
    >
      <template #actions>
        <q-btn class="btn-accent" unelevated no-caps icon="add" label="Nuevo curso" @click="nuevo" />
      </template>

      <StatTile
        icon="school"
        label="Cursos activos"
        :value="totalActivos"
        :active="estado === 'activos'"
        @click="filtrar('activos')"
      />
      <StatTile
        icon="pause_circle"
        label="Cursos inactivos"
        :value="totalInactivos"
        :active="estado === 'inactivos'"
        @click="filtrar('inactivos')"
      />
      <StatTile
        icon="groups"
        label="Aprendices activos"
        :value="aprendicesActivos"
        hint="Ver aprendices"
        :toggle="false"
        @click="router.push({ name: 'aprendices' })"
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
        :rows-per-page-options="[10, 25, 50]"
        rows-per-page-label="Filas por página"
        no-results-label="Ningún curso coincide con la búsqueda"
      >
        <template #top>
          <div class="table-top">
            <h3 class="table-top__title">
              Listado de cursos <span class="table-top__count">{{ rows.length }}</span>
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
          </div>
        </template>

        <template #body-cell-codigo="props">
          <q-td :props="props"><span class="cell-code">{{ props.row.codigo }}</span></q-td>
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
            <q-icon name="school" size="40px" />
            <strong>Aún no hay cursos</strong>
            <span>Crea el primero con el botón «Nuevo curso».</span>
          </div>
        </template>
      </q-table>
    </section>

    <q-dialog v-model="dialog" persistent>
      <q-card class="app-dialog" style="width: 460px; max-width: 94vw">
        <q-card-section>
          <div class="app-dialog__title">
            <span class="app-dialog__badge"><q-icon :name="editId ? 'edit' : 'add'" size="22px" /></span>
            {{ editId ? "Editar curso" : "Nuevo curso" }}
          </div>
        </q-card-section>

        <q-form @submit.prevent="guardar" @validation-error="toastAviso('Revisa los campos marcados en rojo')">
          <q-card-section class="q-gutter-md">
            <q-input
              v-model="form.codigo"
              label="Código"
              outlined
              autofocus
              :rules="[requerido('El código es obligatorio')]"
            />
            <q-input
              v-model="form.nombre"
              label="Nombre"
              outlined
              :rules="[requerido('El nombre es obligatorio')]"
            />
            <q-input
              v-model.number="form.duracion"
              type="number"
              label="Duración (horas)"
              outlined
              :rules="[requerido('La duración es obligatoria'), enteroPositivo()]"
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
