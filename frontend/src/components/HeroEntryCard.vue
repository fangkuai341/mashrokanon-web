<script setup>
defineProps({
  to: { type: String, required: true },
  title: { type: String, required: true },
  desc: { type: String, required: true },
  icon: { type: String, required: true },
})
</script>

<template>
  <router-link class="entry reveal is-visible" :to="to">
    <span class="entry-icon" aria-hidden="true">
      <svg v-if="icon === 'timeline'" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 19.5V5.5a1 1 0 0 1 1-1h9.5l5.5 5.5v9.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z"/><path d="M14.5 4.5v5.5H20"/><path d="M8.5 15.5h7"/></svg>
      <svg v-else-if="icon === 'memory'" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 4h14a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9.5L5 20.5V5a1 1 0 0 1 1-1Z"/><path d="M8 9h8"/><path d="M8 12.5h5"/></svg>
      <svg v-else-if="icon === 'capsule'" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 10V8a6 6 0 0 1 12 0v2"/><rect x="4.5" y="10" width="15" height="10" rx="2"/><path d="M12 13.5v3.2"/></svg>
      <svg v-else viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 19l7-7 3 3-7 7-3-3Z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5Z"/><path d="M2 2l7.6 7.6"/><path d="M11 11l2 2"/></svg>
    </span>
    <h3>{{ title }}</h3>
    <p>{{ desc }}</p>
    <span class="entry-arrow" aria-hidden="true">→</span>
  </router-link>
</template>
