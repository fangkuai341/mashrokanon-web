import { createMemoryLetterSchema } from './validation.js'
import { memoryLettersRepository } from './repository.js'
import { consumeRateLimit } from '../../lib/rateLimit.js'

function clientKey(request) {
  return request.ip ?? request.headers['x-forwarded-for'] ?? 'local'
}

export function registerMemoryLetterRoutes(app) {
  app.get('/api/memory-letters', async (request) => {
    const query = request.query ?? {}
    const items = await memoryLettersRepository.listPublic({
      tag: query.tag,
      orderBy: query.sort === 'hot' ? 'hot' : 'newest',
      take: Math.min(Number(query.limit ?? 20), 50),
      skip: Number(query.offset ?? 0),
    })

    return { success: true, data: { items } }
  })

  app.post('/api/memory-letters', async (request, reply) => {
    const allowed = consumeRateLimit(`memory:${clientKey(request)}`, 5, 60_000)
    if (!allowed) {
      return reply.code(429).send({ success: false, error: { code: 'RATE_LIMITED', message: '发送太快了，请稍后再试' } })
    }

    const body = createMemoryLetterSchema.parse(request.body)
    const letter = await memoryLettersRepository.create({
      nickname: body.isAnonymous ? '匿名旅人' : body.nickname,
      content: body.content,
      tag: body.tag,
      isAnonymous: body.isAnonymous,
      status: 'pending',
      lightsCount: 0,
      createdIpHash: String(clientKey(request)),
      createdUaHash: String(request.headers['user-agent'] ?? ''),
    })

    return reply.code(201).send({ success: true, data: letter })
  })

  app.post('/api/memory-letters/:id/light', async (request, reply) => {
    const allowed = consumeRateLimit(`light:${clientKey(request)}:${request.params.id}`, 20, 60_000)
    if (!allowed) {
      return reply.code(429).send({ success: false, error: { code: 'RATE_LIMITED', message: '点灯过于频繁' } })
    }

    const letter = await memoryLettersRepository.findById(request.params.id)
    if (!letter || letter.status !== 'approved') {
      return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: '留言不存在' } })
    }

    const updated = await memoryLettersRepository.incrementLights(letter.id)
    return { success: true, data: updated }
  })
}
