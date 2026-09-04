import { prisma } from '../../lib/prisma.js'

export const communityRepository = {
  createSubmission(data) {
    return prisma.communitySubmission.create({
      data: {
        date: new Date(`${data.date}T00:00:00.000Z`),
        title: data.title,
        zh: data.zh,
        ja: data.ja || '',
        tagsJson: Array.isArray(data.tags) ? data.tags : [],
        source: data.source?.trim() || null,
        submitter: data.name?.trim() || '匿名',
        status: 'pending',
      },
    })
  },
  listRank() {
    return prisma.communitySubmission.groupBy({
      by: ['submitter'],
      where: { status: 'approved' },
      _count: { submitter: true },
      orderBy: { _count: { submitter: 'desc' } },
      take: 10,
    })
  },
  approveSubmission(id) {
    return prisma.communitySubmission.update({ where: { id }, data: { status: 'approved', reviewedAt: new Date() } })
  },
  rejectSubmission(id, reason) {
    return prisma.communitySubmission.update({ where: { id }, data: { status: 'rejected', reason, reviewedAt: new Date() } })
  },
  listPendingSubmissions() {
    return prisma.communitySubmission.findMany({ where: { status: 'pending' }, orderBy: { createdAt: 'asc' } })
  },
}