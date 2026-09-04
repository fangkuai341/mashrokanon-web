<template>
  <div class="hero">
    <p class="hero-kicker">{{ kicker }}</p>
    <h1 class="hero-title">{{ title }}</h1>
    <p class="hero-sub">{{ subtitle }}</p>
    <div class="hero-meta">
      <slot name="meta" />
    </div>
    <div class="hero-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  kicker: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
})
</script>
