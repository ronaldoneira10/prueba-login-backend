<script setup>
// Escalera de barras con bandera: "cada curso es un paso". Decorativa.
const base = 210;
const ancho = 38;
const dx = 14;
const dy = -8;
const barras = [40, 72, 104, 138, 174].map((h, i) => ({
  x: 66 + i * 48,
  h,
  y: base - h,
  d: `${0.1 + i * 0.12}s`,
}));
const ultima = barras[barras.length - 1];
</script>

<template>
  <svg
    class="art"
    viewBox="0 0 360 260"
    role="img"
    aria-label="Escalera de barras ascendente con una bandera en el escalón más alto"
  >
    <defs>
      <linearGradient id="art-front" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#cbff5e" />
        <stop offset="1" stop-color="#8ccf14" />
      </linearGradient>
    </defs>

    <ellipse class="art__glow" cx="185" cy="206" rx="130" ry="26" />
    <ellipse class="art__platform art__platform--out" cx="185" cy="218" rx="152" ry="34" />
    <ellipse class="art__platform art__platform--in" cx="185" cy="212" rx="140" ry="29" />
    <ellipse class="art__orbit" cx="185" cy="214" rx="170" ry="44" />

    <g v-for="(b, i) in barras" :key="i" class="bar" :style="{ '--d': b.d }">
      <polygon :points="`${b.x + ancho},${b.y} ${b.x + ancho + dx},${b.y + dy} ${b.x + ancho + dx},${base + dy} ${b.x + ancho},${base}`" fill="#5f9d00" />
      <rect :x="b.x" :y="b.y" :width="ancho" :height="b.h" rx="3" fill="url(#art-front)" />
      <polygon :points="`${b.x},${b.y} ${b.x + dx},${b.y + dy} ${b.x + ancho + dx},${b.y + dy} ${b.x + ancho},${b.y}`" fill="#e2ff94" />
    </g>

    <g class="art__flag" :transform="`translate(${ultima.x + 9} ${ultima.y + 14})`">
      <path d="M0 40V0" />
      <path d="M0 2h20l-5 7 5 7H0" />
    </g>
  </svg>
</template>

<style scoped>
.art {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
  filter: drop-shadow(0 0 22px rgba(182, 242, 58, 0.2));
}
.art__glow {
  fill: rgba(182, 242, 58, 0.22);
  filter: blur(14px);
}
.art__platform--out {
  fill: var(--surface-2);
  stroke: var(--line);
  stroke-width: 2;
}
.art__platform--in {
  fill: var(--surface);
  stroke: var(--line);
  stroke-width: 1;
}
.art__orbit {
  fill: none;
  stroke: #b6f23a;
  stroke-width: 2;
  stroke-dasharray: 6 9;
  stroke-linecap: round;
  opacity: 0.7;
}
.art__flag {
  fill: none;
  stroke: #06140c;
  stroke-width: 3.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.bar {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: subir 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: var(--d);
}
@keyframes subir {
  from {
    transform: scaleY(0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .bar {
    animation: none;
  }
}
</style>
