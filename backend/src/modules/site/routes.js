import { siteRepository, COUNTDOWN_SETTING_KEY, normalizeCountdown } from './repository.js'
import { createTimelineEventSchema, updateSiteSettingsSchema, updateTimelineEventSchema } from './validation.js'
import { requireAdmin } from '../../middleware/adminAuth.js'

export function registerSiteRoutes(app) {
  app.get('/api/home/summary', async () => {
    const data = await siteRepository.getHomeSummary()
    return { success: true, data }
  })

  app.get('/api/admin/site-settings', { preHandler: requireAdmin }, async () => {
    const countdown = await siteRepository.getCountdownSetting()
    return { success: true, data: { countdown } }
  })

  app.put('/api/admin/site-settings', { preHandler: requireAdmin }, async (request) => {
    const { countdown } = updateSiteSettingsSchema.parse(request.body)
    const settingValue = JSON.stringify(normalizeCountdown(countdown))
    await siteRepository.upsertSetting(COUNTDOWN_SETTING_KEY, settingValue)
    return { success: true, data: { countdown: normalizeCountdown(settingValue) } }
  })

  app.get('/api/timeline', async (request) => {
    const year = request.query?.year ?? 'all'
    const items = await siteRepository.listTimelineEvents(year)
    return { success: true, data: { year, items } }
  })

  app.post('/api/admin/timeline-events', { preHandler: requireAdmin }, async (request, reply) => {
    const body = createTimelineEventSchema.parse(request.body)
    const data = await siteRepository.createTimelineEvent(body)
    return reply.code(201).send({ success: true, data })
  })

  app.patch('/api/admin/timeline-events/:id', { preHandler: requireAdmin }, async (request) => {
    const body = updateTimelineEventSchema.parse(request.body)
    const data = await siteRepository.updateTimelineEvent(request.params.id, body)
    return { success: true, data }
  })

  app.delete('/api/admin/timeline-events/:id', { preHandler: requireAdmin }, async (request) => {
    await siteRepository.deleteTimelineEvent(request.params.id)
    return { success: true, data: { id: request.params.id } }
  })
}
