<script setup>
import { onMounted, ref } from 'vue'
import { adminApi } from '../services/adminApi'
import { useAdminAuth } from '../composables/useAdminAuth'

const { token } = useAdminAuth()
const form = ref({ labelZh: '', labelJa: '', date: '' })
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const saved = ref(false)

async function load() {
  loading.value = true
  error.value = ''
  saved.value = false
  try {
    const countdown = (await adminApi.getSettings(token.value)).data.countdown ?? {}
    form.value = {
      labelZh: countdown.labelZh ?? '',
      labelJa: countdown.labelJa ?? '',
      date: countdown.date ?? '',
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载失败'
  } finally {
    loading.value = false
  }
}

async function submit() {
  saving.value = true
  error.value = ''
  saved.value = false
  try {
    await adminApi.updateSettings(token.value, { countdown: { ...form.value } })
    saved.value = true
    await load()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '保存失败'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="admin-page">
    <div class="admin-page-head"><h1>站点设置</h1><span class="admin-count">首页倒计时展示配置</span></div>

    <form class="admin-card admin-tl-form" @submit.prevent="submit">
      <h3 class="admin-card-title" style="grid-column: span 3">首页倒计时</h3>

      <label>标题（中文）<input v-model="form.labelZh" type="text" maxlength="60" placeholder="下一个纪念日 · 生日" required /></label>
      <label>标题（日文）<input v-model="form.labelJa" type="text" maxlength="60" placeholder="次の記念日 · 卒業百日祭" required /></label>
      <label>目标日期<input v-model="form.date" type="date" required /></label>

      <p class="admin-hint" style="grid-column: span 3; margin: 0; padding: 12px 16px; text-align: left">
        倒计时天数由后端根据目标日期自动计算，前端首页和日文版会分别展示对应的标题。
      </p>

      <p v-if="error" class="admin-error" style="grid-column: span 3">{{ error }}</p>
      <p v-else-if="saved" style="grid-column: span 3; margin: 0; font-size: 13px; color: var(--accent-2)">已保存 ✓</p>

      <div class="admin-tl-actions">
        <button class="btn btn-primary" type="submit" :disabled="saving">{{ saving ? '保存中…' : '保存设置' }}</button>
      </div>
    </form>

    <p v-if="loading" class="admin-hint">正在加载设置……</p>
  </section>
</template>