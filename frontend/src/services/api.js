const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001'

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

export const api = {
  requestJson,
  listLetters(params = {}) {
    const query = new URLSearchParams(params).toString()
    return requestJson(`/api/memory-letters${query ? `?${query}` : ''}`)
  },
  createLetter(data) {
    return requestJson('/api/memory-letters', { method: 'POST', body: JSON.stringify(data) })
  },
  lightLetter(id) {
    return requestJson(`/api/memory-letters/${id}/light`, { method: 'POST' })
  },
  listCapsules() {
    return requestJson('/api/capsules')
  },
  createCapsule(data) {
    return requestJson('/api/capsules', { method: 'POST', body: JSON.stringify(data) })
  },
  decryption(data) {
    return requestJson('/api/decryption', { method: 'POST', body: JSON.stringify(data) })
  },
}
