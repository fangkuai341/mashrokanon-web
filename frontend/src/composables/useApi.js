import { ref } from 'vue'
import { api } from '../services/api'

export function useApiList(loader) {
  const items = ref([])
  const loading = ref(false)
  const error = ref('')

  async function load(...args) {
    loading.value = true
    error.value = ''
    try {
      const result = await loader(...args)
      items.value = result.data?.items ?? []
    } catch (err) {
      error.value = err instanceof Error ? err.message : '请求失败'
    } finally {
      loading.value = false
    }
  }

  return { items, loading, error, load }
}

export { api }
