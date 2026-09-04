<script setup>
defineProps({
  items: { type: Array, required: true },
  modelValue: { type: String, required: true },
  ariaLabel: { type: String, default: '' },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="filter-chips" role="group" :aria-label="ariaLabel">
    <button
      v-for="item in items"
      :key="item.value"
      :class="['chip', { 'is-active': modelValue === item.value }]"
      type="button"
      @click="$emit('update:modelValue', item.value)"
    >
      {{ item.label }}
    </button>
  </div>
</template>
