<script setup>
import { computed, onMounted, ref } from 'vue'
import { adminApi } from '../services/adminApi'
import { useAdminAuth } from '../composables/useAdminAuth'

const { token } = useAdminAuth()
const form = ref({ labelZh: '', labelJa: '', date: '' })
const lightsForm = ref({ enabled: false, startAt: '', endAt: '' })
const lightsActive = ref(false)
const loading = ref(false)
const saving = ref(false)
const savingLights = ref(false)
const error = ref('')
const saved = ref(false)
const lightsError = ref('')
const lightsSaved = ref(false)

function toInputDateTime(value) {
  if (!value) return ''
  const s = String(value).trim()
  if (!s) return ''
  // try parse and format to local datetime-local
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return s.slice(0, 16)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromInputDateTime(value) {
  return (value ?? '').trim()
}

const previewActive = computed(() => {
  if (lightsForm.value.enabled) return true
  const start = lightsForm.value.startAt ? Date.parse(lightsForm.value.startAt) : NaN
  const end = lightsForm.value.endAt ? Date.parse(lightsForm.value.endAt) : NaN
  const now = Date.now()
  const hasStart = !Number.isNaN(start)
  const hasEnd = !Number.isNaN(end)
  if (hasStart && hasEnd) return now >= start && now <= end
  if (hasStart && !hasEnd) return now >= start
  if (!hasStart && hasEnd) return now <= end
  return false
})

async function load() {
  loading.value = true
  error.value = ''
  lightsError.value = ''
  saved.value = false
  lightsSaved.value = false
  try {
    const data = (await adminApi.getSettings(token.value)).data ?? {}
    const countdown = data.countdown ?? {}
    const lights = data.lights ?? {}
    form.value = {
      labelZh: countdown.labelZh ?? '',
      labelJa: countdown.labelJa ?? '',
      date: countdown.date ?? '',
    }
    lightsForm.value = {
      enabled: Boolean(lights.enabled),
      startAt: toInputDateTime(lights.startAt),
      endAt: toInputDateTime(lights.endAt),
    }
    lightsActive.value = Boolean(lights.active)
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

async function submitLights() {
  savingLights.value = true
  lightsError.value = ''
  lightsSaved.value = false
  try {
    const payload = {
      enabled: Boolean(lightsForm.value.enabled),
      startAt: fromInputDateTime(lightsForm.value.startAt),
      endAt: fromInputDateTime(lightsForm.value.endAt),
    }
    if (payload.startAt && payload.endAt && Date.parse(payload.startAt) > Date.parse(payload.endAt)) {
      throw new Error('结束时间需晚于开始时间')
    }
    await adminApi.updateSettings(token.value, { lights: payload })
    lightsSaved.value = true
    await load()
  } catch (err) {
    lightsError.value = err instanceof Error ? err.message : '保存失败'
  } finally {
    savingLights.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="admin-page">
    <div class="admin-page-head"><h1>站点设置</h1><span class="admin-count">首页倒计时 · 灯海动效</span></div>

    <form class="admin-card admin-tl-form" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px" @submit.prevent="submit">
      <h3 class="admin-card-title" style="grid-column: span 3">首页倒计时</h3>
      <label>标题（中文）<input v-model="form.labelZh" type="text" maxlength="60" placeholder="下一个纪念日 · 生日" required /></label>
      <label>标题（日文）<input v-model="form.labelJa" type="text" maxlength="60" placeholder="次の記念日 · 卒業百日祭" required /></label>
      <label>目标日期<input v-model="form.date" type="date" required /></label>
      <p class="admin-hint" style="grid-column: span 3; margin: 0; padding: 12px 16px; text-align: left">
        倒计时天数由后端根据目标日期自动计算，前端首页和日文版会分别展示对应的标题。
      </p>
      <p v-if="error" class="admin-error" style="grid-column: span 3">{{ error }}</p>
      <p v-else-if="saved" style="grid-column: span 3; margin: 0; font-size: 13px; color: var(--accent-2)">已保存 ✓</p>
      <div class="admin-tl-actions" style="grid-column: span 3">
        <button class="btn btn-primary" type="submit" :disabled="saving">{{ saving ? '保存中…' : '保存倒计时' }}</button>
      </div>
    </form>

    <form class="admin-card admin-tl-form" style="display:grid;grid-template-columns:1fr 1fr;gap:12px" @submit.prevent="submitLights">
      <div style="grid-column: span 2; display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <h3 class="admin-card-title" style="margin:0">首页灯海动效</h3>
        <span :style="{fontSize:'12px',padding:'4px 10px',borderRadius:'999px',border:'1px solid',borderColor: previewActive ? 'rgba(127,226,232,0.32)' : 'rgba(141,159,212,0.18)', background: previewActive ? 'rgba(127,226,232,0.12)' : 'rgba(255,255,255,0.04)', color: previewActive ? '#7fe2e8' : 'var(--muted)'}">
          {{ previewActive ? '● 当前生效中' : '○ 未生效' }}<span v-if="lightsActive" style="margin-left:6px;opacity:0.7">· 后端判定 active</span>
        </span>
      </div>

      <label style="display:flex;align-items:center;gap:10px;grid-column: span 2; cursor:pointer; user-select:none">
        <input v-model="lightsForm.enabled" type="checkbox" style="width:18px;height:18px;accent-color:#7fe2e8" />
        <span style="font-size:13px;color:var(--paper)">强制开启灯海（打开后无视时间，首页立即显示）</span>
      </label>

      <label>开始时间（可选）<input v-model="lightsForm.startAt" type="datetime-local" /></label>
      <label>结束时间（可选）<input v-model="lightsForm.endAt" type="datetime-local" /></label>

      <p class="admin-hint" style="grid-column: span 2; margin: 0; padding: 12px 16px; text-align: left; line-height:1.8">
        逻辑：<b style="color:var(--paper)">开关开启 = 立即生效</b>；开关关闭时，若设置了时间段则按时间自动生效（仅开始=开始后生效，仅结束=结束前生效，都有=区间内生效，<b style="color:var(--paper)">都不填=不生效</b>）。前端每 60 秒轮询一次，后台保存后约 1 分钟内首页会出现/消失。<br />
        效果为暖黄+青蓝+淡紫光点从页面底部缓缓向上飘动，叠加底部光晕。
      </p>

      <p v-if="lightsError" class="admin-error" style="grid-column: span 2">{{ lightsError }}</p>
      <p v-else-if="lightsSaved" style="grid-column: span 2; margin: 0; font-size: 13px; color: var(--accent-2)">灯海设置已保存 ✓</p>

      <div class="admin-tl-actions" style="grid-column: span 2; display:flex;gap:10px">
        <button class="btn btn-primary" type="submit" :disabled="savingLights">{{ savingLights ? '保存中…' : '保存灯海设置' }}</button>
        <button class="btn btn-ghost" type="button" style="border:1px solid var(--line);background:rgba(255,255,255,0.04)" @click="lightsForm.enabled=false; lightsForm.startAt=''; lightsForm.endAt=''">清空时间并关闭</button>
      </div>
    </form>

    <p v-if="loading" class="admin-hint">正在加载设置……</p>
  </section>
</template>
