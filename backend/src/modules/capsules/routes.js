import { createCapsuleSchema, decryptionRequestSchema } from './validation.js'
import { capsulesRepository } from './repository.js'
import {
  decryptCapsulePayload,
  decryptCapsuleRow,
  decryptCapsuleKey,
  encryptCapsuleKey,
} from '../../lib/crypto.js'
import { consumeRateLimit } from '../../lib/rateLimit.js'
import { prisma } from '../../lib/prisma.js'

function clientKey(request) {
  return request.ip ?? request.headers['x-forwarded-for'] ?? 'local'
}

function isUnlocked(capsule) {
  if (capsule.status === 'hidden') return false
  return capsule.status === 'unlocked' || new Date(capsule.unlockAt) <= new Date()
}

function decryptContent(capsule) {
  try {
    return decryptCapsuleRow(capsule)
  } catch {
    return null
  }
}

function capsuleView(capsule, { reveal = false } = {}) {
  const unlocked = isUnlocked(capsule)
  const due = new Date(capsule.unlockAt) <= new Date()
  const contentVisible = unlocked && due && (capsule.isPublicAfterUnlock || reveal)
  return {
    id: capsule.id,
    title: capsule.title,
    unlockAt: capsule.unlockAt,
    status: unlocked ? capsule.status : 'sealed',
    isPublicAfterUnlock: capsule.isPublicAfterUnlock,
    content: contentVisible ? decryptContent(capsule) : null,
    openedAt: capsule.openedAt,
    hasKey: Boolean(capsule.keyEncrypted),
  }
}

export function registerCapsuleRoutes(app) {
  app.get('/api/capsules', async () => {
    const items = await capsulesRepository.listPublic()
    return { success: true, data: { items: items.map(capsuleView) } }
  })

  app.post('/api/decryption', async (request, reply) => {
    const allowed = consumeRateLimit(`capsule-decrypt:${clientKey(request)}`, 10, 60_000)
    if (!allowed) {
      return reply.code(429).send({ success: false, error: { code: 'RATE_LIMITED', message: '尝试过于频繁，请稍后再试' } })
    }

    const { input, key = '' } = decryptionRequestSchema.parse(request.body)
    const trimmedInput = input.trim()

    let capsule = await capsulesRepository.findById(trimmedInput)
    if (!capsule) {
      capsule = await prisma.capsule.findFirst({ where: { contentEncrypted: trimmedInput } })
    }
    if (!capsule) {
      return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: '胶囊不存在或密文未找到' } })
    }

    const hasKey = Boolean(capsule.keyEncrypted)
    let resolvedKey = String(key || '').trim()

    if (hasKey) {
      try {
        resolvedKey = decryptCapsuleKey(capsule.keyEncrypted)
      } catch {
        return reply.code(400).send({ success: false, error: { code: 'DECRYPT_FAILED', message: '保存的密钥已损坏，无法解密' } })
      }
    } else if (!resolvedKey) {
      return reply.code(200).send({
        success: true,
        data: { id: capsule.id, hasKey: false, needsKey: true, content: null },
      })
    }

    try {
      const content = decryptCapsulePayload(capsule.contentEncrypted, resolvedKey)
      return { success: true, data: { id: capsule.id, hasKey, needsKey: !hasKey, content } }
    } catch {
      return reply.code(400).send({ success: false, error: { code: 'INVALID_KEY', message: '密钥不正确，无法解密' } })
    }
  })

  app.get('/api/capsules/:id', async (request, reply) => {
    const capsule = await capsulesRepository.findById(request.params.id)
    if (!capsule) {
      return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: '胶囊不存在' } })
    }
    return { success: true, data: capsuleView(capsule) }
  })

  app.post('/api/capsules', async (request, reply) => {
    const allowed = consumeRateLimit(`capsule:${clientKey(request)}`, 3, 60_000)
    if (!allowed) {
      return reply.code(429).send({ success: false, error: { code: 'RATE_LIMITED', message: '创建过于频繁' } })
    }

    const body = createCapsuleSchema.parse(request.body)
    if (body.isPublicAfterUnlock && !body.key) {
      return reply.code(400).send({
        success: false,
        error: { code: 'KEY_REQUIRED', message: '只有保存密钥的胶囊才能在到期后公开展示内容' },
      })
    }

    const capsule = await capsulesRepository.create({
      title: body.title,
      contentEncrypted: body.contentEncrypted,
      keyEncrypted: body.key ? encryptCapsuleKey(body.key) : null,
      unlockAt: new Date(body.unlockAt),
      email: body.email || null,
      isPublicAfterUnlock: body.isPublicAfterUnlock,
      status: 'sealed',
      createdIpHash: String(clientKey(request)),
      createdUaHash: String(request.headers['user-agent'] ?? ''),
    })

    return reply.code(201).send({ success: true, data: capsuleView(capsule) })
  })

  app.post('/api/capsules/:id/unlock', async (request, reply) => {
    const capsule = await capsulesRepository.findById(request.params.id)
    if (!capsule) {
      return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: '胶囊不存在' } })
    }

    if (new Date(capsule.unlockAt) > new Date()) {
      return reply.code(403).send({ success: false, error: { code: 'CAPSULE_LOCKED', message: '未到开启时间' } })
    }

    // When the site was not asked to keep the key, opening requires the key the
    // visitor saved when the capsule was buried.
    if (!capsule.keyEncrypted) {
      const providedKey = String(request.body?.key ?? '')
      if (!providedKey) {
        return reply.code(400).send({ success: false, error: { code: 'KEY_REQUIRED', message: '请提供保存的密钥来开启胶囊' } })
      }
      try {
        decryptCapsulePayload(capsule.contentEncrypted, providedKey)
      } catch {
        return reply.code(400).send({ success: false, error: { code: 'INVALID_KEY', message: '密钥不正确，无法开启胶囊' } })
      }
    }

    const updated = await capsulesRepository.markUnlocked(capsule.id)
    const view = capsuleView(updated, { reveal: true })
    if (!capsule.keyEncrypted && view.content === null) {
      view.content = decryptCapsulePayload(capsule.contentEncrypted, String(request.body?.key))
    }
    return { success: true, data: view }
  })

  app.post('/api/capsules/:id/publish', async (request, reply) => {
    const capsule = await capsulesRepository.findById(request.params.id)
    if (!capsule) {
      return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: '胶囊不存在' } })
    }

    const updated = await capsulesRepository.publish(capsule.id)
    return { success: true, data: capsuleView(updated) }
  })
}
