import { prisma } from '../../lib/prisma.js'

export const capsulesRepository = {
  create(data) {
    return prisma.capsule.create({ data })
  },
  listPublic() {
    return prisma.capsule.findMany({
      where: { status: 'unlocked' },
      orderBy: { openedAt: 'desc' },
    })
  },
  findById(id) {
    return prisma.capsule.findUnique({ where: { id } })
  },
  markUnlocked(id) {
    return prisma.capsule.update({ where: { id }, data: { status: 'unlocked', openedAt: new Date() } })
  },
  publish(id) {
    return prisma.capsule.update({ where: { id }, data: { isPublicAfterUnlock: true } })
  },
}
