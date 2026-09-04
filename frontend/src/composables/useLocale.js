import { computed, onMounted, ref } from 'vue'
import { messages } from '../data/i18n'

export function useLocale(storageKey = 'baiocai.lang') {
  const lang = ref('zh')

  onMounted(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved === 'zh' || saved === 'ja') lang.value = saved
    } catch {
      // ignore
    }
  })

  function setLang(next) {
    lang.value = next
    try {
      localStorage.setItem(storageKey, next)
    } catch {
      // ignore
    }
  }

  const copy = computed(() => messages[lang.value] || messages.zh)

  return { lang, copy, setLang }
}
