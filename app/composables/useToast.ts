interface Toast { id: string; message: string; type: 'default'|'success'|'error'|'warning'; }
const toasts = ref<Toast[]>([])

export function useToast() {
  function show(message: string, type: Toast['type'] = 'default', ms = 3600) {
    const id = Math.random().toString(36).slice(2)
    toasts.value.push({ id, message, type })
    setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, ms)
  }
  const success = (m: string) => show(m, 'success')
  const error   = (m: string) => show(m, 'error')
  const warning = (m: string) => show(m, 'warning')
  const remove  = (id: string) => { toasts.value = toasts.value.filter(t => t.id !== id) }
  return { toasts, show, success, error, warning, remove }
}
