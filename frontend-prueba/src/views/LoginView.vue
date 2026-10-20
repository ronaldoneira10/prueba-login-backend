<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { getErrors } from "../utils/errors";
import { alertaErrores } from "../utils/alerts";

const router = useRouter();
const auth = useAuthStore();

const form = ref({ email: "", password: "" });
const verClave = ref(false);
const cargando = ref(false);

// Los errores de campo aparecen al salir del campo o al intentar enviar.
const tocado = ref({ email: false, password: false });
const intentado = ref(false);

const emailRef = ref(null);
const passwordRef = ref(null);

const errorEmail = computed(() => {
  if (!intentado.value && !tocado.value.email) return "";
  const v = form.value.email.trim();
  if (!v) return "El correo es obligatorio";
  if (!/.+@.+\..+/.test(v)) return "El correo no es válido";
  return "";
});

const errorPassword = computed(() => {
  if (!intentado.value && !tocado.value.password) return "";
  if (!form.value.password) return "La contraseña es obligatoria";
  return "";
});

onMounted(() => {
  // Solo en pantallas grandes: en móvil abriría el teclado de golpe.
  if (window.matchMedia("(min-width: 960px)").matches) emailRef.value?.focus();
});

async function ingresar() {
  intentado.value = true;
  await nextTick();

  if (errorEmail.value) return emailRef.value?.focus();
  if (errorPassword.value) return passwordRef.value?.focus();

  cargando.value = true;
  try {
    await auth.login({
      email: form.value.email.trim(),
      password: form.value.password,
    });
    router.push({ name: "cursos" });
  } catch (e) {
    // El login siempre es oscuro, por eso la alerta también.
    alertaErrores(getErrors(e), "No pudimos iniciar sesión", { dark: true });
  } finally {
    cargando.value = false;
  }
}
</script>

<template>
  <main class="login">
    <!-- Fondo: círculos concéntricos y órbita con punto -->
    <div class="login__orbits" aria-hidden="true">
      <svg viewBox="0 0 1266 1266" xmlns="http://www.w3.org/2000/svg">
        <circle cx="633" cy="633" r="631" class="ring ring--outer" />
        <circle cx="633" cy="633" r="433" class="ring ring--mid" />
        <g class="orbit">
          <circle cx="633" cy="633" r="302" class="ring ring--dash" />
          <circle cx="633" cy="331" r="14" class="orbit__dot" />
        </g>
      </svg>
    </div>

    <!-- Columna izquierda -->
    <section class="hero">
      <div class="brand">
        <svg class="brand__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"
          />
          <path d="M22 10v6" />
          <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
        </svg>
        <span class="brand__name">Cursos y Aprendices</span>
      </div>

      <div class="hero__copy">
        <h1 class="hero__title">
          Cada curso es un paso.
          <span class="hero__title-accent">Hoy das el siguiente.</span>
        </h1>
        <p class="hero__text">
          Entra, retoma donde lo dejaste y sigue construyendo tu futuro, una lección a la vez.
        </p>
      </div>

      <!-- Escalera de progreso -->
      <div class="steps" aria-hidden="true">
        <div class="step step--1"></div>
        <div class="step step--2"></div>
        <div class="step step--3"></div>
        <div class="step step--4">
          <svg viewBox="0 0 24 24">
            <path d="M5 21V3" />
            <path d="M5 4h14l-3 4.5 3 4.5H5" />
          </svg>
        </div>
      </div>
    </section>

    <!-- Tarjeta de login -->
    <section class="panel">
      <div class="panel__inner">
        <header class="panel__head">
          <span class="panel__badge" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path
                d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"
              />
              <path d="M22 10v6" />
              <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
            </svg>
          </span>
          <div>
            <h2 class="panel__title">Bienvenido</h2>
            <p class="panel__subtitle">Inicia sesión para continuar.</p>
          </div>
        </header>

        <form class="form" novalidate @submit.prevent="ingresar">
          <div class="field">
            <label class="field__label" for="login-email">Correo</label>
            <div class="field__box" :class="{ 'is-invalid': errorEmail }">
              <svg class="field__icon" viewBox="0 0 24 24" aria-hidden="true">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <input
                id="login-email"
                ref="emailRef"
                v-model="form.email"
                class="field__input"
                type="email"
                name="email"
                autocomplete="email"
                placeholder="tucorreo@ejemplo.com"
                :aria-invalid="!!errorEmail"
                :aria-describedby="errorEmail ? 'login-email-error' : undefined"
                @blur="tocado.email = true"
              />
            </div>
            <p v-if="errorEmail" id="login-email-error" class="field__error">{{ errorEmail }}</p>
          </div>

          <div class="field">
            <label class="field__label" for="login-password">Contraseña</label>
            <div class="field__box" :class="{ 'is-invalid': errorPassword }">
              <svg class="field__icon" viewBox="0 0 24 24" aria-hidden="true">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="login-password"
                ref="passwordRef"
                v-model="form.password"
                class="field__input"
                :type="verClave ? 'text' : 'password'"
                name="password"
                autocomplete="current-password"
                placeholder="Tu contraseña"
                :aria-invalid="!!errorPassword"
                :aria-describedby="errorPassword ? 'login-password-error' : undefined"
                @blur="tocado.password = true"
              />
              <button
                type="button"
                class="field__toggle"
                :aria-label="verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                :aria-pressed="verClave"
                @click="verClave = !verClave"
              >
                <svg v-if="!verClave" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
                  />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"
                  />
                  <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                  <path
                    d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"
                  />
                  <path d="m2 2 20 20" />
                </svg>
              </button>
            </div>
            <p v-if="errorPassword" id="login-password-error" class="field__error">
              {{ errorPassword }}
            </p>
          </div>

          <button type="submit" class="submit" :disabled="cargando">
            <template v-if="cargando">
              <span class="submit__spinner" aria-hidden="true"></span>
              <span>Ingresando…</span>
            </template>
            <template v-else>
              <span>Ingresar y seguir aprendiendo</span>
              <svg class="submit__arrow" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </template>
          </button>
        </form>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* ───────── Tokens ───────── */
