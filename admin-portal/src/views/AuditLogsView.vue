<script setup>
import { onMounted, ref } from 'vue'
import { adminApi } from '../services/adminApi'
import { useAdminAuth } from '../composables/useAdminAuth'

const { token } = useAdminAuth()
const logs = ref([])
const loading = ref(false)

async function load() {
  loading.value = true
  try { logs.value = (await adminApi.auditLogs(token.value)).data.items ?? [] } finally { loading.value = false }
}

onMounted(load)
</script>

<template>
  <section class="admin-page">
    <div class="admin-page-head"><h1>审计日志</h1><span class="admin-count">{{ logs.length }} 条</span></div>
    <p v-if="loading" class="admin-hint">正在加载审计日志……</p>
    <p v-else-if="logs.length === 0" class="admin-hint">暂无审计记录。</p>
    <div v-else class="admin-table-wrap"><table class="admin-table"><thead><tr><th>时间</th><th>操作</th><th>对象</th><th>原因</th><th>操作人</th></tr></thead><tbody><tr v-for="log in logs" :key="log.id"><td class="admin-mono">{{ new Date(log.createdAt).toLocaleString() }}</td><td><span class="admin-status">{{ log.action }}</span></td><td>{{ log.targetType }} · {{ log.targetId }}</td><td>{{ log.reason || '—' }}</td><td>{{ log.admin?.nickname || log.admin?.username || '系统' }}</td></tr></tbody></table></div>
  </section>
</template>