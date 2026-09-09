import { z } from 'zod'

export const createTimelineEventSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().trim().min(1).max(80),
  zh: z.string().trim().min(1).max(3000),
  ja: z.string().trim().min(1).max(3000),
  tags: z.array(z.string().trim().min(1).max(20)).default([]),
  link: z.string().trim().max(300).optional().default(''),
  image: z.string().trim().max(500).optional().default(''),
  featured: z.boolean().default(false),
})

export const updateTimelineEventSchema = createTimelineEventSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: '至少提供一个要更新的字段',
})

function isValidIsoDateTime(value) {
  if (!value) return true
  const t = Date.parse(value)
  return !Number.isNaN(t)
}

export const updateSiteSettingsSchema = z.object({
  countdown: z.object({
    labelZh: z.string().trim().min(1, '请填写中文标题').max(60),
    labelJa: z.string().trim().min(1, '请填写日文标题').max(60),
    date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式应为 YYYY-MM-DD'),
  }).optional(),
  lights: z.object({
    enabled: z.boolean().default(false),
    startAt: z.string().trim().max(32).default('').refine(isValidIsoDateTime, '开始时间格式错误'),
    endAt: z.string().trim().max(32).default('').refine(isValidIsoDateTime, '结束时间格式错误'),
  }).optional(),
}).refine((value) => value.countdown || value.lights, { message: '至少提供一项设置' })
