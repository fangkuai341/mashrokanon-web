import { computed, ref } from 'vue'

const STORAGE_KEY = 'forest.admin.token'
const token = ref(localStorage.getItem(STORAGE_KEY) ?? '')

export function useAdminAuth() {
  const isLoggedIn = computed(() => Boolean(token.value))

  function setToken(next) {
    token.value = next
    localStorage.setItem(STORAGE_KEY, next)
  }

  function clearToken() {
    token.value = ''
    localStorage.removeItem(STORAGE_KEY)
  }

  return { token, isLoggedIn, setToken, clearToken }
}