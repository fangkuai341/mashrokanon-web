<script setup>
import { onMounted, ref } from 'vue'
import { adminApi } from '../services/adminApi'
import { useAdminAuth } from '../composables/useAdminAuth'

const { token } = useAdminAuth()
const items = ref([])
const loading = ref(false)
const error = ref('')
const editingId = ref(null)
const saving = ref(false)
const emptyForm = () => ({ date: '', title: '', zh: '', ja: '', tags: '', link: '', featured: false })
const form = ref(emptyForm())

async function load() {
  loading.value = true
  error.value = ''
  try {
    items.value = (await adminApi.timeline(token.value)).data.items ?? []
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载失败'
  } finally {
    loading.value = false
  }
}

function startEdit(item) {
  editingId.value = item.id
  form.value = { date: item.date, title: item.title, zh: item.zh, ja: item.ja, tags: (item.tags ?? []).join(','), link: item.link ?? '', featured: Boolean(item.featured) }
}

function cancelEdit() {
  editingId.value = null
  form.value = emptyForm()
}

async function submit() {
  saving.value = true
  error.value = ''
  try {
    const payload = { ...form.value, tags: form.value.tags.split(',').map((item) => item.trim()).filter(Boolean) }
    if (editingId.value) await adminApi.updateTimeline(token.value, editingId.value, payload)
    else await adminApi.createTimeline(token.value, payload)
    cancelEdit()
    await load()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '保存失败'
  } finally {
    saving.value = false
  }
}

async function remove(item) {
  if (!window.confirm(`确定删除「${item.title}」吗？`)) return
  try {
    await adminApi.deleteTimeline(token.value, item.id)
    await load()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '删除失败'
  }
}

onMounted(load)
</script>

<template>
  <section class="admin-page">
    <div class="admin-page-head"><h1>时间轴管理</h1><span class="admin-count">{{ items.length }} 个事件</span></div>
    <form class="admin-card admin-tl-form" @submit.prevent="submit">
      <h3 class="admin-card-title">{{ editingId ? '编辑事件' : '新增事件' }}</h3>
      <label>日期<input v-model="form.date" type="date" required /></label>
      <label>标题<input v-model="form.title" type="text" maxlength="60" required /></label>
      <label>标签<input v-model="form.tags" type="text" placeholder="里程碑,毕业" /></label>
      <label>出处链接<input v-model="form.link" type="url" maxlength="300" placeholder="可选：B 站切片 / 原文链接" /></label>
      <label>中文内容<textarea v-model="form.zh" rows="3" required></textarea></label>
      <label>日文内容<textarea v-model="form.ja" rows="3"></textarea></label>
      <label class="admin-check"><input v-model="form.featured" type="checkbox" /> 精选事件</label>
      <p v-if="error" class="admin-error">{{ error }}</p>
      <div class="admin-tl-actions"><button class="btn btn-primary" type="submit" :disabled="saving">{{ saving ? '保存中…' : editingId ? '保存修改' : '新增事件' }}</button><button v-if="editingId" class="btn btn-ghost" type="button" @click="cancelEdit">取消</button></div>
    </form>
    <p v-if="loading" class="admin-hint">正在加载时间轴……</p>
    <p v-else-if="items.length === 0" class="admin-hint">暂无时间轴事件，先新增一条吧。</p>
    <div v-else class="admin-table-wrap"><table class="admin-table"><thead><tr><th>日期</th><th>标题</th><th>中文</th><th>标签</th><th>出处</th><th>精选</th><th>操作</th></tr></thead><tbody><tr v-for="item in items" :key="item.id"><td class="admin-mono">{{ item.date }}</td><td><strong>{{ item.title }}</strong></td><td>{{ item.zh }}</td><td><span v-for="tag in item.tags" :key="tag" class="admin-tag">{{ tag }}</span></td><td><a v-if="item.link" :href="item.link" target="_blank" rel="noopener" class="admin-link-btn">查看</a><span v-else>—</span></td><td>{{ item.featured ? '是' : '—' }}</td><td class="admin-row-actions"><button class="admin-link-btn" type="button" @click="startEdit(item)">编辑</button><button class="admin-link-btn danger" type="button" @click="remove(item)">删除</button></td></tr></tbody></table></div>
  </section>
</template>