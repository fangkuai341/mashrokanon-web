<script setup>
import { computed } from 'vue'

const props = defineProps({
  active: { type: Boolean, default: false },
  count: { type: Number, default: 36 },
})

const lights = computed(() => {
  return Array.from({ length: props.count }, (_, i) => {
    const seed = i * 137.5
    const left = (seed * 7.3) % 100
    const size = 6 + (i % 5) * 2.2 + (seed % 3)
    const duration = 9 + (i % 7) * 1.8 + (seed % 4)
    const delay = (i % 9) * 0.9 + (seed % 1.2)
    const drift = (i % 2 ? 1 : -1) * (12 + (i % 4) * 10)
    const hue = i % 3 === 0 ? 'amber' : i % 3 === 1 ? 'cyan' : 'violet'
    const opacity = 0.55 + (i % 3) * 0.16
    return { id: i, left, size, duration, delay, drift, hue, opacity }
  })
})
</script>

<template>
  <Transition name="lights-fade">
    <div v-if="active" class="sea-of-lights" aria-hidden="true">
      <div class="sea-glow"></div>
      <span
        v-for="item in lights"
        :key="item.id"
        class="sea-light"
        :class="`is-${item.hue}`"
        :style="{
          left: item.left + '%',
          width: item.size + 'px',
          height: item.size + 'px',
          '--dur': item.duration + 's',
          '--delay': item.delay + 's',
          '--drift': item.drift + 'px',
          '--op': item.opacity,
        }"
      >
        <i class="sea-light-core"></i>
        <i class="sea-light-halo"></i>
        <i class="sea-light-tail"></i>
      </span>
    </div>
  </Transition>
</template>

<style scoped>
.sea-of-lights {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.sea-glow {
  position: absolute;
  inset: auto -10% 0 -10%;
  height: 42vh;
  background:
    radial-gradient(680px 220px at 50% 100%, rgba(255, 214, 120, 0.16), transparent 70%),
    radial-gradient(520px 160px at 20% 100%, rgba(127, 226, 232, 0.1), transparent 70%),
    radial-gradient(520px 160px at 80% 100%, rgba(138, 148, 255, 0.1), transparent 70%);
  opacity: 0.9;
}

.sea-light {
  position: absolute;
  bottom: -24px;
  border-radius: 50%;
  animation: rise var(--dur) linear infinite;
  animation-delay: var(--delay);
  will-change: transform, opacity;
}

.sea-light-core {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 10px currentColor, 0 0 22px currentColor;
  opacity: var(--op);
  animation: twinkle-core calc(var(--dur) * 0.55) ease-in-out infinite;
  animation-delay: var(--delay);
}

.sea-light-halo {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 280%;
  height: 280%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle, currentColor 0%, transparent 62%);
  opacity: 0.18;
  filter: blur(1px);
}

.sea-light-tail {
  position: absolute;
  left: 50%;
  top: 82%;
  width: 1px;
  height: 22px;
  transform: translateX(-50%);
  background: linear-gradient(180deg, currentColor, transparent);
  opacity: 0.42;
}

.sea-light.is-amber { color: #ffd78a; }
.sea-light.is-cyan { color: #7fe2e8; }
.sea-light.is-violet { color: #b8b6ff; }

@keyframes rise {
  0% { transform: translate3d(0, 0, 0) scale(0.72); opacity: 0; }
  8% { opacity: 0.95; }
  50% { transform: translate3d(var(--drift), -52vh, 0) scale(1); opacity: 0.9; }
  88% { opacity: 0.55; }
  100% { transform: translate3d(calc(var(--drift) * 0.55), -112vh, 0) scale(0.9); opacity: 0; }
}

@keyframes twinkle-core {
  0%, 100% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.18); filter: brightness(1.22); }
}

.lights-fade-enter-active,
.lights-fade-leave-active { transition: opacity 0.9s ease; }
.lights-fade-enter-from,
.lights-fade-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .sea-light { animation: none; opacity: 0.5; }
}
</style>
