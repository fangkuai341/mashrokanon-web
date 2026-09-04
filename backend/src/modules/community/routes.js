import { z } from 'zod'
import { communityRepository } from './repository.js'
import { consumeRateLimit } from '../../lib/rateLimit.js'

const createSubmissionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式应为 YYYY-MM-DD'),
  title: z.string().trim().min(1, '标题不能为空').max(80),
  zh: z.string().trim().min(1, '中文描述不能为空').max(3000),
  ja: z.string().trim().max(3000).optional().default(''),
  tags: z.array(z.string().trim().min(1).max(20)).max(10).optional().default([]),
  source: z.string().trim().max(300).optional().default(''),
  name: z.string().trim().max(40).optional().default(''),
})

function clientKey(request) {
  return request.ip ?? request.headers['x-forwarded-for'] ?? 'local'
}

export function registerCommunityRoutes(app) {
  app.get('/api/rank', async () => {
    const submissions = await communityRepository.listRank()
    const items = submissions.map((item) => ({
      name: item.submitter,
      count: item._count.submitter,
    }))
    return { success: true, data: { items } }
  })

  app.post('/api/submissions', async (request, reply) => {
    const allowed = consumeRateLimit(`submission:${clientKey(request)}`, 5, 60_000)
    if (!allowed) {
      return reply.code(429).send({ success: false, error: { code: 'RATE_LIMITED', message: '提交过于频繁' } })
    }

    const body = createSubmissionSchema.parse(request.body)
    const submission = await communityRepository.createSubmission({
      ...body,
      createdAt: new Date().toISOString(),
      status: 'pending',
    })

    return reply.code(201).send({ success: true, data: submission })
  })
}