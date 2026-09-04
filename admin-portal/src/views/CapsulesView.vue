<script setup>
import { computed, onMounted, ref } from 'vue'
import { adminApi } from '../services/adminApi'
import { useAdminAuth } from '../composables/useAdminAuth'

const { token } = useAdminAuth()
const items = ref([])
const status = ref('')
const loading = ref(false)
const error = ref('')
const copied = ref('')
const review = ref(null)
const reviewChecked = ref(false)
const publishing = ref(false)

const now = () => Date.now()
const isDue = (item) => new Date(item.unlockAt).getTime() <= now()
const isExpired = (item) => item.status !== 'unlocked' && isDue(item)

const counts = computed(() => {
  const all = items.value.length
  const expired = items.value.filter(isExpired).length
  return { all, expired }
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    items.value = (await adminApi.capsules(token.value, status.value)).data.items ?? []
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载失败'
  } finally {
    loading.value = false
  }
}

async function unlock(id) {
  try {
    await adminApi.unlockCapsule(token.value, id)
    await load()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '解锁失败'
  }
}

async function hide(id) {
  if (!window.confirm('确定隐藏这个胶囊吗？')) return
  try {
    await adminApi.hideCapsule(token.value, id)
    await load()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '隐藏失败'
  }
}

async function copyText(text, label) {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const exec = document.execCommand.bind(document)
    exec('copy')
    document.body.removeChild(area)
  }
  copied.value = label
  window.setTimeout(() => {
    if (copied.value === label) copied.value = ''
  }, 1600)
}

async function openReview(item) {
  review.value = { item, content: '', loading: true, error: '' }
  reviewChecked.value = false
  try {
    const res = await adminApi.previewCapsule(token.value, item.id)
    review.value.content = res.data?.content ?? ''
  } catch (err) {
    review.value.error = err instanceof Error ? err.message : '解密失败'
  } finally {
    review.value.loading = false
  }
}

function closeReview() {
  if (publishing.value) return
  review.value = null
  reviewChecked.value = false
}

async function confirmPublish() {
  const current = review.value
  if (!current || publishing.value) return
  publishing.value = true
  try {
    await adminApi.publishCapsule(token.value, current.item.id)
  } catch (err) {
    current.error = err instanceof Error ? err.message : '发布失败'
    publishing.value = false
    return
  }
  review.value = null
  reviewChecked.value = false
  publishing.value = false
  await load()
}

onMounted(load)
</script>

<template>
  <section class="admin-page">
    <div class="admin-page-head">
      <h1>胶囊管理</h1>
      <div class="admin-page-tools">
        <span v-if="counts.expired" class="admin-expired-summary">{{ counts.expired }} 颗已到期待处理</span>
        <select v-model="status" @change="load">
          <option value="">全部</option>
          <option value="sealed">sealed</option>
          <option value="unlocked">unlocked</option>
          <option value="hidden">hidden</option>
        </select>
      </div>
    </div>

    <p v-if="error" class="admin-error">{{ error }}</p>
    <p v-if="loading" class="admin-hint">正在加载胶囊……</p>
    <p v-else-if="items.length === 0" class="admin-hint">当前没有胶囊。</p>

    <div v-else class="admin-list">
      <article v-for="item in items" :key="item.id" class="admin-card capsule-admin-card" :class="{ 'is-expired': isExpired(item) }">
        <header class="admin-card-head">
          <div>
            <h3 class="admin-card-title">{{ item.title || '（未命名胶囊）' }}</h3>
            <p class="admin-card-meta">埋藏于 {{ new Date(item.createdAt).toLocaleString() }} · ID {{ item.id }}</p>
          </div>
          <div class="admin-badge-group">
            <span v-if="isExpired(item)" class="admin-status admin-status-danger">已到期</span>
            <span class="admin-status">{{ item.status }}</span>
            <span v-if="item.status === 'unlocked'" class="admin-status admin-status-live">站点展示中</span>
          </div>
        </header>

        <dl class="capsule-admin-meta">
          <div><dt>邮箱</dt><dd>{{ item.email || '未填写' }}</dd></div>
          <div><dt>开启时间</dt><dd>{{ new Date(item.unlockAt).toLocaleString() }}</dd></div>
          <div><dt>到期后公开</dt><dd>{{ item.isPublicAfterUnlock ? '公开' : '不公开' }}</dd></div>
          <div><dt>密钥</dt><dd :class="{ 'no-key': !item.hasKey }">{{ item.hasKey ? '已保存' : '未保存' }}</dd></div>
        </dl>

        <div class="capsule-admin-block">
          <span class="capsule-admin-block-label">密文</span>
          <div class="capsule-admin-code">
            <code>{{ item.contentEncrypted }}</code>
            <button class="btn btn-ghost btn-small" type="button" @click="copyText(item.contentEncrypted, `cipher-${item.id}`)">
              {{ copied === `cipher-${item.id}` ? '已复制' : '复制' }}
            </button>
          </div>
        </div>

        <div class="capsule-admin-block" :class="{ 'is-empty': !item.hasKey }">
          <span class="capsule-admin-block-label">密钥</span>
          <div class="capsule-admin-code">
            <code v-if="item.hasKey">{{ item.key }}</code>
            <code v-else>该胶囊未保存密钥，无法解密其内容。</code>
            <button v-if="item.hasKey" class="btn btn-ghost btn-small" type="button" @click="copyText(item.key, `key-${item.id}`)">
              {{ copied === `key-${item.id}` ? '已复制' : '复制' }}
            </button>
          </div>
        </div>

        <div class="admin-actions">
          <button
            v-if="item.hasKey"
            class="btn btn-primary"
            type="button"
            :disabled="!isDue(item)"
            :title="isDue(item) ? '解密内容供站长审核后展示到网站' : '开启时间到达后才可公开展示'"
            @click="openReview(item)"
          >
            展示到网站
          </button>
          <button v-if="item.status !== 'unlocked'" class="btn btn-ghost" type="button" :title="'解锁后以卡片展示在主站，内容在开启时间到达后展示'" @click="unlock(item.id)">手动解锁</button>
          <button class="btn btn-ghost" type="button" @click="hide(item.id)">隐藏</button>
        </div>
      </article>
    </div>

    <div v-if="review" class="admin-modal" role="dialog" aria-modal="true">
      <div class="admin-modal-card">
        <h3>展示到网站 · 站长审核</h3>
        <p class="admin-modal-sub">《{{ review.item.title }}》 · 开启时间 {{ new Date(review.item.unlockAt).toLocaleString() }} · 用户设定：到期后{{ review.item.isPublicAfterUnlock ? '公开' : '不公开' }}</p>

        <p v-if="review.loading" class="admin-hint">正在解密内容供审核……</p>
        <template v-else>
          <p v-if="review.error" class="admin-error">{{ review.error }}</p>
          <div v-else class="capsule-review-content">
            <p v-if="review.content.trim()" class="admin-card-body">{{ review.content }}</p>
            <p v-else class="admin-card-meta">（内容为空）</p>
          </div>
        </template>

        <label v-if="!review.loading && !review.error" class="admin-check">
          <input v-model="reviewChecked" type="checkbox" />
          我已审核以上内容，确认将其公开展示到网站
        </label>

        <div class="admin-actions">
          <button class="btn btn-ghost" type="button" :disabled="publishing" @click="closeReview">取消</button>
          <button class="btn btn-primary" type="button" :disabled="!reviewChecked || publishing || review.loading || !!review.error" @click="confirmPublish">
            {{ publishing ? '正在发布…' : '确认展示' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
