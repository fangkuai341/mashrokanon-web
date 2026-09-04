import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { createApp } from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'
import { signAdminToken } from '../src/lib/jwt.js'

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
      data: { username: `test-decrypt-admin-${Date.now()}`, passwordHash: 'unused', nickname: '测试管理员', role: 'super_admin' },
    })
    created = true
  }
  const token = signAdminToken({ id: admin.id, username: admin.username, role: admin.role, nickname: admin.nickname })
  return { token, cleanup: created ? () => prisma.adminUser.delete({ where: { id: admin.id } }) : async () => {} }
}

async function createCapsule(app, payload) {
  const res = await app.inject({ method: 'POST', url: '/api/capsules', payload })
  assert.equal(res.statusCode, 201)
  return res.json().data
}

test('decryption endpoint returns content directly when the capsule has a stored key', async (t) => {
  const app = createApp()
  t.after(() => app.close())

  const { cleanup } = await adminToken()
  t.after(cleanup)

  const key = crypto.randomBytes(32).toString('base64')
  const capsule = await createCapsule(app, {
    title: '解密测试-存钥',
    contentEncrypted: sealWithKey('存钥内容', key),
    key,
    unlockAt: new Date(Date.now() + 30 * 86400_000).toISOString(),
    isPublicAfterUnlock: false,
  })
  t.after(() => prisma.capsule.deleteMany({ where: { id: capsule.id } }))

  const res = await app.inject({
    method: 'POST',
    url: '/api/decryption',
    payload: { input: capsule.id },
  })

  assert.equal(res.statusCode, 200)
  assert.equal(res.json().data.hasKey, true)
  assert.equal(res.json().data.needsKey, false)
  assert.equal(res.json().data.content, '存钥内容')
})

test('decryption endpoint accepts ciphertext and decrypts with a provided key when no key is stored', async (t) => {
  const app = createApp()
  t.after(() => app.close())

  const { cleanup } = await adminToken()
  t.after(cleanup)

  const key = crypto.randomBytes(32).toString('base64')
  const cipherText = sealWithKey('无钥内容', key)
  const capsule = await createCapsule(app, {
    title: '解密测试-无钥',
    contentEncrypted: cipherText,
    unlockAt: new Date(Date.now() + 30 * 86400_000).toISOString(),
    isPublicAfterUnlock: false,
  })
  t.after(() => prisma.capsule.deleteMany({ where: { id: capsule.id } }))

  const probe = await app.inject({
    method: 'POST',
    url: '/api/decryption',
    payload: { input: cipherText },
  })
  assert.equal(probe.statusCode, 200)
  assert.equal(probe.json().data.hasKey, false)
  assert.equal(probe.json().data.needsKey, true)

  const reveal = await app.inject({
    method: 'POST',
    url: '/api/decryption',
    payload: { input: cipherText, key },
  })
  assert.equal(reveal.statusCode, 200)
  assert.equal(reveal.json().data.content, '无钥内容')
})
