<script setup>
import { onMounted, ref, computed } from 'vue'
import SectionHeader from '../components/SectionHeader.vue'
import GlassCard from '../components/GlassCard.vue'
import { api } from '../services/api'

const props = defineProps({
  showToast: { type: Function, required: true },
})

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001'

const form = ref({
  date: '',
  title: '',
  zh: '',
  ja: '',
  tags: '',
  source: '',
  name: '',
  image: '',
})

const rankList = ref([])
const dateInputRef = ref(null)
const showImageModal = ref(false)
const imageTab = ref('url')
const imageUrlInput = ref('')
const pendingFile = ref(null)
const pendingPreview = ref('')
const uploading = ref(false)

const API_BASE_CLEAN = API_BASE.replace(/\/$/, '')

function resolveImage(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('/uploads/')) return `${API_BASE_CLEAN}${url}`
  return url
}

const hasImage = computed(() => Boolean(form.value.image))

function openDatePicker() {
  const el = dateInputRef.value
  if (!el) return
  try {
    if (typeof el.showPicker === 'function') el.showPicker()
    else el.focus()
  } catch {
    el.focus()
    el.click()
  }
}

const guidance = [
  '补充真实可溯源的时间轴事件：日期、标题、中/日文描述与标签。',
  '所有投稿都会先进入人工审核队列，避免误收不可靠内容。',
  '审核通过后会写入足迹时间轴档案馆，并在贡献榜中记录来源昵称。',
]

async function loadRank() {
  try {
    const res = await api.requestJson('/api/rank')
    rankList.value = res.data?.items ?? []
  } catch {
    rankList.value = [
      { name: '守林人 · 小K', count: 8 },
      { name: '白菜考古队', count: 5 },
      { name: '深夜听众 A', count: 3 },
      { name: '补档新人', count: 2 },
      { name: '切片收藏家', count: 2 },
      { name: '匿名旅人', count: 1 },
    ]
  }
}

function openImageModal() {
  imageUrlInput.value = /^https?:\/\//i.test(form.value.image) ? form.value.image : ''
  pendingFile.value = null
  pendingPreview.value = ''
  showImageModal.value = true
}

function closeImageModal() {
  showImageModal.value = false
}

function onFilePicked(event) {
  const file = event.target.files?.[0] ?? null
  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'].includes(file.type)) {
    props.showToast('仅支持 JPG / PNG / WebP / GIF', 'error')
    event.target.value = ''
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    props.showToast('图片大小不能超过 5MB', 'error')
    event.target.value = ''
    return
  }
  pendingFile.value = file
  pendingPreview.value = URL.createObjectURL(file)
}

function confirmUrl() {
  const url = imageUrlInput.value.trim()
  if (!url) {
    props.showToast('请输入图片 URL', 'error')
    return
  }
  if (!/^https?:\/\/.+\..+/i.test(url)) {
    props.showToast('请输入有效的 http(s) 图片链接', 'error')
    return
  }
  form.value.image = url
  closeImageModal()
  props.showToast('已使用 URL 配图')
}

async function uploadLocal() {
  if (!pendingFile.value) {
    props.showToast('请先选择本地图片', 'error')
    return
  }
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', pendingFile.value)
    const res = await fetch(`${API_BASE_CLEAN}/api/upload`, {
      method: 'POST',
      body: fd,
    })
    const payload = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(payload.error?.message ?? '上传失败')
    const url = payload.data?.url ?? ''
    if (!url) throw new Error('上传失败，未返回链接')
    form.value.image = url
    closeImageModal()
    props.showToast('图片上传成功')
  } catch (err) {
    props.showToast(err instanceof Error ? err.message : '上传失败', 'error')
  } finally {
    uploading.value = false
  }
}

function removeImage() {
  form.value.image = ''
  pendingFile.value = null
  pendingPreview.value = ''
}

