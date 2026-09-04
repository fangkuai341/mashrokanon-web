import test from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../src/app.js'
import { signAdminToken } from '../src/lib/jwt.js'

test('timeline endpoints support create update delete', async (t) => {
  const app = createApp()
  t.after(() => app.close())

  const token = signAdminToken({ id: 'test-admin', username: 'admin', role: 'super_admin', nickname: '测试管理员' })
  const headers = { authorization: `Bearer ${token}` }

  const uniqueTitle = `测试事件-${Date.now()}`
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/admin/timeline-events',
    headers,
    payload: {
      date: '2099-06-01',
      title: uniqueTitle,
      zh: '中文内容',
      ja: '日本語内容',
      tags: ['测试'],
      featured: false,
    },
  })

  assert.equal(createRes.statusCode, 201)
  const created = createRes.json().data

  const updateRes = await app.inject({
    method: 'PATCH',
    url: `/api/admin/timeline-events/${created.id}`,
    headers,
    payload: { title: '测试事件更新' },
  })
  assert.equal(updateRes.statusCode, 200)
  assert.equal(updateRes.json().data.title, '测试事件更新')

  const deleteRes = await app.inject({
    method: 'DELETE',
    url: `/api/admin/timeline-events/${created.id}`,
    headers,
  })
  assert.equal(deleteRes.statusCode, 200)
})
