import { z } from 'zod'

const capsuleKeySchema = z.string().min(24).max(512).regex(/^[A-Za-z0-9+/]+={0,2}$/)

export const createCapsuleSchema = z.object({
  title: z.string().trim().min(1).max(30),
  contentEncrypted: z.string().trim().min(32).max(5000),
  key: capsuleKeySchema.optional(),
  unlockAt: z.string().datetime(),
  email: z.string().email().optional().or(z.literal('')),
  isPublicAfterUnlock: z.boolean().default(false),
})

export const decryptionRequestSchema = z.object({
  input: z.string().trim().min(1, '请输入胶囊编号或密文').max(5000),
  key: capsuleKeySchema.optional().or(z.literal('')),
})
