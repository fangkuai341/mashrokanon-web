import { requestJson } from './api'

function auth(token) {
  return { Authorization: `Bearer ${token}` }
}

export const adminApi = {
  login(payload) {
    return requestJson('/api/admin/login', { method: 'POST', body: JSON.stringify(payload) })
  },
  dashboard(token) {
    return requestJson('/api/admin/dashboard', { headers: auth(token) })
  },
  auditLogs(token, limit = 100) {
    return requestJson(`/api/admin/audit-logs?limit=${limit}`, { headers: auth(token) })
  },
  memoryLetters(token, status = 'pending') {
    return requestJson(`/api/admin/memory-letters?status=${status}`, { headers: auth(token) })
  },
  approveMemoryLetter(token, id) {
    return requestJson(`/api/admin/memory-letters/${id}/approve`, { method: 'POST', headers: auth(token) })
  },
  rejectMemoryLetter(token, id, reason) {
    return requestJson(`/api/admin/memory-letters/${id}/reject`, { method: 'POST', headers: auth(token), body: JSON.stringify({ reason }) })
  },
  hideMemoryLetter(token, id) {
    return requestJson(`/api/admin/memory-letters/${id}/hide`, { method: 'POST', headers: auth(token) })
  },
  submissions(token, status = 'pending') {
    return requestJson(`/api/admin/submissions?status=${status}`, { headers: auth(token) })
  },
  approveSubmission(token, id) {
    return requestJson(`/api/admin/submissions/${id}/approve`, { method: 'POST', headers: auth(token) })
  },
  rejectSubmission(token, id, reason) {
    return requestJson(`/api/admin/submissions/${id}/reject`, { method: 'POST', headers: auth(token), body: JSON.stringify({ reason }) })
  },
  timeline(token) {
    return requestJson('/api/timeline', { headers: auth(token) })
  },
  getSettings(token) {
    return requestJson('/api/admin/site-settings', { headers: auth(token) })
  },
  updateSettings(token, payload) {
    return requestJson('/api/admin/site-settings', { method: 'PUT', headers: auth(token), body: JSON.stringify(payload) })
  },
  createTimeline(token, payload) {
    return requestJson('/api/admin/timeline-events', { method: 'POST', headers: auth(token), body: JSON.stringify(payload) })
  },
  updateTimeline(token, id, payload) {
    return requestJson(`/api/admin/timeline-events/${id}`, { method: 'PATCH', headers: auth(token), body: JSON.stringify(payload) })
  },
  deleteTimeline(token, id) {
    return requestJson(`/api/admin/timeline-events/${id}`, { method: 'DELETE', headers: auth(token) })
  },
  capsules(token, status = '') {
    const query = status ? `?status=${status}` : ''
    return requestJson(`/api/admin/capsules${query}`, { headers: auth(token) })
  },
  previewCapsule(token, id) {
    return requestJson(`/api/admin/capsules/${id}/preview`, { method: 'POST', headers: auth(token) })
  },
  publishCapsule(token, id) {
    return requestJson(`/api/admin/capsules/${id}/publish`, { method: 'POST', headers: auth(token) })
  },
  hideCapsule(token, id) {
    return requestJson(`/api/admin/capsules/${id}/hide`, { method: 'POST', headers: auth(token) })
  },
  unlockCapsule(token, id) {
    return requestJson(`/api/admin/capsules/${id}/unlock`, { method: 'POST', headers: auth(token) })
  },
}