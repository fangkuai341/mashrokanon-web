<template>
  <div class="sky" aria-hidden="true">
    <div class="moon"></div>
    <div class="stars">
      <span v-for="n in 88" :key="n" class="star" :style="starStyle(n)"></span>
    </div>
    <div class="fireflies">
      <span v-for="n in 9" :key="`fly-${n}`" class="firefly" :style="flyStyle(n)"></span>
    </div>
  </div>
</template>

<script setup>
function starStyle(n) {
  return {
    left: `${(n * 7) % 100}%`,
    top: `${(n * 13) % 100}%`,
    animationDelay: `${(n % 8) * 0.45}s`,
    width: `${n % 2 ? 2 : 1.2}px`,
    height: `${n % 2 ? 2 : 1.2}px`,
    '--td': `${4 + (n % 5)}s`,
  }
}

function flyStyle(n) {
  return {
    left: `${8 + n * 9}%`,
    top: `${10 + (n % 4) * 15}%`,
    animationDelay: `${n * 0.8}s`,
  }
}
</script>
