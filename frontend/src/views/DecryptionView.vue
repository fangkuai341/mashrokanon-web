<script setup>
import { ref } from 'vue'
import { api } from '../services/api'

defineProps({
  showToast: { type: Function, default: () => {} },
})

const input = ref('')
const key = ref('')
const loading = ref(false)
const error = ref('')
const result = ref(null)
const showKeyField = ref(false)

async function submit() {
  error.value = ''
  result.value = null
  loading.value = true
  try {
    const res = await api.decryption({ input: input.value, key: key.value })
    result.value = res.data
    showKeyField.value = Boolean(res.data?.needsKey)
    if (res.data?.content) key.value = ''
  } catch (err) {
    const message = err instanceof Error ? err.message : '解密失败'
    if (/密钥|KEY|解密/i.test(message)) {
      showKeyField.value = true
    }
    error.value = message
  } finally {
    loading.value = false
  }
}

function clearAll() {
  input.value = ''
  key.value = ''
  error.value = ''
  result.value = null
  showKeyField.value = false
}
</script>

<template>
  <section class="page page-decryption is-active">
    <header class="page-head reveal is-visible">
      <p class="page-kicker">DECRYPTION</p>
      <h2>解密胶囊</h2>
      <p class="page-desc">输入胶囊 ID 或密文。若站点已保存密钥，会直接解密到页面；否则先输入你保存的密钥再继续。</p>
    </header>

    <div class="decryption-layout">
      <article class="card reveal is-visible">
        <h3 class="card-title">输入内容</h3>
        <form class="decryption-form" @submit.prevent="submit">
          <div class="form-row">
            <label for="decrypt-input">胶囊 ID 或密文</label>
            <textarea id="decrypt-input" v-model="input" rows="6" placeholder="输入胶囊 ID，或直接粘贴密文"></textarea>
          </div>

          <div v-if="showKeyField || result?.needsKey" class="form-row">
            <label for="decrypt-key">密钥</label>
            <input id="decrypt-key" v-model="key" type="text" placeholder="如果站点没有保存密钥，请输入你自己保存的密钥" />
          </div>

          <div class="form-actions">
            <button class="btn btn-primary" type="submit" :disabled="loading">{{ loading ? '正在解密…' : '开始解密' }}</button>
            <button class="btn btn-ghost" type="button" @click="clearAll">清空</button>
          </div>
        </form>

        <p class="form-note">如果输入的是密文，系统会先尝试定位对应胶囊；如果无法定位，将按密文直接尝试解密。</p>
        <p v-if="error" class="admin-error">{{ error }}</p>
      </article>

      <article class="card reveal is-visible">
        <h3 class="card-title">解密结果</h3>
        <div v-if="result?.content" class="decryption-result">
          <p class="decryption-meta">ID：<code>{{ result.id }}</code></p>
          <p class="decryption-meta">{{ result.hasKey ? '站点已保存密钥，已自动解密。' : '已用你提供的密钥解密。' }}</p>
          <pre class="decryption-output">{{ result.content }}</pre>
        </div>
        <div v-else class="decryption-empty">
          <p>还没有结果。输入胶囊 ID 或密文后点击「开始解密」。</p>
          <p v-if="result?.needsKey">该胶囊没有保存在本站的密钥，请输入你保存的密钥后再试。</p>
        </div>
      </article>
    </div>
  </section>
</template>