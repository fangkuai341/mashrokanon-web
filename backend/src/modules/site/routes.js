import { siteRepository, COUNTDOWN_SETTING_KEY, LIGHTS_SETTING_KEY, normalizeCountdown, normalizeLights, isLightsActive } from './repository.js'
import { createTimelineEventSchema, updateSiteSettingsSchema, updateTimelineEventSchema } from './validation.js'
import { requireAdmin } from '../../middleware/adminAuth.js'

export function registerSiteRoutes(app) {
  app.get('/api/home/summary', async () => {
    const data = await siteRepository.getHomeSummary()
    return { success: true, data }
  })

  app.get('/api/admin/site-settings', { preHandler: requireAdmin }, async () => {
    const [countdown, lights] = await Promise.all([siteRepository.getCountdownSetting(), siteRepository.getLightsSetting()])
    const normalizedLights = normalizeLights(lights)
    return { success: true, data: { countdown, lights: { ...normalizedLights, active: isLightsActive(normalizedLights) } } }
  })

  app.put('/api/admin/site-settings', { preHandler: requireAdmin }, async (request) => {
    const parsed = updateSiteSettingsSchema.parse(request.body)
    const result = {}
    if (parsed.countdown) {
      const settingValue = JSON.stringify(normalizeCountdown(parsed.countdown))
      await siteRepository.upsertSetting(COUNTDOWN_SETTING_KEY, settingValue)
      result.countdown = normalizeCountdown(settingValue)
    }
    if (parsed.lights) {
      const normalized = normalizeLights(parsed.lights)
      const settingValue = JSON.stringify(normalized)
      await siteRepository.upsertSetting(LIGHTS_SETTING_KEY, settingValue)
      result.lights = { ...normalizeLights(settingValue), active: isLightsActive(normalizeLights(settingValue)) }
    }
    if (!result.countdown) result.countdown = await siteRepository.getCountdownSetting()
    if (!result.lights) {
      const l = await siteRepository.getLightsSetting()
      const n = normalizeLights(l)
      result.lights = { ...n, active: isLightsActive(n) }
    }
    return { success: true, data: result }
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
