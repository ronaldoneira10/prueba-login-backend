<script setup>
import { ref } from "vue";
import { usuariosService } from "../services/usuarios.service";
import { notifyOk, mostrarError } from "../utils/errors";
import { toastAviso } from "../utils/alerts";
import { requerido, correo, minimo } from "../utils/rules";

const vacio = () => ({ nombre: "", email: "", password: "" });
const form = ref(vacio());
const verClave = ref(false);
const guardando = ref(false);
const formRef = ref(null);

async function crear() {
  guardando.value = true;
  try {
    const { data } = await usuariosService.crear({
      ...form.value,
      nombre: form.value.nombre.trim(),
      email: form.value.email.trim(),
    });
    notifyOk(data.msg);
    form.value = vacio();
    formRef.value?.resetValidation();
  } catch (e) {
    mostrarError(e, "No se pudo crear el usuario");
  } finally {
    guardando.value = false;
  }
}
</script>

<template>
  <q-page class="app-page">
    <section class="app-card" style="max-width: 520px; width: 100%">
      <div class="q-pa-lg q-pb-none">
        <div class="app-dialog__title">
          <span class="app-dialog__badge"><q-icon name="person_add" size="22px" /></span>
          Crear usuario
        </div>
        <p class="q-mt-sm q-mb-none" style="color: var(--muted)">
          Cuenta nueva para acceder al sistema. Solo la puede crear alguien con sesión iniciada.
        </p>
      </div>

      <q-form
        ref="formRef"
        @submit.prevent="crear"
        @validation-error="toastAviso('Revisa los campos marcados en rojo')"
      >
        <q-card-section class="q-gutter-md q-pa-lg">
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
            :rules="[requerido('El correo es obligatorio'), correo()]"
          />
          <q-input
            v-model="form.password"
            :type="verClave ? 'text' : 'password'"
            label="Contraseña"
            outlined
            :rules="[requerido('La contraseña es obligatoria'), minimo(6, 'Debe tener al menos 6 caracteres')]"
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

        <q-card-actions align="right" class="q-px-lg q-pb-lg">
          <q-btn class="btn-accent" unelevated type="submit" label="Crear usuario" no-caps :loading="guardando" />
        </q-card-actions>
      </q-form>
    </section>
  </q-page>
</template>
