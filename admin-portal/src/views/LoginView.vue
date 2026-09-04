<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { adminApi } from '../services/adminApi'
import { useAdminAuth } from '../composables/useAdminAuth'

const router = useRouter()
const { setToken } = useAdminAuth()
const username = ref('admin')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  try {
    const res = await adminApi.login({ username: username.value, password: password.value })
    setToken(res.data.token)
    await router.push('/dashboard')
  } catch (err) {
    error.value = err instanceof Error ? err.message : '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="admin-auth">
    <div class="admin-auth-card">
      <p class="admin-eyebrow">ADMIN PORTAL</p>
      <h1>森林后台</h1>
      <p class="admin-desc">管理留言、投稿、时间轴、胶囊和审计记录。</p>
      <form class="admin-form" @submit.prevent="submit">
        <label><span>账号</span><input v-model="username" type="text" autocomplete="username" required /></label>
        <label><span>密码</span><input v-model="password" type="password" autocomplete="current-password" required /></label>
        <p v-if="error" class="admin-error">{{ error }}</p>
        <button class="btn btn-primary" type="submit" :disabled="loading">{{ loading ? '登录中…' : '进入后台' }}</button>
      </form>
    </div>
  </section>
</template>