async function submitPost() {
  if (!form.value.date.trim()) {
    props.showToast('请选择事件日期。', 'error')
    return
  }
  if (!form.value.title.trim()) {
    props.showToast('请填写事件标题。', 'error')
    return
  }
  if (!form.value.zh.trim()) {
    props.showToast('请填写中文描述。', 'error')
    return
  }

  try {
    await api.requestJson('/api/submissions', {
      method: 'POST',
      body: JSON.stringify({
        date: form.value.date,
        title: form.value.title.trim(),
        zh: form.value.zh.trim(),
        ja: form.value.ja.trim() || '',
        tags: form.value.tags.split(',').map((item) => item.trim()).filter(Boolean),
        source: form.value.source.trim(),
        image: form.value.image.trim(),
        name: form.value.name.trim(),
      }),
    })
    props.showToast('投稿已收到，站长审核通过后会写入足迹时间轴档案馆。')
    form.value = {
      date: '',
      title: '',
      zh: '',
      ja: '',
      tags: '',
      source: '',
      name: '',
      image: '',
    }
    imageUrlInput.value = ''
    pendingFile.value = null
    pendingPreview.value = ''
  } catch (error) {
    props.showToast(error instanceof Error ? error.message : '投稿失败', 'error')
  }
}

onMounted(loadRank)
</script>

