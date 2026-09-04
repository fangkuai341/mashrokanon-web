import { onBeforeUnmount, ref } from 'vue'

export function useAppToast() {
  const toast = ref({ show: false, text: '', type: 'success' })
  let timer = null

  function showToast(text, type = 'success') {
    toast.value = { show: true, text, type }
    clearTimeout(timer)
    timer = setTimeout(() => {
      toast.value.show = false
    }, 2400)
  }

  onBeforeUnmount(() => {
    clearTimeout(timer)
  })

  return { toast, showToast }
}
