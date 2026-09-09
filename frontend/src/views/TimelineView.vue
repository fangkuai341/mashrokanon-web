<script setup>
import { computed, onMounted, ref } from 'vue'
import SectionHeader from '../components/SectionHeader.vue'
import FilterChips from '../components/FilterChips.vue'
import TimelineGroup from '../components/TimelineGroup.vue'
import { api } from '../services/api'

const props = defineProps({
  lang: { type: String, required: true },
})

const timelineEvents = ref([])
const selectedYear = ref('all')
const loading = ref(false)

const years = computed(() => ['all', ...new Set(timelineEvents.value.map((event) => event.y))])

const filteredEvents = computed(() => {
  if (selectedYear.value === 'all') return timelineEvents.value
  return timelineEvents.value.filter((event) => event.y === selectedYear.value)
})

const groupedYears = computed(() => {
  const source = filteredEvents.value
  const order = [...new Set(source.map((event) => event.y))]
  return order.map((year) => ({
    year,
    items: source.filter((event) => event.y === year),
  }))
})

async function loadTimeline() {
  loading.value = true
  try {
    const res = await api.requestJson('/api/timeline')
    timelineEvents.value = (res.data?.items ?? []).map((item) => {
      const [y, month, day] = item.date.split('-')
      return {
        ...item,
        y,
        d: `${month}.${day}`,
        image: item.image ? `${import.meta.env.VITE_API_BASE ?? ''}${item.image}` : 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=960&q=80',
      }
    })
  } catch {
    timelineEvents.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadTimeline)
</script>

<template>
  <section class="page page-timeline is-active">
    <SectionHeader kicker="ARCHIVE · 2019 — 2026" title="足迹时间轴" desc="从初配信到毕业，七年的森林足迹。这里会逐步替换为经审核的真实档案内容。" />

    <FilterChips
      v-model="selectedYear"
      :items="years.map((year) => ({ value: year, label: year === 'all' ? '全部' : year }))"
      aria-label="按年份筛选"
    />

    <p v-if="loading" class="tl-cta">正在读取森林档案……</p>

    <div class="timeline">
      <TimelineGroup v-for="group in groupedYears" :key="group.year" :year="group.year" :items="group.items" :lang="props.lang" />
    </div>

    <p class="tl-cta">
      <router-link to="/rank">去共建页提交补充资料 →</router-link>
    </p>
  </section>
</template>
