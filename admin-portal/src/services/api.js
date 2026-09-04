const API_BASE = import.meta.env.VITE_API_BASE ?? ''

export async function requestJson(path, options = {}) {
  const { headers, body, ...rest } = options
  const hasBody = body !== undefined && body !== null && body !== ''
  const requestHeaders = {
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    ...(headers ?? {}),
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    body,
    headers: requestHeaders,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error?.message ?? '请求失败')
  return payload
}
