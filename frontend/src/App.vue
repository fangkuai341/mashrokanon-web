<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import SiteHeader from './components/SiteHeader.vue'
import SkyBackground from './components/SkyBackground.vue'
import { messages } from './data/i18n'
import { useAppToast } from './composables/useAppToast'

const route = useRoute()
const router = useRouter()
const lang = ref('zh')
const { toast, showToast } = useAppToast()

const current = computed(() => messages[lang.value])
const activeNav = computed(() => route.path.replace('/', '') || 'home')

const stats = computed(() => [
  { value: '2019–2026', label: current.value.st1 },
  { value: '216万+', label: current.value.st2 },
  { value: '60+', label: current.value.st3 },
  { value: '100+', label: current.value.st4 },
])

const entries = computed(() => [
  {
    to: '/timeline',
    title: current.value.ent_tl_t,
    desc: current.value.ent_tl_d,
    icon: 'timeline',
  },
  {
    to: '/memory',
    title: current.value.ent_mw_t,
    desc: current.value.ent_mw_d,
    icon: 'memory',
  },
  {
    to: '/capsule',
    title: current.value.ent_cp_t,
    desc: current.value.ent_cp_d,
    icon: 'capsule',
  },
  {
    to: '/rank',
    title: current.value.ent_rank_t,
    desc: current.value.ent_rank_d,
    icon: 'rank',
  },
])

const navItems = computed(() => [
  { to: '/home', label: current.value.nav_home },
  { to: '/timeline', label: current.value.nav_timeline },
  { to: '/memory', label: current.value.nav_memory },
  { to: '/capsule', label: current.value.nav_capsule },
  { to: '/rank', label: current.value.nav_rank },
  { to: '/decryption', label: current.value.nav_decryption },
  { to: '/about', label: current.value.nav_about },
])

function setLanguage(next) {
  lang.value = next
  try {
    localStorage.setItem('baiocai.lang', next)
  } catch {
    // ignore
  }
}

function navigateHome() {
  router.push('/home')
}

onMounted(() => {
  try {
    const saved = localStorage.getItem('baiocai.lang')
    if (saved === 'ja' || saved === 'zh') lang.value = saved
  } catch {
    // ignore
  }
})

watch(route, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>

<template>
  <div class="app-shell">
    <SkyBackground />

    <SiteHeader
      :copy="current"
      :lang="lang"
      :nav-items="navItems"
      @set-language="setLanguage"
      @go-home="navigateHome"
    />

    <main class="main-content">
      <RouterView v-slot="{ Component }">
        <Transition name="page-fade" mode="out-in">
          <component :is="Component" :lang="lang" :copy="current" :show-toast="showToast" :stats="stats" :entries="entries" />
        </Transition>
      </RouterView>
    </main>

    <footer class="site-footer">
      <p>{{ current.footer1 }}</p>
      <p>白菜的森林 · love-kanon.com <span aria-hidden="true">✦</span> {{ current.footer2 }}</p>
      <p>{{ current.footer3 }}</p>
    </footer>

    <div :class="['toast', { show: toast.show, 'is-err': toast.type === 'error' }]" role="status" aria-live="polite">
      {{ toast.text }}
    </div>
  </div>
</template>
