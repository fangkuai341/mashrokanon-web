<script setup>
import { onMounted, ref } from 'vue'
import { adminApi } from '../services/adminApi'
import { useAdminAuth } from '../composables/useAdminAuth'

const { token } = useAdminAuth()
const items = ref([])
const loading = ref(false)
const status = ref('pending')
const expanded = ref(null)

async function load() {
  loading.value = true
  try { items.value = (await adminApi.memoryLetters(token.value, status.value)).data.items ?? [] } finally { loading.value = false }
}
async function approve(id) { await adminApi.approveMemoryLetter(token.value, id); await load() }
async function reject(id) { const reason = window.prompt('驳回原因') ?? ''; if (reason.trim()) { await adminApi.rejectMemoryLetter(token.value, id, reason.trim()); await load() } }
async function hide(id) { if (window.confirm('确定下架这条留言吗？')) { await adminApi.hideMemoryLetter(token.value, id); await load() } }
function toggle(id) { expanded.value = expanded.value === id ? null : id }
onMounted(load)
</script>

<template>
  <section class="admin-page">
    <div class="admin-page-head">
      <h1>留言审核</h1>
      <select v-model="status" @change="load">
        <option value="pending">待审核</option>
        <option value="approved">已通过</option>
        <option value="rejected">已拒绝</option>
        <option value="hidden">已下架</option>
      </select>
    </div>
    <p v-if="loading" class="admin-hint">正在加载留言……</p>
    <p v-else-if="items.length === 0" class="admin-hint">当前没有留言。</p>
    <div v-else class="admin-list">
      <article v-for="item in items" :key="item.id" class="admin-card" :class="{ 'is-open': expanded === item.id }">
        <header class="admin-card-head" @click="toggle(item.id)">
          <div>
            <h3 class="admin-card-title">{{ item.nickname }} <span v-if="item.isAnonymous" class="admin-tag">匿名</span></h3>
            <p class="admin-card-meta">{{ item.tag }} · {{ new Date(item.createdAt).toLocaleString() }} · 点赞 {{ item.lightsCount }}</p>
          </div>
          <span class="admin-status">{{ item.status }}</span>
        </header>
        <template v-if="expanded === item.id">
          <p class="admin-card-body">{{ item.content }}</p>
          <p v-if="item.auditReason" class="admin-card-meta">驳回原因：{{ item.auditReason }}</p>
          <div class="admin-actions">
            <template v-if="item.status === 'pending'"><button class="btn btn-primary" type="button" @click="approve(item.id)">通过</button><button class="btn btn-ghost" type="button" @click="reject(item.id)">驳回</button></template>
            <button v-else class="btn btn-ghost" type="button" @click="hide(item.id)">下架</button>
          </div>
        </template>
      </article>
    </div>
  </section>
</template>