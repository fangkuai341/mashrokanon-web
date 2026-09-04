<template>
  <header class="page-head">
    <p class="page-kicker">{{ kicker }}</p>
    <h2>{{ title }}</h2>
    <p class="page-desc">{{ desc }}</p>
  </header>
</template>

<script setup>
defineProps({
  kicker: { type: String, required: true },
  title: { type: String, required: true },
  desc: { type: String, required: true },
})
</script>
