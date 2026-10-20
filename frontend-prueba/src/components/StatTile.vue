<script setup>
// Tarjeta de dato clicable. Con `toggle` funciona como filtro (activa / inactiva);
// sin `toggle` es un atajo que lleva a otra sección.
defineProps({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: [Number, String], default: 0 },
  hint: { type: String, default: "" },
  active: { type: Boolean, default: false },
  toggle: { type: Boolean, default: true },
});
</script>

<template>
  <button type="button" class="tile" :class="{ 'tile--on': active }" :aria-pressed="toggle ? active : undefined">
    <span class="tile__top">
      <span class="tile__icon"><q-icon :name="icon" size="24px" /></span>
      <span class="tile__value">{{ value }}</span>
    </span>
    <span class="tile__label">{{ label }}</span>
    <span v-if="hint" class="tile__hint">{{ hint }}</span>
  </button>
</template>

<style scoped>
.tile {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 118px;
  padding: 16px 18px;
  border: 2px solid var(--line);
  border-radius: 20px;
  background: var(--surface-2);
  color: var(--text);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.15s,
    background-color 0.15s,
    transform 0.1s;
}
.tile:hover {
  border-color: var(--accent);
}
.tile:active {
  transform: translateY(1px);
}
.tile:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
.tile--on {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 14%, var(--surface-2));
}
.tile__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.tile__icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 13px;
  background: var(--track);
  color: var(--link);
}
.tile--on .tile__icon {
  background: var(--accent);
  color: var(--accent-ink);
}
.tile__value {
  font-family: var(--f-display);
  font-size: 38px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
}
.tile__label {
  font-size: 16px;
  font-weight: 700;
}
.tile__hint {
  margin-top: -6px;
  font-size: 13px;
  color: var(--muted);
}
@media (prefers-reduced-motion: reduce) {
  .tile {
    transition: none;
  }
}
</style>
