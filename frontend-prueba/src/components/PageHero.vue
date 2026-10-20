<script setup>
import { computed } from "vue";
import HeroArt from "./HeroArt.vue";

// Tarjeta de resumen que abre las secciones: ilustración, título, barra de
// proporción activos / inactivos, botón de acción (slot) y tiles (slot por defecto).
const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  activos: { type: Number, default: 0 },
  inactivos: { type: Number, default: 0 },
});

const total = computed(() => props.activos + props.inactivos);
const pct = computed(() => (total.value ? Math.round((props.activos / total.value) * 100) : 0));
</script>

<template>
  <section class="hero app-card">
    <HeroArt class="hero__art" />

    <div class="hero__main">
      <header class="hero__head">
        <div>
          <h2 class="hero__title">{{ title }}</h2>
          <p class="hero__sub">{{ subtitle }}</p>
        </div>
        <slot name="actions" />
      </header>

      <div class="share">
        <div
          class="share__bar"
          role="img"
          :aria-label="`${activos} activos y ${inactivos} inactivos (${pct}% activos)`"
        >
          <span class="share__fill" :style="{ width: pct + '%' }"></span>
        </div>
        <ul class="share__legend">
          <li><i class="dot dot--on"></i>Activos <b>{{ activos }}</b></li>
          <li><i class="dot dot--off"></i>Inactivos <b>{{ inactivos }}</b></li>
        </ul>
      </div>

      <div class="tiles"><slot /></div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: minmax(220px, 330px) minmax(0, 1fr);
  gap: 32px;
  align-items: center;
  padding: 28px 32px;
}
.hero__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.hero__title {
  margin: 0;
  font-family: var(--f-display);
  font-size: clamp(24px, 2.6vw, 32px);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.05;
}
.hero__sub {
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 15px;
}
.share {
  margin: 20px 0 18px;
}
.share__bar {
  height: 12px;
  border-radius: 999px;
  background: var(--track);
  overflow: hidden;
}
.share__fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--accent);
  transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.share__legend {
  display: flex;
  gap: 24px;
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
  font-size: 15px;
  color: var(--muted);
}
.share__legend b {
  margin-left: 4px;
  color: var(--text);
}
.dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 8px;
  border-radius: 4px;
}
.dot--on {
  background: var(--accent);
}
.dot--off {
  background: var(--off);
}
.tiles {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}
@media (max-width: 1100px) {
  .hero {
    grid-template-columns: minmax(0, 1fr);
    padding: 22px 20px;
  }
  .hero__art {
    display: none;
  }
}
@media (max-width: 599px) {
  .tiles {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (prefers-reduced-motion: reduce) {
  .share__fill {
    transition: none;
  }
}
</style>
