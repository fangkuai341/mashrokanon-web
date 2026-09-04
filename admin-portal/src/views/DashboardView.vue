<script setup>
import { onMounted, ref } from 'vue'
import { adminApi } from '../services/adminApi'
import { useAdminAuth } from '../composables/useAdminAuth'

const { token } = useAdminAuth()
const data = ref(null)
const loading = ref(false)
const error = ref('')
const definitions = [
  ['timeline', '时间轴事件'],
  ['pendingLetters', '待审核留言'],
  ['approvedLetters', '已通过留言'],
  ['pendingSubmissions', '待审核投稿'],
  ['approvedSubmissions', '已通过投稿'],
  ['capsules', '胶囊总数'],
  ['unlockedCapsules', '已解锁胶囊'],
]

async function load() {
  loading.value = true
  error.value = ''
  try { data.value = (await adminApi.dashboard(token.value)).data } catch (err) { error.value = err instanceof Error ? err.message : '加载失败' } finally { loading.value = false }
}

onMounted(load)
</script>

<template>
  <section class="admin-page">
    <div class="admin-page-head"><h1>数据总览</h1><button class="btn btn-ghost" type="button" @click="load">刷新</button></div>
    <p v-if="error" class="admin-error">{{ error }}</p>
    <p v-if="loading" class="admin-hint">正在读取统计数据……</p>
    <div v-else class="admin-grid"><div v-for="[key, label] in definitions" :key="key" class="admin-stat"><strong>{{ data?.[key] ?? 0 }}</strong><span>{{ label }}</span></div></div>
  </section>
</template>
