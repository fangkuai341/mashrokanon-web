import test from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'
import { signAdminToken } from '../src/lib/jwt.js'

async function adminToken() {
  let admin = await prisma.adminUser.findFirst()
  let created = false
  if (!admin) {
    admin = await prisma.adminUser.create({
      data: { username: `test-admin-${Date.now()}`, passwordHash: 'unused', nickname: '测试管理员', role: 'super_admin' },
    })
    created = true
  }
  const token = signAdminToken({ id: admin.id, username: admin.username, role: admin.role, nickname: admin.nickname })
  return { token, cleanup: created ? () => prisma.adminUser.delete({ where: { id: admin.id } }) : async () => {} }
}

test('submissions are stored as pending timeline proposals and rank is aggregated from approvals', async (t) => {
  const app = createApp()
  t.after(() => app.close())

  const submissionRes = await app.inject({
    method: 'POST',
    url: '/api/submissions',
    payload: {
      date: '2021-06-01',
      title: `补充测试-${Date.now()}`,
      zh: '这是一个测试投稿',
      ja: 'テスト投稿です',
      tags: ['测试', '补档'],
      source: 'https://example.com',
      name: '测试者',
    },
  })

  assert.equal(submissionRes.statusCode, 201)
  assert.equal(submissionRes.json().data.status, 'pending')
  assert.equal(submissionRes.json().data.tagsJson[0], '测试')

  const rankRes = await app.inject({ method: 'GET', url: '/api/rank' })
  assert.equal(rankRes.statusCode, 200)
  assert(Array.isArray(rankRes.json().data.items))
})

test('approving a submission writes it into the timeline archive and prevents double review', async (t) => {
  const app = createApp()
  t.after(() => app.close())
  const { token, cleanup } = await adminToken()
  t.after(cleanup)

  const headers = { authorization: `Bearer ${token}` }
  const uniqueTitle = `审核入库测试-${Date.now()}`
  const created = await app.inject({
    method: 'POST',
    url: '/api/submissions',
    payload: {
      date: '2099-09-09',
      title: uniqueTitle,
      zh: '审核通过后应进入时间轴',
      ja: '',
      tags: ['测试'],
      source: 'https://example.com/source',
      name: '审核测试者',
    },
  })
  assert.equal(created.statusCode, 201)
  const submissionId = created.json().data.id

  const approved = await app.inject({
    method: 'POST',
    url: `/api/admin/submissions/${submissionId}/approve`,
    headers,
  })
  assert.equal(approved.statusCode, 200)
  assert.equal(approved.json().data.submission.status, 'approved')

  const timeline = await app.inject({ method: 'GET', url: '/api/timeline?year=2099' })
  const events = timeline.json().data.items
  const archived = events.find((item) => item.title === uniqueTitle)
  assert.ok(archived, 'approved submission should appear in the public timeline')
  assert.equal(archived.link, 'https://example.com/source')
  assert.deepEqual(archived.tags, ['测试'])

  const duplicate = await app.inject({
    method: 'POST',
    url: `/api/admin/submissions/${submissionId}/approve`,
    headers,
  })
  assert.equal(duplicate.statusCode, 400, 'already reviewed submissions cannot be approved twice')

  const remove = await app.inject({
    method: 'DELETE',
    url: `/api/admin/timeline-events/${archived.id}`,
    headers,
  })
  assert.equal(remove.statusCode, 200)
})