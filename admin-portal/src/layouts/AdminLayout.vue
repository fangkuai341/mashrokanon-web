<script setup>
import { useRouter } from 'vue-router'
import { useAdminAuth } from '../composables/useAdminAuth'

const router = useRouter()
const { clearToken } = useAdminAuth()

function logout() {
  clearToken()
  router.push('/login')
}
</script>

<template>
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <h2>森林后台</h2>
      <nav>
        <router-link to="/dashboard">数据总览</router-link>
        <router-link to="/letters">留言审核</router-link>
        <router-link to="/submissions">投稿审核</router-link>
        <router-link to="/timeline">时间轴管理</router-link>
        <router-link to="/settings">站点设置</router-link>
        <router-link to="/capsules">胶囊管理</router-link>
        <router-link to="/audit">审计日志</router-link>
      </nav>
      <button class="btn btn-ghost" type="button" @click="logout">退出登录</button>
    </aside>
    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>