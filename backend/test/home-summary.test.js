import test from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../src/app.js'
import { signAdminToken } from '../src/lib/jwt.js'

test('home summary includes database-backed contribution stats', async (t) => {
  const app = createApp()
  t.after(() => app.close())

  const res = await app.inject({ method: 'GET', url: '/api/home/summary' })
  assert.equal(res.statusCode, 200)

  const body = res.json()
  const labels = body.data.stats.map((item) => item.label)

  assert(labels.includes('共建投稿'))
})

test('home summary exposes countdown configured via site settings', async (t) => {
  const app = createApp()
  t.after(() => app.close())

  const header = { authorization: `Bearer ${signAdminToken({ id: 'test-admin', username: 'admin', role: 'super_admin', nickname: '测试管理员' })}` }

  const putRes = await app.inject({
    method: 'PUT',
    url: '/api/admin/site-settings',
    headers: header,
    payload: { countdown: { labelZh: '生日倒计时', labelJa: '誕生日カウントダウン', date: '2029-06-01' } },
  })
  assert.equal(putRes.statusCode, 200)

  const summaryRes = await app.inject({ method: 'GET', url: '/api/home/summary' })
  assert.equal(summaryRes.statusCode, 200)
  const { countdown } = summaryRes.json().data
  assert.equal(countdown.labelZh, '生日倒计时')
  assert.equal(countdown.labelJa, '誕生日カウントダウン')
  assert.equal(countdown.date, '2029-06-01')
  assert.equal(typeof countdown.days, 'number')

  const getRes = await app.inject({ method: 'GET', url: '/api/admin/site-settings', headers: header })
  assert.equal(getRes.statusCode, 200)
  assert.equal(getRes.json().data.countdown.date, '2029-06-01')
})
