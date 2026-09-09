<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import PageHero from '../components/PageHero.vue'
import HeroEntryCard from '../components/HeroEntryCard.vue'
import GlassCard from '../components/GlassCard.vue'
import SeaOfLights from '../components/SeaOfLights.vue'
import { api } from '../services/api'

const props = defineProps({
  copy: { type: Object, required: true },
  stats: { type: Array, required: true },
  entries: { type: Array, required: true },
  lang: { type: String, default: 'zh' },
})

const summary = ref(null)
let pollTimer = null

const cards = computed(() => summary.value?.stats ?? [])
const lightsActive = computed(() => Boolean(summary.value?.lights?.active))

const countdown = computed(() => {
  const { copy, lang } = props
  const cd = summary.value?.countdown
  if (!cd?.date) {
    return { label: copy.cd_label, dateText: '2026 年 12 月 29 日', days: '—', suffix: copy.cd_days }
  }
  const [year, month, day] = cd.date.split('-')
  const isJa = lang === 'ja'
  const dateText = isJa
    ? `${year}年${Number(month)}月${Number(day)}日`
    : `${year} 年 ${Number(month)} 月 ${Number(day)} 日`
  return {
    label: isJa ? cd.labelJa : cd.labelZh,
    dateText,
    days: cd.days > 0 ? cd.days : '—',
    suffix: copy.cd_days,
  }
})

async function fetchSummary() {
  try {
    const res = await api.requestJson('/api/home/summary')
    summary.value = res.data ?? null
  } catch {
    summary.value = null
  }
}

onMounted(async () => {
  await fetchSummary()
  pollTimer = setInterval(fetchSummary, 60000)
})

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<template>
  <section class="page page-home is-active">
    <SeaOfLights :active="lightsActive" :count="40" />
    <PageHero :kicker="copy.hero_kicker" :title="copy.hero_title" :subtitle="copy.hero_sub">
      <template #meta>
        <span>真白花音 · 眞白 かのん · Mashiro Kanon</span>
        <span class="dot" aria-hidden="true">·</span>
        <span>{{ copy.hero_meta2 }}</span>
      </template>
      <template #actions>
        <router-link class="btn btn-primary" to="/timeline">{{ copy.cta_enter }}</router-link>
        <router-link class="btn btn-ghost" to="/memory">{{ copy.cta_write }}</router-link>
      </template>
    </PageHero>

    <GlassCard class-name="countdown reveal is-visible">
      <div class="countdown-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.3">
          <path d="M12 4.5c3.2 3.4 5.2 6.8 5.2 9.9 0 3.4-2.3 5.6-5.2 5.6s-5.2-2.2-5.2-5.6c0-3.1 2-6.5 5.2-9.9Z" />
          <path d="M12 15.2v2.2" />
          <path d="M9.5 19.6h5" />
          <path d="M12 4.5V3.2" />
        </svg>
      </div>
      <div class="countdown-body">
        <p class="countdown-label">{{ countdown.label }}</p>
        <p class="countdown-date">{{ countdown.dateText }}</p>
        <p class="countdown-days"><strong class="days-num">{{ countdown.days }}</strong> <span>{{ countdown.suffix }}</span></p>
      </div>
    </GlassCard>

    <section class="stats" aria-label="关键数据">
      <div v-for="item in (cards.length ? cards : stats)" :key="item.label" class="stat reveal is-visible">
        <strong>{{ item.value }}</strong>
        <span>{{ item.label }}</span>
      </div>
    </section>

    <section class="entries">
      <h2 class="entries-title">{{ copy.entries_title }}</h2>
      <div class="entries-grid">
        <HeroEntryCard v-for="entry in entries" :key="entry.to" v-bind="entry" />
      </div>
    </section>

    <GlassCard class-name="farewell reveal is-visible">
      <h2 class="farewell-title">{{ copy.fw_title }}</h2>
      <blockquote class="farewell-quote">{{ copy.fw_quote }}</blockquote>
      <p class="farewell-note">{{ summary?.notice ?? copy.fw_note }}</p>
    </GlassCard>
  </section>
</template>
