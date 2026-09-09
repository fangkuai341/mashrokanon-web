<script setup>
import { onMounted, ref } from 'vue'
import CapsuleCard from '../components/CapsuleCard.vue'
import { api } from '../services/api'
import { encryptCapsuleText, generateCapsuleKey } from '../lib/capsuleCrypto'

const props = defineProps({
  copy: { type: Object, required: true },
  showToast: { type: Function, required: true },
})

const title = ref('')
const content = ref('')
const unlock = ref('2027-05-01')
const saveKey = ref('no')
const publishContent = ref('no')
const mail = ref('')
const capsules = ref([])
const loading = ref(false)
const submitting = ref(false)
const receipt = ref(null)
const copied = ref('')

async function loadCapsules() {
  loading.value = true
  try {
    const res = await api.listCapsules()
    capsules.value = res.data?.items ?? []
  } catch (error) {
    props.showToast(error instanceof Error ? error.message : '读取胶囊失败', 'error')
  } finally {
    loading.value = false
  }
}

async function submitCapsule() {
  if (!title.value.trim() || !content.value.trim()) {
    props.showToast('请填写标题与信的内容。', 'error')
    return
  }
  if (submitting.value) return
  submitting.value = true

  try {
    // 在浏览器里为这封信生成一把随机的钥匙并加密，密文与密钥在传给森林前就已生成。
    const key = await generateCapsuleKey()
    const cipher = await encryptCapsuleText(content.value.trim(), key)
    const keepKey = saveKey.value === 'yes'

    const res = await api.createCapsule({
      title: title.value.trim(),
      contentEncrypted: cipher,
      key: keepKey ? key : undefined,
      unlockAt: new Date(`${unlock.value}T00:00:00.000Z`).toISOString(),
      email: mail.value.trim(),
      isPublicAfterUnlock: keepKey && publishContent.value === 'yes',
    })

    receipt.value = {
      id: res.data?.id ?? '',
      cipher,
      key,
      keyStored: keepKey,
      publicAfterUnlock: keepKey && publishContent.value === 'yes',
    }
  } catch (error) {
    props.showToast(error instanceof Error ? error.message : '创建失败', 'error')
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  title.value = ''
  content.value = ''
  unlock.value = '2027-05-01'
  saveKey.value = 'no'
  publishContent.value = 'no'
  mail.value = ''
}

function closeReceipt() {
  receipt.value = null
  copied.value = ''
  resetForm()
  props.showToast('胶囊已埋进森林，请一定保存好刚才的密钥。约定之日再见。')
  loadCapsules()
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

function copyReceiptAll() {
  const { id, cipher, key } = receipt.value ?? {}
  copyText(
    `【时光胶囊 · 密钥凭证】\n胶囊编号 ID：${id}\n密文：${cipher}\n密钥：${key}\n\n请在开启之日凭编号与密钥读取这封信。`,
    'all',
  )
}

onMounted(loadCapsules)
</script>

<template>
  <section class="page page-capsule is-active">
    <header class="page-head">
      <p class="page-kicker">TIME CAPSULE · A LETTER TO THE FUTURE</p>
      <h2>时光胶囊</h2>
      <p class="page-desc">写给未来的一封信。把它埋在森林里，等到约定之日，再回来开启。</p>
    </header>

    <div class="capsule-layout">
      <div class="capsule-form card reveal is-visible">
        <h3 class="card-title">埋下一颗胶囊</h3>
        <form @submit.prevent="submitCapsule">
          <div class="form-row">
            <label for="cp-title">标题(会展示在胶囊列表中)</label>
            <input id="cp-title" v-model="title" type="text" maxlength="30" placeholder="致未来的自己" />
          </div>
          <div class="form-row">
            <label for="cp-text">信的内容</label>
            <textarea id="cp-text" v-model="content" rows="5" maxlength="1000" placeholder="写下此刻想对未来的自己、或对森林说的话……"></textarea>
          </div>
          <div class="form-row">
            <label for="cp-unlock">开启时间(会展示在胶囊列表中)</label>
            <select id="cp-unlock" v-model="unlock">
              <option value="2027-05-01">2027-05-01 · 毕业一周年</option>
              <option value="2029-05-01">2029-05-01 · 三年之约</option>
              <option value="2031-05-01">2031-05-01 · 五年之约</option>
            </select>
          </div>
          <div class="form-row">
            <label for="cp-mail">邮箱（可选，用于开启提醒）</label>
            <input id="cp-mail" v-model="mail" type="email" maxlength="64" placeholder="you@example.com" />
          </div>
          <div class="form-row">
            <label for="cp-save-key">是否本网站保存密钥（密钥用来解密胶囊内容）</label>
            <select id="cp-save-key" v-model="saveKey" :disabled="submitting">
              <option value="yes">是</option>
              <option value="no">否</option>
            </select>
          </div>
          <div class="form-row">
            <label for="cp-publish-content">到期后是否公开胶囊内容（仅限保存密钥时可选择）</label>
            <select id="cp-publish-content" v-model="publishContent" :disabled="saveKey !== 'yes' || submitting">
              <option value="yes">公开</option>
              <option value="no">不公开</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              {{ submitting ? '正在加密并埋进森林…' : '埋进森林' }}
            </button>
          </div>
          <p class="form-note">信的内容会在你的浏览器里加密后再送出，未到开启时间连森林也读不到。开启后可选是否公开展示。</p>
        </form>
      </div>

      <div class="capsule-guide card reveal is-visible">
        <h3 class="card-title">约定与规则</h3>
        <ul class="guide-list">
          <li>默认在 2027 年 5 月 1 日 · 毕业一周年时开启；</li>
          <li>未到开启时间，任何人都看不到信的内容；</li>
          <li>留下邮箱，开启当天森林会寄来提醒；</li>
          <li>每一封信都有一把专属密钥——请把弹窗里的「胶囊编号 + 密钥」一并保存好，它既是凭证，也是打开未来的钥匙。</li>
          <li>如果选择不保存密钥，请务必妥善保存「胶囊编号」与「密钥」。到期开启时必须凭密钥解锁，密钥遗失将永远无法读回这封信。</li>
        </ul>
      </div>
    </div>

    <p v-if="loading" class="sub-title">正在从森林深处取回胶囊……</p>

    <h3 class="sub-title reveal is-visible">埋下的胶囊</h3>
    <div class="capsules">
      <CapsuleCard v-for="capsule in capsules" :key="capsule.id" :capsule="{
        title: capsule.title,
        buried: new Date(capsule.createdAt ?? capsule.unlockAt).toISOString().slice(0, 10),
        unlock: new Date(capsule.unlockAt).toISOString().slice(0, 10),
        public: capsule.isPublicAfterUnlock,
        content: capsule.content ?? '',
        demo: false,
      }" />
    </div>

    <div v-if="receipt" class="capsule-modal" role="dialog" aria-modal="true" aria-labelledby="capsule-receipt-title">
      <div class="capsule-modal-card">
        <h3 id="capsule-receipt-title" class="card-title">胶囊已埋好 · 请收好这把钥匙</h3>
        <p class="receipt-lead">森林已为这封信上了锁。下面的「胶囊编号」与「密钥」是开启它的唯一凭证，建议立即复制、保存到安全的地方。</p>

        <div class="receipt-row">
          <span class="receipt-label">胶囊编号 ID</span>
          <div class="receipt-value">
            <code>{{ receipt.id }}</code>
            <button class="btn btn-ghost btn-small" type="button" @click="copyText(receipt.id, 'id')">
              {{ copied === 'id' ? '已复制' : '复制' }}
            </button>
          </div>
        </div>

        <div class="receipt-row">
          <span class="receipt-label">密文</span>
          <div class="receipt-value">
            <code class="receipt-long">{{ receipt.cipher }}</code>
            <button class="btn btn-ghost btn-small" type="button" @click="copyText(receipt.cipher, 'cipher')">
              {{ copied === 'cipher' ? '已复制' : '复制' }}
            </button>
          </div>
        </div>

        <div class="receipt-row">
          <span class="receipt-label">密钥</span>
          <div class="receipt-value">
            <code class="receipt-long">{{ receipt.key }}</code>
            <button class="btn btn-ghost btn-small" type="button" @click="copyText(receipt.key, 'key')">
              {{ copied === 'key' ? '已复制' : '复制' }}
            </button>
          </div>
        </div>

        <p class="receipt-note" :class="{ warn: !receipt.keyStored }">
          <template v-if="receipt.keyStored">
            网站已代为保存密钥，到期后森林可为你解密内容；此胶囊到期后{{ receipt.publicAfterUnlock ? '将公开展示' : '保持私密' }}。
            仍建议保存下方密钥作为备用。
          </template>
          <template v-else>
            你选择不把密钥交给网站：请务必妥善保存「胶囊编号」与「密钥」。到期开启时必须凭密钥解锁，密钥遗失将永远无法读回这封信。
          </template>
        </p>

        <div class="receipt-actions">
          <button class="btn btn-primary" type="button" @click="copyReceiptAll">
            {{ copied === 'all' ? '已复制全部凭证' : '一键复制全部凭证' }}
          </button>
          <button class="btn btn-ghost" type="button" @click="closeReceipt">我已保存并关闭</button>
        </div>
      </div>
    </div>
  </section>
</template>
