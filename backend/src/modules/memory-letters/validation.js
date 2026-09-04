import { z } from 'zod'

export const createMemoryLetterSchema = z.object({
  nickname: z.string().trim().min(1).max(16).optional().default('匿名旅人'),
  content: z.string().trim().min(1).max(500),
  tag: z.enum(['思念', '感谢', '祝福', '故事', '其他']).default('思念'),
  isAnonymous: z.boolean().default(false),
})
