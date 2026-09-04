import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', component: () => import('./views/LoginView.vue') },
  {
    path: '/',
    component: () => import('./layouts/AdminLayout.vue'),
    children: [
      { path: 'dashboard', component: () => import('./views/DashboardView.vue') },
      { path: 'letters', component: () => import('./views/LettersView.vue') },
      { path: 'submissions', component: () => import('./views/SubmissionsView.vue') },
      { path: 'timeline', component: () => import('./views/TimelineView.vue') },
      { path: 'settings', component: () => import('./views/SettingsView.vue') },
      { path: 'capsules', component: () => import('./views/CapsulesView.vue') },
      { path: 'audit', component: () => import('./views/AuditLogsView.vue') },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const token = localStorage.getItem('forest.admin.token')
  if (!token && to.path !== '/login') return '/login'
  if (token && to.path === '/login') return '/dashboard'
  return true
})

createApp(App).use(router).mount('#app')