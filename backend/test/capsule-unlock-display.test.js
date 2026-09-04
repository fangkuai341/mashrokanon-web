import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { createApp } from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'
import { signAdminToken } from '../src/lib/jwt.js'

// Replicates the client-side payload layout: base64(iv(12) | tag(16) | ciphertext),
// encrypted with a per-capsule key (aes-256-gcm).
function sealWithKey(plainText, keyBase64) {
  const key = Buffer.from(keyBase64, 'base64')
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

async function adminToken() {
  let admin = await prisma.adminUser.findFirst()
  let created = false
  if (!admin) {
    admin = await prisma.adminUser.create({
      data: { username: `test-capsule-admin-${Date.now()}`, passwordHash: 'unused', nickname: '测试管理员', role: 'super_admin' },
    })
    created = true
  }
  const token = signAdminToken({ id: admin.id, username: admin.username, role: admin.role, nickname: admin.nickname })
  return { token, cleanup: created ? () => prisma.adminUser.delete({ where: { id: admin.id } }) : async () => {} }
}

async function buryCapsule(app, payload) {
  const res = await app.inject({ method: 'POST', url: '/api/capsules', payload })
  assert.equal(res.statusCode, 201)
  return res.json().data.id
}

test('manual unlock shows the capsule card on the main site regardless of key/public option', async (t) => {
  const app = createApp()
  t.after(() => app.close())
  const { token, cleanup } = await adminToken()
  t.after(cleanup)

  const headers = { authorization: `Bearer ${token}` }
  const key = crypto.randomBytes(32).toString('base64')

  // without a key, future unlock, option off
  const noKeyId = await buryCapsule(app, {
    title: '无密钥胶囊',
    contentEncrypted: sealWithKey('无密钥的信', key),
    unlockAt: new Date(Date.now() + 30 * 86400_000).toISOString(),
    isPublicAfterUnlock: false,
  })
  // with a key, already due, option off -> card appears but content stays private
  const privateDueId = await buryCapsule(app, {
    title: '不公开胶囊',
    contentEncrypted: sealWithKey('不公开的信', key),
    key,
    unlockAt: new Date(Date.now() - 86400_000).toISOString(),
    isPublicAfterUnlock: false,
  })
  const createdIds = [noKeyId, privateDueId]
  t.after(() => prisma.capsule.deleteMany({ where: { id: { in: createdIds } } }))

  const before = await app.inject({ method: 'GET', url: '/api/capsules' })
  const beforeIds = before.json().data.items.map((item) => item.id)
  assert.equal(beforeIds.includes(noKeyId), false)
  assert.equal(beforeIds.includes(privateDueId), false)

  for (const id of createdIds) {
    const res = await app.inject({ method: 'POST', url: `/api/admin/capsules/${id}/unlock`, headers })
    assert.equal(res.statusCode, 200)
  }

  const after = await app.inject({ method: 'GET', url: '/api/capsules' })
  const items = after.json().data.items
  const noKey = items.find((item) => item.id === noKeyId)
  const priv = items.find((item) => item.id === privateDueId)
  assert.ok(noKey, 'keyless capsule card appears on the main site')
  assert.ok(priv, 'private capsule card appears on the main site')
  assert.equal(noKey.isPublicAfterUnlock, false, 'manual unlock does not change the public option')
  assert.equal(priv.isPublicAfterUnlock, false)
  assert.equal(noKey.content, null, 'content stays hidden for a keyless capsule')
  assert.equal(priv.content, null, 'option off: content stays private even after unlock time')
})

test('manual unlock reveals content only when the option is on and the unlock time has passed', async (t) => {
  const app = createApp()
  t.after(() => app.close())
  const { token, cleanup } = await adminToken()
  t.after(cleanup)

  const headers = { authorization: `Bearer ${token}` }
  const key = crypto.randomBytes(32).toString('base64')

  const publicDueId = await buryCapsule(app, {
    title: '已到期且公开',
    contentEncrypted: sealWithKey('到期后的信', key),
    key,
    unlockAt: new Date(Date.now() - 86400_000).toISOString(),
    isPublicAfterUnlock: true,
  })
  t.after(() => prisma.capsule.deleteMany({ where: { id: publicDueId } }))

  const unlockRes = await app.inject({ method: 'POST', url: `/api/admin/capsules/${publicDueId}/unlock`, headers })
  assert.equal(unlockRes.statusCode, 200)

  const list = await app.inject({ method: 'GET', url: '/api/capsules' })
  const item = list.json().data.items.find((entry) => entry.id === publicDueId)
  assert.ok(item, 'public due capsule appears as a card')
  assert.equal(item.content, '到期后的信', 'option on: content revealed after unlock time')
})