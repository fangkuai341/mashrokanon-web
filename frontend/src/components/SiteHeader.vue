<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  copy: { type: Object, required: true },
  lang: { type: String, required: true },
  navItems: { type: Array, required: true },
})

defineEmits(['set-language', 'go-home'])
</script>

<template>
  <header class="site-header">
    <div class="header-left">
      <button class="brand" type="button" @click="$emit('go-home')">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.4">
            <path d="M12 3c2.8 3 4.6 6 4.6 8.8 0 3-2 5.4-4.6 5.4s-4.6-2.4-4.6-5.4C7.4 9 9.2 6 12 3Z" />
            <path d="M12 17.2v3.8" />
            <path d="M9 21h6" />
          </svg>
        </span>
        <span class="brand-text">
          <strong>白菜的森林</strong>
          <small>LOVE·KANON FAN ARCHIVE</small>
        </span>
      </button>

     

      <nav class="site-nav" aria-label="主导航">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          active-class="is-active"
          exact-active-class="is-active"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
    </div>
    <div class="header-right">
      <span class="official-badge">{{ copy.badge_official }}</span>
    <div class="lang-switch" role="group" aria-label="语言切换">
      <button :class="['lang-btn', { 'is-active': lang === 'zh' }]" @click="$emit('set-language', 'zh')">{{ copy.lang_zh }}</button>
      <button :class="['lang-btn', { 'is-active': lang === 'ja' }]" @click="$emit('set-language', 'ja')">{{ copy.lang_ja }}</button>
    </div>
    </div>
    
  </header>
</template>
<style>

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

</style>