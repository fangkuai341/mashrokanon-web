<script setup>
defineProps({
  copy: { type: Object, required: true },
  stats: { type: Array, required: true },
  entries: { type: Array, required: true },
})

defineEmits(['enter-timeline', 'enter-memory'])
</script>

<template>
  <section class="page page-home is-active">
    <div class="hero">
      <p class="hero-kicker">{{ copy.hero_kicker }}</p>
      <h1 class="hero-title">{{ copy.hero_title }}</h1>
      <p class="hero-sub">{{ copy.hero_sub }}</p>
      <div class="hero-meta">
        <span>真白花音 · 眞白 かのん · Mashiro Kanon</span>
        <span class="dot" aria-hidden="true">·</span>
        <span>{{ copy.hero_meta2 }}</span>
      </div>
      <div class="hero-actions">
        <router-link class="btn btn-primary" to="/timeline">{{ copy.cta_enter }}</router-link>
        <router-link class="btn btn-ghost" to="/memory">{{ copy.cta_write }}</router-link>
      </div>
    </div>

    <section class="countdown card reveal is-visible">
      <div class="countdown-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.3">
          <path d="M12 4.5c3.2 3.4 5.2 6.8 5.2 9.9 0 3.4-2.3 5.6-5.2 5.6s-5.2-2.2-5.2-5.6c0-3.1 2-6.5 5.2-9.9Z" />
          <path d="M12 15.2v2.2" />
          <path d="M9.5 19.6h5" />
          <path d="M12 4.5V3.2" />
        </svg>
      </div>
      <div class="countdown-body">
        <p class="countdown-label">{{ copy.cd_label }}</p>
        <p class="countdown-date">2026 年 8 月 9 日</p>
        <p class="countdown-days"><strong class="days-num">—</strong> <span>{{ copy.cd_days }}</span></p>
      </div>
    </section>

    <section class="stats" aria-label="关键数据">
      <div v-for="item in stats" :key="item.label" class="stat reveal is-visible">
        <strong>{{ item.value }}</strong>
        <span>{{ item.label }}</span>
      </div>
    </section>

    <section class="entries">
      <h2 class="entries-title">{{ copy.entries_title }}</h2>
      <div class="entries-grid">
        <router-link v-for="entry in entries" :key="entry.to" :to="entry.to" class="entry reveal is-visible">
          <span class="entry-icon" aria-hidden="true">
            <svg v-if="entry.icon === 'timeline'" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 19.5V5.5a1 1 0 0 1 1-1h9.5l5.5 5.5v9.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z"/><path d="M14.5 4.5v5.5H20"/><path d="M8.5 15.5h7"/></svg>
            <svg v-else-if="entry.icon === 'memory'" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 4h14a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9.5L5 20.5V5a1 1 0 0 1 1-1Z"/><path d="M8 9h8"/><path d="M8 12.5h5"/></svg>
            <svg v-else-if="entry.icon === 'capsule'" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 10V8a6 6 0 0 1 12 0v2"/><rect x="4.5" y="10" width="15" height="10" rx="2"/><path d="M12 13.5v3.2"/></svg>
            <svg v-else viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 19l7-7 3 3-7 7-3-3Z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5Z"/><path d="M2 2l7.6 7.6"/><path d="M11 11l2 2"/></svg>
          </span>
          <h3>{{ entry.title }}</h3>
          <p>{{ entry.desc }}</p>
          <span class="entry-arrow" aria-hidden="true">→</span>
        </router-link>
      </div>
    </section>

    <section class="farewell card reveal is-visible">
      <h2 class="farewell-title">{{ copy.fw_title }}</h2>
      <blockquote class="farewell-quote">{{ copy.fw_quote }}</blockquote>
      <p class="farewell-note">{{ copy.fw_note }}</p>
    </section>
  </section>
</template>