<template>
  <section class="page page-rank is-active">
    <SectionHeader
      kicker="CONTRIBUTORS · FOREST CO-CREATION"
      title="投稿与贡献榜"
      desc="在这里补充资料，也在这里看见为森林添砖加瓦的人。"
    />

    <div class="community-layout">
      <div class="community-left">
        <GlassCard class-name="community-panel reveal is-visible">
          <div class="community-panel-head">
            <div>
              <p class="community-eyebrow">投稿说明</p>
              <h3 class="card-title">森林共建入口</h3>
            </div>
            <span class="community-badge">人工审核</span>
          </div>
          <ul class="steps community-steps">
            <li v-for="(item, index) in guidance" :key="item"><b>{{ String(index + 1).padStart(2, '0') }}</b> {{ item }}</li>
          </ul>
        </GlassCard>

        <div class="community-grid-bottom">
          <GlassCard class-name="community-panel reveal is-visible">
            <div class="community-panel-head">
              <div>
                <p class="community-eyebrow">贡献榜</p>
                <h3 class="card-title">被采纳投稿最多的旅人</h3>
              </div>
              <span class="community-badge community-badge-muted">截至本原型</span>
            </div>

            <div class="podium community-podium">
              <div class="podium-item place-2">
                <span class="podium-rank">02</span>
                <span class="podium-name">{{ rankList[1]?.name ?? '—' }}</span>
                <span class="podium-count">{{ rankList[1]?.count ?? 0 }} 篇</span>
              </div>
              <div class="podium-item place-1">
                <span class="podium-rank">01</span>
                <span class="podium-name">{{ rankList[0]?.name ?? '—' }}</span>
                <span class="podium-count">{{ rankList[0]?.count ?? 0 }} 篇</span>
              </div>
              <div class="podium-item place-3">
                <span class="podium-rank">03</span>
                <span class="podium-name">{{ rankList[2]?.name ?? '—' }}</span>
                <span class="podium-count">{{ rankList[2]?.count ?? 0 }} 篇</span>
              </div>
            </div>

            <div class="rank-list community-rank-list">
              <div v-for="(item, index) in rankList.slice(3)" :key="item.name" style="margin-bottom: 6px;" class="rank-row community-rank-row">
                <span class="rank-no">{{ String(index + 4).padStart(2, '0') }}</span>
                <span class="rank-name">{{ item.name }}</span>
                <span class="rank-count">{{ item.count }} 篇</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      <aside class="community-right">
        <GlassCard class-name="community-panel community-form-panel reveal is-visible">
          <div class="community-panel-head">
            <div>
              <p class="community-eyebrow">投稿表单</p>
              <h3 class="card-title">提交一条新足迹</h3>
            </div>
          </div>
          <form class="community-form" @submit.prevent="submitPost">
            <div class="form-row form-row--date" @click="openDatePicker">
              <label for="submit-date">事件日期 <b class="form-required">*</b></label>
              <input ref="dateInputRef" id="submit-date" v-model="form.date" type="date" required @click="openDatePicker" />
            </div>
            <div class="form-row">
              <label for="submit-title">事件标题 <b class="form-required">*</b></label>
              <input id="submit-title" v-model="form.title" type="text" maxlength="80" placeholder="例如：生日回读信环节" />
            </div>
            <div class="form-row">
              <label for="submit-zh">中文描述 <b class="form-required">*</b></label>
              <textarea id="submit-zh" v-model="form.zh" rows="7" maxlength="3000" placeholder="写下事件经过、背景与可溯源细节……"></textarea>
            </div>
            <div class="form-row">
              <label for="submit-ja">日文描述</label>
              <textarea id="submit-ja" v-model="form.ja" rows="3" maxlength="3000" placeholder="可选：日语版描述，弥补后由管理员补录"></textarea>
            </div>

            <!-- 事件配图：整块可点唤起弹窗，与主站输入框同款主题 -->
            <div class="form-row">
              <label for="image-picker-btn">事件配图</label>
              <button
                id="image-picker-btn"
                type="button"
                class="image-picker"
                :class="{ 'is-filled': hasImage }"
                @click="openImageModal"
              >
                <span class="image-picker-thumb" aria-hidden="true">
                  <img v-if="hasImage" :src="resolveImage(form.image)" alt="" @error="(e) => (e.target.style.display = 'none')" />
                  <svg v-else width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <rect x="2.5" y="3.5" width="15" height="13" rx="2.5" stroke="currentColor" stroke-width="1.3" />
                    <path d="M5 13.5L8 9l3 3.2L14.5 8 17 13.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                    <circle cx="13.5" cy="7" r="1.3" stroke="currentColor" stroke-width="1.1" />
                  </svg>
                </span>
                <span class="image-picker-text">
                  <template v-if="hasImage">
                    <b class="image-picker-name" :title="form.image">{{ form.image }}</b>
                    <small>点击更换 · 支持 URL / 本地上传</small>
                  </template>
                  <template v-else>
                    <b>点击选择或粘贴图片</b>
                    <small>支持 URL 直链或本地上传 · JPG / PNG / WebP / GIF ≤5MB</small>
                  </template>
                </span>
                <span class="image-picker-arrow" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="1" y="1" width="18" height="18" rx="9" stroke="currentColor" stroke-opacity="0.18" />
                    <path d="M7 8.2L10 11.2L13 8.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </button>
              <div v-if="hasImage" class="image-picker-actions">
                <button type="button" class="image-picker-remove" @click.stop="removeImage">移除图片</button>
                <span class="form-note" style="margin: 0">已选择，点击上方区域可更换</span>
              </div>
              <span v-else class="form-note">点击上方输入框任意位置即可打开图片选择弹窗</span>
            </div>

            <div class="form-row">
              <label for="submit-tags">标签</label>
              <input id="submit-tags" v-model="form.tags" type="text" maxlength="120" placeholder="可选：里程碑,名场面,形象（逗号分隔）" />
            </div>
            <div class="form-row">
              <label for="submit-source">素材链接 / 出处</label>
              <input id="submit-source" v-model="form.source" type="text" maxlength="300" placeholder="可选：B 站切片链接、原文出处" />
            </div>
            <div class="form-row">
              <label for="submit-name">投稿署名</label>
              <input id="submit-name" v-model="form.name" type="text" maxlength="20" placeholder="可选：匿名或昵称" />
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">提交投稿</button>
            </div>
            <p class="form-note">涉及隐私、未授权搬运或无法溯源的内容会被驳回；通过审核后才会写入时间轴并公开展示。</p>
          </form>
        </GlassCard>
      </aside>
    </div>

    <!-- 图片上传弹窗 · 复用全站胶囊弹窗视觉 -->
    <div v-if="showImageModal" class="capsule-modal" @click.self="closeImageModal">
      <div class="capsule-modal-card image-upload-modal">
        <div class="community-panel-head" style="margin-bottom: 14px">
          <div>
            <p class="community-eyebrow">IMAGE · 封面配图</p>
            <h3 class="card-title" style="margin:0">为这条足迹配一张图</h3>
          </div>
          <button type="button" class="btn btn-ghost btn-small" style="padding:6px 10px;min-width:36px" @click="closeImageModal">✕</button>
        </div>

        <p class="receipt-lead" style="margin-bottom:14px">可粘贴图片直链，或从本地选择上传。站内展示时会自动裁剪为时间轴卡片封面。</p>

        <div class="image-tabs">
          <button type="button" :class="['chip', { 'is-active': imageTab === 'url' }]" @click="imageTab = 'url'">URL 链接</button>
          <button type="button" :class="['chip', { 'is-active': imageTab === 'local' }]" @click="imageTab = 'local'">本地上传</button>
        </div>

        <div v-if="imageTab === 'url'" style="margin-top:16px">
          <div class="form-row">
            <label for="image-url-input">图片 URL</label>
            <input id="image-url-input" v-model="imageUrlInput" type="url" placeholder="https://example.com/image.jpg" maxlength="500" />
            <span class="form-note">请使用 https 可公开访问的直链，审核时会校验可访问性</span>
          </div>
          <div v-if="imageUrlInput.trim()" class="image-preview-box" style="margin-top:12px">
            <img :src="imageUrlInput.trim()" alt="URL 预览" @error="(e)=> e.target.style.display='none'" />
            <span class="form-note">若无法预览，请检查链接是否为图片直链</span>
          </div>
        </div>

        <div v-else style="margin-top:16px">
          <div class="form-row">
            <label for="image-file-input">选择本地图片</label>
            <input id="image-file-input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" @change="onFilePicked" />
            <span class="form-note">支持 JPG / PNG / WebP / GIF，单张 ≤5MB，上传后生成站内 /uploads/ 链接</span>
          </div>
          <div v-if="pendingPreview" class="image-preview-box" style="margin-top:12px">
            <img :src="pendingPreview" alt="本地预览" />
            <span class="form-note">{{ pendingFile?.name }} · {{ ((pendingFile?.size ?? 0)/1024).toFixed(1) }} KB</span>
          </div>
        </div>

        <div class="receipt-actions" style="margin-top:18px">
          <button type="button" class="btn btn-ghost" @click="closeImageModal">取消</button>
          <button v-if="imageTab === 'url'" type="button" class="btn btn-primary" @click="confirmUrl">确认使用</button>
          <button v-else type="button" class="btn btn-primary" :disabled="uploading || !pendingFile" @click="uploadLocal">{{ uploading ? '上传中…' : '上传并使用' }}</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 配图选择器：与主站 input/select/date 同款毛玻璃输入框，整块可点唤起弹窗 */
