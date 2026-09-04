import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', component: () => import('./views/HomeView.vue') },
  { path: '/timeline', component: () => import('./views/TimelineView.vue') },
  { path: '/memory', component: () => import('./views/MemoryView.vue') },
  { path: '/capsule', component: () => import('./views/CapsuleView.vue') },
  { path: '/rank', component: () => import('./views/RankView.vue') },
  { path: '/decryption', alias: ['/Decryption'], component: () => import('./views/DecryptionView.vue') },
  { path: '/about', component: () => import('./views/AboutView.vue') },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  if (!to.path.startsWith('/admin')) return true
  const token = localStorage.getItem('forest.admin.token')
  if (!token && to.path !== '/admin/login') return '/admin/login'
  if (token && to.path === '/admin/login') return '/admin/dashboard'
  return true
})

createApp(App).use(router).mount('#app')
