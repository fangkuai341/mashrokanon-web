<template>
  <article :class="['card', className]">
    <slot />
  </article>
</template>

<script setup>
defineProps({
  className: { type: String, default: '' },
})
</script>