.login {
  --c-bg: #06140c;
  --c-card-outer: #0a1d12;
  --c-card: #0d2417;
  --c-line: #2a5a3b;
  --c-ring-mid: #1f6b3a;
  --c-ring-outer: #14402a;
  --c-lime: #b6f23a;
  --c-green: #39a900;
  --c-text: #ffffff;
  --c-muted: #b9ccbd;
  --c-danger: #ff9b8f;

  --f-display: "Bricolage Grotesque", "Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif;
  --f-body: "DM Sans", "Segoe UI", system-ui, sans-serif;

  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 480px;
  column-gap: 48px;
  padding: 56px 100px 57px 72px;
  background: var(--c-bg);
  color: var(--c-text);
  font-family: var(--f-body);
}

.login svg {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* ───────── Fondo ───────── */
.login__orbits {
  position: absolute;
  z-index: -1;
  top: 50%;
  left: 50%;
  width: 1266px;
  height: 1266px;
  transform: translate(-50%, -50%);
  pointer-events: none;
}
.login__orbits svg {
  display: block;
  width: 100%;
  height: 100%;
}
.ring {
  fill: none;
  stroke-width: 2;
}
.ring--outer {
  stroke: var(--c-ring-outer);
}
.ring--mid {
  stroke: var(--c-ring-mid);
  stroke-opacity: 0.75;
}
.ring--dash {
  stroke: var(--c-green);
  stroke-dasharray: 9 8;
}
.orbit {
  transform-box: view-box;
  transform-origin: 50% 50%;
  animation: orbit 120s linear infinite;
}
.orbit__dot {
  fill: var(--c-lime);
  stroke: none;
}
@keyframes orbit {
  to {
    transform: rotate(360deg);
  }
}

/* ───────── Columna izquierda ───────── */
.hero {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 113px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  height: 40px;
}
.brand__icon {
  width: 40px;
  height: 40px;
  color: var(--c-lime);
  stroke-width: 1.8;
}
.brand__name {
  font-family: var(--f-display);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.hero__copy {
  margin-top: 56px;
}
.hero__title {
  max-width: 7.7em;
  margin: 0;
  font-family: var(--f-display);
  font-size: clamp(44px, 5vw, 76px);
  font-weight: 800;
  line-height: 0.92;
  letter-spacing: -0.045em;
}
.hero__title-accent {
  color: var(--c-lime);
}
.hero__text {
  max-width: 34em;
  margin: 28px 0 0;
  font-size: 18px;
  line-height: 1.6;
  color: var(--c-muted);
}

/* Escalera de progreso */
.steps {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  margin-top: auto;
  padding-top: 48px;
}
.step {
  width: 139px;
  border-radius: 28px;
  clip-path: inset(100% 0 0 0);
  animation: step-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}
.step--1 {
  height: 100px;
  background: #14402a;
  animation-delay: 0.1s;
}
.step--2 {
  height: 180px;
  background: #1f6b3a;
  animation-delay: 0.22s;
}
.step--3 {
  height: 280px;
  background: var(--c-green);
  animation-delay: 0.34s;
}
.step--4 {
  height: 380px;
  background: var(--c-lime);
  animation-delay: 0.46s;
}
.step--4 svg {
  display: block;
  width: 36px;
  height: 36px;
  margin: 26px 0 0 48px;
  color: var(--c-bg);
  stroke-width: 2;
}
@keyframes step-up {
  to {
    clip-path: inset(0 0 0 0);
  }
}

/* ───────── Tarjeta ───────── */
.panel {
  align-self: center;
  padding: 10px;
  border-radius: 40px;
  background: var(--c-card-outer);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
}
.panel__inner {
  padding: 40px 41px 41px;
  border: 1px solid var(--c-ring-outer);
  border-radius: 30px;
  background: var(--c-card);
}

.panel__head {
  display: flex;
  align-items: center;
  gap: 17px;
  margin-bottom: 28px;
}
.panel__badge {
  flex: none;
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--c-lime);
  color: var(--c-bg);
}
.panel__badge svg {
  width: 30px;
  height: 30px;
  stroke-width: 2;
}
.panel__title {
  margin: 0;
  font-family: var(--f-display);
  font-size: 28px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.035em;
}
.panel__subtitle {
  margin: 4px 0 0;
  font-size: 15px;
  color: var(--c-muted);
}

/* Campos */
.form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.field__label {
  display: block;
  margin-bottom: 9px;
  font-size: 14px;
  font-weight: 700;
}
.field__box {
  display: flex;
  align-items: center;
  gap: 14px;
  height: 56px;
  padding: 0 18px;
  border: 2px solid var(--c-line);
  border-radius: 16px;
  background: var(--c-bg);
  color: var(--c-muted);
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}
.field__box:hover {
  border-color: #3a7a50;
}
.field__box:focus-within {
  border-color: var(--c-lime);
  box-shadow: 0 0 0 4px rgba(182, 242, 58, 0.14);
  color: var(--c-lime);
}
.field__box.is-invalid {
  border-color: var(--c-danger);
}
.field__box.is-invalid:focus-within {
  box-shadow: 0 0 0 4px rgba(255, 155, 143, 0.16);
}
.field__icon {
  flex: none;
  width: 20px;
  height: 20px;
  stroke-width: 1.8;
}
.field__input {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--c-text);
  font: inherit;
  font-size: 17px;
}
.field__input::placeholder {
  color: #7f9a87;
  opacity: 1;
}
/* Evita el fondo claro del autocompletado del navegador */
.field__input:-webkit-autofill {
  -webkit-text-fill-color: var(--c-text);
  box-shadow: 0 0 0 100px var(--c-bg) inset;
  caret-color: var(--c-text);
}
.field__toggle {
  flex: none;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  margin-right: -6px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.field__toggle svg {
  width: 20px;
  height: 20px;
  stroke-width: 1.8;
}
.field__toggle:hover {
  color: var(--c-text);
}
.field__toggle:focus-visible {
  outline: 2px solid var(--c-lime);
  outline-offset: 1px;
}
.field__error {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--c-danger);
}

