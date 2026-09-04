import { prisma } from '../../lib/prisma.js'

export const adminRepository = {
  findByUsername(username) {
    return prisma.adminUser.findUnique({ where: { username } })
  },
  updateLastLogin(id) {
    return prisma.adminUser.update({ where: { id }, data: { lastLoginAt: new Date() } })
  },
  reviewMemoryLetter(id, data) {
    return prisma.memoryLetter.update({ where: { id }, data })
  },
  reviewCapsule(id, data) {
    return prisma.capsule.update({ where: { id }, data })
  },
  findCapsule(id) {
    return prisma.capsule.findUnique({ where: { id } })
  },
  reviewSubmission(id, data) {
    return prisma.communitySubmission.update({ where: { id }, data })
  },
  getSubmission(id) {
    return prisma.communitySubmission.findUnique({ where: { id } })
  },
  approveSubmissionWithTimeline(submission, adminId) {
    return prisma.$transaction(async (tx) => {
      const event = await tx.timelineEvent.create({
        data: {
          date: submission.date,
          title: submission.title,
          zh: submission.zh,
          ja: submission.ja || '',
          tagsJson: Array.isArray(submission.tagsJson) ? submission.tagsJson : [],
          link: submission.source || null,
          featured: false,
        },
      })
      const updated = await tx.communitySubmission.update({
        where: { id: submission.id },
        data: { status: 'approved', reviewedById: adminId, reviewedAt: new Date() },
      })
      return { event, updated }
    })
  },
  createAuditLog(data) {
    return prisma.auditLog.create({ data })
  },
  listMemoryLetters(status = 'pending') {
    return prisma.memoryLetter.findMany({ where: { status }, orderBy: { createdAt: 'asc' } })
  },
  listSubmissions(status = 'pending') {
    return prisma.communitySubmission.findMany({ where: { status }, orderBy: { createdAt: 'asc' } })
  },
  listCapsules(status) {
    return prisma.capsule.findMany({ where: status ? { status } : {}, orderBy: { createdAt: 'desc' } })
  },
  listAuditLogs(limit = 100) {
    return prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(limit) || 100, 500),
      include: { admin: { select: { username: true, nickname: true } } },
    })
  },
  getDashboard() {
    return Promise.all([
      prisma.timelineEvent.count(),
      prisma.memoryLetter.count({ where: { status: 'pending' } }),
      prisma.memoryLetter.count({ where: { status: 'approved' } }),
      prisma.communitySubmission.count({ where: { status: 'pending' } }),
      prisma.communitySubmission.count({ where: { status: 'approved' } }),
      prisma.capsule.count(),
      prisma.capsule.count({ where: { status: 'unlocked' } }),
    ])
  },
}
