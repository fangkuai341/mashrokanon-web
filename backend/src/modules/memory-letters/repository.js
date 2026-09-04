import { prisma } from '../../lib/prisma.js'

export const memoryLettersRepository = {
  create(data) {
    return prisma.memoryLetter.create({ data })
  },
  listPublic({ tag, orderBy = 'newest', take = 20, skip = 0 }) {
    return prisma.memoryLetter.findMany({
      where: {
        status: 'approved',
        ...(tag && tag !== 'all' ? { tag } : {}),
      },
      orderBy: orderBy === 'hot' ? { lightsCount: 'desc' } : { createdAt: 'desc' },
      take,
      skip,
    })
  },
  incrementLights(id) {
    return prisma.memoryLetter.update({ where: { id }, data: { lightsCount: { increment: 1 } } })
  },
  findById(id) {
    return prisma.memoryLetter.findUnique({ where: { id } })
  },
}