/* Botón */
.submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 60px;
  border: 0;
  border-radius: 14px;
  background: var(--c-lime);
  color: var(--c-bg);
  font-family: var(--f-display);
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
  cursor: pointer;
  transition:
    background-color 0.15s,
    transform 0.1s;
}
.submit:hover:not(:disabled) {
  background: #c6f65e;
}
.submit:active:not(:disabled) {
  transform: translateY(1px);
}
.submit:focus-visible {
  outline: 3px solid #fff;
  outline-offset: 3px;
}
.submit:disabled {
  cursor: progress;
  opacity: 0.85;
}
.submit__arrow {
  width: 20px;
  height: 20px;
  stroke-width: 2.4;
  transition: transform 0.15s;
}
.submit:hover .submit__arrow {
  transform: translateX(3px);
}
.submit__spinner {
  width: 18px;
  height: 18px;
  border: 3px solid rgba(6, 20, 12, 0.25);
  border-top-color: var(--c-bg);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ───────── Responsive ───────── */
@media (max-width: 1280px) {
  .login {
    padding-right: 56px;
    padding-left: 48px;
    column-gap: 32px;
  }
  .step {
    width: 110px;
  }
  .step--4 svg {
    margin-left: 36px;
  }
}

@media (max-width: 1100px) {
  .steps {
    display: none;
  }
}

@media (max-width: 959px) {
  .login {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 36px;
    padding: 28px 20px 40px;
  }
  .hero {
    min-height: 0;
  }
  .hero__copy {
    margin-top: 32px;
  }
  .hero__title {
    max-width: none;
    font-size: clamp(40px, 11vw, 60px);
  }
  .hero__text {
    font-size: 16px;
  }
  .panel {
    width: 100%;
    max-width: 480px;
    justify-self: center;
  }
  .panel__inner {
    padding: 28px 22px 26px;
  }
  .panel__title {
    font-size: 24px;
  }
}

@media (max-width: 380px) {
  .submit {
    font-size: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .orbit {
    animation: none;
  }
  .step {
    animation: none;
    clip-path: none;
  }
  .submit__arrow,
  .field__box {
    transition: none;
  }
}
</style>
