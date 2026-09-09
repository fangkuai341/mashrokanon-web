import { prisma } from '../../lib/prisma.js'

function toView(event) {
  return {
    id: event.id,
    date: event.date.toISOString().slice(0, 10),
    title: event.title,
    zh: event.zh,
    ja: event.ja,
    tags: Array.isArray(event.tagsJson) ? event.tagsJson : [],
    link: event.link ?? null,
    image: event.image ?? null,
    featured: event.featured,
  }
}

export async function listTimelineEvents(year = 'all') {
  const where = year && year !== 'all'
    ? {
        date: {
          gte: new Date(`${year}-01-01T00:00:00.000Z`),
          lt: new Date(`${Number(year) + 1}-01-01T00:00:00.000Z`),
        },
      }
    : {}

  const items = await prisma.timelineEvent.findMany({
    where,
    orderBy: [{ date: 'asc' }, { featured: 'desc' }],
  })
  return items.map(toView)
}

export async function countTimelineEvents() {
  return prisma.timelineEvent.count()
}

export async function createTimelineEvent(data) {
  const created = await prisma.timelineEvent.create({
    data: {
      date: new Date(`${data.date}T00:00:00.000Z`),
      title: data.title,
      zh: data.zh,
      ja: data.ja,
      tagsJson: data.tags,
      link: data.link?.trim() || null,
      image: data.image?.trim() || null,
      featured: Boolean(data.featured),
    },
  })
  return toView(created)
}

export async function updateTimelineEvent(id, data) {
  const updated = await prisma.timelineEvent.update({
    where: { id },
    data: {
      ...(data.date ? { date: new Date(`${data.date}T00:00:00.000Z`) } : {}),
      ...(data.title ? { title: data.title } : {}),
      ...(data.zh ? { zh: data.zh } : {}),
      ...(data.ja ? { ja: data.ja } : {}),
      ...(data.tags ? { tagsJson: data.tags } : {}),
      ...(data.link !== undefined ? { link: data.link?.trim() || null } : {}),
      ...(data.image !== undefined ? { image: data.image?.trim() || null } : {}),
      ...(typeof data.featured === 'boolean' ? { featured: data.featured } : {}),
    },
  })
  return toView(updated)
}

export function deleteTimelineEvent(id) {
  return prisma.timelineEvent.delete({ where: { id } })
}
