<script setup>
import { onMounted, ref, computed } from 'vue'
import { adminApi } from '../services/adminApi'
import { useAdminAuth } from '../composables/useAdminAuth'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

const { token } = useAdminAuth()
const items = ref([])
const loading = ref(false)
const status = ref('pending')
const expanded = ref(null)
const error = ref('')
const busy = ref(false)

function resolveImage(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('/uploads/')) {
    const base = API_BASE.replace(/\/$/, '')
    return `${base}${url}`
  }
  return url
}

const expandedItem = computed(() => items.value.find((i) => i.id === expanded.value) ?? null)

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
    <p class="admin-hint">投稿为粉丝提交的时间轴事件，通过后会写入足迹时间轴档案馆并公开展示；驳回则不会入库。含配图的投稿会在此预览封面。</p>
    <p v-if="error" class="admin-error">{{ error }}</p>
    <p v-if="loading" class="admin-hint">正在加载投稿……</p>
    <p v-else-if="items.length === 0" class="admin-hint">当前没有投稿。</p>
    <div v-else class="admin-list">
      <article v-for="item in items" :key="item.id" class="admin-card" :class="{ 'is-open': expanded === item.id }">
        <header class="admin-card-head" @click="toggle(item.id)">
          <div style="display:flex;gap:12px;align-items:center;min-width:0">
            <div v-if="item.image" class="admin-thumb" :style="{ backgroundImage: `url(${resolveImage(item.image)})` }" aria-hidden="true"></div>
            <div style="min-width:0">
              <h3 class="admin-card-title" style="margin-bottom:4px">{{ item.date }} · {{ item.title }}</h3>
              <p class="admin-card-meta">{{ item.submitter }} · 提交于 {{ new Date(item.createdAt).toLocaleString() }}<span v-if="item.image" style="color:var(--accent-2)"> · 含配图</span></p>
            </div>
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

          <!-- 新增：图片 URL 字段 -->
          <div class="admin-image-block">
            <p class="admin-card-meta"><b>配图</b> <span style="color:var(--muted);font-weight:400">（入档后作为时间轴卡片封面展示）</span></p>
            <template v-if="item.image">
              <div class="admin-image-preview">
                <img :src="resolveImage(item.image)" alt="投稿配图预览" @error="(e)=> e.target.style.display='none'" />
              </div>
              <p class="admin-card-meta admin-mono" style="word-break:break-all;white-space:normal;margin-top:8px">
                <a v-if="/^https?:\/\//i.test(item.image)" :href="item.image" target="_blank" rel="noopener">{{ item.image }}</a>
                <span v-else>{{ item.image }} <span style="color:var(--accent-2)">· 站内上传</span></span>
              </p>
            </template>
            <p v-else class="admin-card-meta" style="color:var(--muted)">未提供配图 · 审核入库后将使用默认封面</p>
          </div>

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

<style scoped>
.admin-thumb {
  flex: 0 0 52px;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  border: 1px solid rgba(141,159,212,0.16);
  background-size: cover;
  background-position: center;
  background-color: rgba(8,12,22,0.9);
}
.admin-image-block {
  margin-top: 14px;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid rgba(141,159,212,0.14);
  background: rgba(8,12,22,0.56);
}
.admin-image-preview {
  margin-top: 10px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(141,159,212,0.14);
  background: rgba(6,10,20,0.8);
  max-height: 320px;
}
.admin-image-preview img {
  display: block;
  width: 100%;
  max-height: 320px;
  object-fit: cover;
}
</style>
