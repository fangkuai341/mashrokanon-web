import { signAdminToken } from '../../lib/jwt.js'
import { comparePassword } from '../../lib/password.js'
import { requireAdmin } from '../../middleware/adminAuth.js'
import { decryptCapsulePayload, decryptCapsuleKey } from '../../lib/crypto.js'
import { adminRepository } from './repository.js'

function toSubmissionView(sub) {
  return {
    ...sub,
    date: sub.date instanceof Date ? sub.date.toISOString().slice(0, 10) : sub.date,
    tags: Array.isArray(sub.tagsJson) ? sub.tagsJson : [],
  }
}

function toAdminCapsuleView(capsule) {
  const key = capsule.keyEncrypted ? decryptCapsuleKey(capsule.keyEncrypted) : null
  return {
    id: capsule.id,
    title: capsule.title,
    contentEncrypted: capsule.contentEncrypted,
    key,
    hasKey: Boolean(key),
    email: capsule.email,
    unlockAt: capsule.unlockAt,
    isPublicAfterUnlock: capsule.isPublicAfterUnlock,
    status: capsule.status,
    openedAt: capsule.openedAt,
    createdAt: capsule.createdAt,
    updatedAt: capsule.updatedAt,
  }
}

export function registerAdminRoutes(app) {
  app.post('/api/admin/login', async (request, reply) => {
    const { username, password } = request.body ?? {}
    const admin = await adminRepository.findByUsername(String(username ?? ''))

    if (!admin || admin.status !== 'active') {
      return reply.code(401).send({ success: false, error: { code: 'INVALID_CREDENTIALS', message: '账号或密码错误' } })
    }

    const ok = await comparePassword(String(password ?? ''), admin.passwordHash)
    if (!ok) {
      return reply.code(401).send({ success: false, error: { code: 'INVALID_CREDENTIALS', message: '账号或密码错误' } })
    }

    await adminRepository.updateLastLogin(admin.id)
    const token = signAdminToken({ id: admin.id, username: admin.username, role: admin.role, nickname: admin.nickname })

    return { success: true, data: { token, admin: { id: admin.id, username: admin.username, nickname: admin.nickname, role: admin.role } } }
  })

  app.get('/api/admin/me', { preHandler: requireAdmin }, async (request) => ({
    success: true,
    data: request.admin,
  }))

  app.get('/api/admin/dashboard', { preHandler: requireAdmin }, async () => {
    const [timeline, pendingLetters, approvedLetters, pendingSubmissions, approvedSubmissions, capsules, unlockedCapsules] = await adminRepository.getDashboard()
    return { success: true, data: { timeline, pendingLetters, approvedLetters, pendingSubmissions, approvedSubmissions, capsules, unlockedCapsules } }
  })

  app.get('/api/admin/memory-letters', { preHandler: requireAdmin }, async (request) => {
    const status = ['pending', 'approved', 'rejected'].includes(request.query?.status) ? request.query.status : 'pending'
    const items = await adminRepository.listMemoryLetters(status)
    return { success: true, data: { items, status } }
  })

  app.post('/api/admin/memory-letters/:id/approve', { preHandler: requireAdmin }, async (request) => {
    const updated = await adminRepository.reviewMemoryLetter(request.params.id, {
      status: 'approved',
      reviewedById: request.admin.id,
      reviewedAt: new Date(),
    })
    await adminRepository.createAuditLog({
      targetType: 'memory_letter',
      targetId: updated.id,
      action: 'approve',
      adminId: request.admin.id,
    })
    return { success: true, data: updated }
  })

  app.post('/api/admin/memory-letters/:id/reject', { preHandler: requireAdmin }, async (request) => {
    const { reason = '' } = request.body ?? {}
    const updated = await adminRepository.reviewMemoryLetter(request.params.id, {
      status: 'rejected',
      auditReason: String(reason),
      reviewedById: request.admin.id,
      reviewedAt: new Date(),
    })
    await adminRepository.createAuditLog({
      targetType: 'memory_letter',
      targetId: updated.id,
      action: 'reject',
      reason: String(reason),
      adminId: request.admin.id,
    })
    return { success: true, data: updated }
  })

  app.post('/api/admin/memory-letters/:id/hide', { preHandler: requireAdmin }, async (request) => {
    const updated = await adminRepository.reviewMemoryLetter(request.params.id, { status: 'hidden' })
    await adminRepository.createAuditLog({
      targetType: 'memory_letter',
      targetId: updated.id,
      action: 'hide',
      adminId: request.admin.id,
    })
    return { success: true, data: updated }
  })

  app.get('/api/admin/submissions', { preHandler: requireAdmin }, async (request) => {
    const status = ['pending', 'approved', 'rejected'].includes(request.query?.status) ? request.query.status : 'pending'
    const items = await adminRepository.listSubmissions(status)
    return { success: true, data: { items: items.map(toSubmissionView), status } }
  })

  app.post('/api/admin/submissions/:id/approve', { preHandler: requireAdmin }, async (request, reply) => {
    const submission = await adminRepository.getSubmission(request.params.id)
    if (!submission) {
      return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: '投稿不存在' } })
    }
    if (submission.status !== 'pending') {
      return reply.code(400).send({ success: false, error: { code: 'ALREADY_REVIEWED', message: '该投稿已处理，不可重复操作' } })
    }

    try {
      const { updated } = await adminRepository.approveSubmissionWithTimeline(submission, request.admin.id)
      await adminRepository.createAuditLog({
        targetType: 'submission',
        targetId: updated.id,
        action: 'approve',
        adminId: request.admin.id,
      })
      return { success: true, data: { submission: toSubmissionView(updated) } }
    } catch (err) {
      if (err.code === 'P2002') {
        return reply.code(409).send({
          success: false,
          error: { code: 'DUPLICATE_TIMELINE_EVENT', message: `「${submission.date.toISOString().slice(0, 10)} ${submission.title}」已存在于时间轴中，无需重复入库` },
        })
      }
      throw err
    }
  })

  app.post('/api/admin/submissions/:id/reject', { preHandler: requireAdmin }, async (request) => {
    const { reason = '' } = request.body ?? {}
    const updated = await adminRepository.reviewSubmission(request.params.id, {
      status: 'rejected',
      reason: String(reason),
      reviewedById: request.admin.id,
      reviewedAt: new Date(),
    })
    await adminRepository.createAuditLog({
      targetType: 'submission',
      targetId: updated.id,
      action: 'reject',
      reason: String(reason),
      adminId: request.admin.id,
    })
    return { success: true, data: { submission: toSubmissionView(updated) } }
  })

  app.get('/api/admin/capsules', { preHandler: requireAdmin }, async (request) => {
    const status = request.query?.status
    const items = await adminRepository.listCapsules(status)
    return { success: true, data: { items: items.map(toAdminCapsuleView) } }
  })

  // Decrypt the capsule with its stored key so the admin can review the letter
  // before deciding to show it on the public site.
  app.post('/api/admin/capsules/:id/preview', { preHandler: requireAdmin }, async (request, reply) => {
    const capsule = await adminRepository.findCapsule(request.params.id)
    if (!capsule) {
      return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: '胶囊不存在' } })
    }
    if (!capsule.keyEncrypted) {
      return reply.code(400).send({
        success: false,
        error: { code: 'NO_STORED_KEY', message: '该胶囊未保存密钥，无法解密预览内容' },
      })
    }

    let content
    try {
      const key = decryptCapsuleKey(capsule.keyEncrypted)
      content = decryptCapsulePayload(capsule.contentEncrypted, key)
    } catch {
      return reply.code(400).send({
        success: false,
        error: { code: 'DECRYPT_FAILED', message: '密文或密钥已损坏，解密失败' },
      })
    }
    return { success: true, data: { id: capsule.id, content } }
  })

  // Unlock the capsule (if needed) and mark it public, which makes it appear in
  // the public capsule list on the main site.
  app.post('/api/admin/capsules/:id/publish', { preHandler: requireAdmin }, async (request, reply) => {
    const capsule = await adminRepository.findCapsule(request.params.id)
    if (!capsule) {
      return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: '胶囊不存在' } })
    }
    if (!capsule.keyEncrypted) {
      return reply.code(400).send({
        success: false,
        error: { code: 'NO_STORED_KEY', message: '该胶囊未保存密钥，无法公开展示内容' },
      })
    }
    if (new Date(capsule.unlockAt) > new Date()) {
      return reply.code(400).send({
        success: false,
        error: { code: 'CAPSULE_LOCKED', message: '未到开启时间，暂不能公开展示' },
      })
    }

    const updated = await adminRepository.reviewCapsule(capsule.id, {
      status: 'unlocked',
      isPublicAfterUnlock: true,
      openedAt: capsule.openedAt ?? new Date(),
    })
    await adminRepository.createAuditLog({
      targetType: 'capsule',
      targetId: updated.id,
      action: 'publish',
      adminId: request.admin.id,
    })
    return { success: true, data: toAdminCapsuleView(updated) }
  })

  app.get('/api/admin/audit-logs', { preHandler: requireAdmin }, async (request) => {
    const items = await adminRepository.listAuditLogs(request.query?.limit)
    return { success: true, data: { items } }
  })

  app.post('/api/admin/capsules/:id/hide', { preHandler: requireAdmin }, async (request) => {
    const updated = await adminRepository.reviewCapsule(request.params.id, { status: 'hidden' })
    await adminRepository.createAuditLog({
      targetType: 'capsule',
      targetId: updated.id,
      action: 'hide',
      adminId: request.admin.id,
    })
    return { success: true, data: updated }
  })

  // 手动解锁 = 站长决定将胶囊以卡片形式展示在主站；内容的公开与否仍尊重创建者
  // 「到期后公开」选项，且未到开启时间不返回内容。
  app.post('/api/admin/capsules/:id/unlock', { preHandler: requireAdmin }, async (request, reply) => {
    const capsule = await adminRepository.findCapsule(request.params.id)
    if (!capsule) {
      return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: '胶囊不存在' } })
    }
    const updated = await adminRepository.reviewCapsule(capsule.id, {
      status: 'unlocked',
      openedAt: new Date(),
    })
    await adminRepository.createAuditLog({
      targetType: 'capsule',
      targetId: updated.id,
      action: 'unlock',
      adminId: request.admin.id,
    })
    return { success: true, data: updated }
  })
}
