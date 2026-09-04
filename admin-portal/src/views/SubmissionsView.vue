<script setup>
import { onMounted, ref } from 'vue'
import { adminApi } from '../services/adminApi'
import { useAdminAuth } from '../composables/useAdminAuth'

const { token } = useAdminAuth()
const items = ref([])
const loading = ref(false)
const status = ref('pending')
const expanded = ref(null)
const error = ref('')
const busy = ref(false)

async function load() {
  loading.value = true
  error.value = ''
  try { items.value = (await adminApi.submissions(token.value, status.value)).data.items ?? [] } finally { loading.value = false }
}

async function approve(item) {
  if (!window.confirm(`通过后将以「${item.date} ${item.title}」写入足迹时间轴档案馆并公开展示，确认通过吗？`)) return
  busy.value = true
  error.value = ''
  try {
    await adminApi.approveSubmission(token.value, item.id)
    await load()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '操作失败'
  } finally {
    busy.value = false
  }
}

async function reject(item) {
  const reason = window.prompt('驳回原因', '') ?? ''
  if (!reason.trim()) return
  busy.value = true
  error.value = ''
  try {
    await adminApi.rejectSubmission(token.value, item.id, reason.trim())
    await load()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '操作失败'
  } finally {
    busy.value = false
  }
}

function toggle(id) { expanded.value = expanded.value === id ? null : id }
onMounted(load)
</script>

<template>
  <section class="admin-page">
    <div class="admin-page-head"><h1>投稿审核</h1><select v-model="status" @change="load"><option value="pending">待审核</option><option value="approved">已通过</option><option value="rejected">已拒绝</option></select></div>
    <p class="admin-hint">投稿为粉丝提交的时间轴事件，通过后会写入足迹时间轴档案馆并公开展示；驳回则不会入库。</p>
    <p v-if="error" class="admin-error">{{ error }}</p>
    <p v-if="loading" class="admin-hint">正在加载投稿……</p>
    <p v-else-if="items.length === 0" class="admin-hint">当前没有投稿。</p>
    <div v-else class="admin-list">
      <article v-for="item in items" :key="item.id" class="admin-card" :class="{ 'is-open': expanded === item.id }">
        <header class="admin-card-head" @click="toggle(item.id)">
          <div>
            <h3 class="admin-card-title">{{ item.date }} · {{ item.title }}</h3>
            <p class="admin-card-meta">{{ item.submitter }} · 提交于 {{ new Date(item.createdAt).toLocaleString() }}</p>
          </div>
          <span class="admin-status">{{ item.status }}</span>
        </header>
        <template v-if="expanded === item.id">
          <p class="admin-card-meta"><b>中文描述</b></p>
          <p class="admin-card-body">{{ item.zh }}</p>
          <p class="admin-card-meta"><b>日文描述</b></p>
          <p class="admin-card-body">{{ item.ja || '未提供' }}</p>
          <p class="admin-card-meta">
            标签：
            <span v-if="item.tags && item.tags.length" v-for="tag in item.tags" :key="tag" class="admin-tag">{{ tag }}</span>
            <span v-else>无</span>
          </p>
          <p class="admin-card-meta">来源：<a v-if="item.source" :href="item.source" target="_blank" rel="noopener">{{ item.source }}</a><span v-else>未提供</span></p>
          <p v-if="item.status !== 'pending'" class="admin-card-meta">审核时间：{{ item.reviewedAt ? new Date(item.reviewedAt).toLocaleString() : '—' }}</p>
          <p v-if="item.reason" class="admin-card-meta">驳回原因：{{ item.reason }}</p>
          <div v-if="item.status === 'pending'" class="admin-actions">
            <button class="btn btn-primary" type="button" :disabled="busy" @click="approve(item)">通过并入档</button>
            <button class="btn btn-ghost" type="button" :disabled="busy" @click="reject(item)">驳回</button>
          </div>
        </template>
      </article>
    </div>
  </section>
</template>