.image-picker {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(141, 159, 212, 0.16);
  background: rgba(8, 12, 22, 0.88);
  color: var(--paper);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.22s var(--ease),
    background-color 0.22s var(--ease),
    box-shadow 0.22s var(--ease),
    transform 0.22s var(--ease);
}

.image-picker:hover {
  border-color: rgba(138, 148, 255, 0.28);
  background: rgba(12, 18, 36, 0.96);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 8px 24px -18px rgba(138, 148, 255, 0.35);
  transform: translateY(-1px);
}

.image-picker:focus-visible {
  outline: none;
  border-color: rgba(138, 148, 255, 0.44);
  background: rgba(12, 18, 36, 0.98);
  box-shadow:
    0 0 0 3px rgba(138, 148, 255, 0.12),
    0 10px 28px -18px rgba(127, 226, 232, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.image-picker.is-filled {
  border-color: rgba(127, 226, 232, 0.18);
  background: linear-gradient(180deg, rgba(12, 18, 36, 0.96), rgba(8, 12, 22, 0.9));
}

.image-picker-thumb {
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(138, 148, 255, 0.16), rgba(127, 226, 232, 0.12));
  border: 1px solid rgba(141, 159, 212, 0.14);
  color: var(--ink-soft);
}

.image-picker-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-picker-thumb svg {
  opacity: 0.95;
}

.image-picker-text {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 2px;
}

.image-picker-text b {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--paper);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.35;
}

.image-picker-name {
  font-family: var(--sans);
  font-weight: 500;
  color: var(--paper-2) !important;
  font-size: 12px !important;
}

.image-picker-text small {
  font-size: 11.5px;
  line-height: 1.4;
  color: rgba(238, 244, 255, 0.56);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-picker-arrow {
  flex: none;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  color: var(--muted);
  transition: color 0.22s var(--ease), transform 0.22s var(--ease);
}

.image-picker:hover .image-picker-arrow {
  color: var(--accent-2);
}

.image-picker-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.image-picker-remove {
  border: 0;
  background: transparent;
  padding: 2px 0;
  font-size: 12.5px;
  color: var(--accent-2);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.image-picker-remove:hover {
  color: var(--paper);
}

/* 弹窗内预览复用 */
.image-preview-box {
  display: grid;
  gap: 8px;
  padding: 10px;
  border-radius: 14px;
  border: 1px solid rgba(141, 159, 212, 0.16);
  background: rgba(8, 12, 22, 0.72);
}
.image-preview-box img {
  width: 100%;
  max-height: 220px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid rgba(141, 159, 212, 0.12);
}
.image-tabs {
  display: flex;
  gap: 8px;
}
.image-upload-modal {
  width: min(560px, 100%);
}
</style>
