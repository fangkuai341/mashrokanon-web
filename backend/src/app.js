import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import fastifyMultipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import path from 'node:path'
import { registerSiteRoutes } from './modules/site/routes.js'
import { registerMemoryLetterRoutes } from './modules/memory-letters/routes.js'
import { registerCapsuleRoutes } from './modules/capsules/routes.js'
import { registerAdminRoutes } from './modules/admin/routes.js'
import { registerCommunityRoutes } from './modules/community/routes.js'
import { registerUploadRoutes } from './modules/upload/routes.js'
import { errorHandler } from './middleware/errorHandler.js'

export async function createApp() {
  const app = Fastify({ logger: true })

  // Tolerate empty JSON bodies (e.g. POST actions that carry no payload but
  // still send Content-Type: application/json). Fastify's default parser
  // rejects them with FST_ERR_CTP_EMPTY_JSON_BODY.
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (_request, body, done) => {
    try {
      done(null, body.length ? JSON.parse(body) : undefined)
    } catch (err) {
      err.statusCode = 400
      done(err, undefined)
    }
  })

  app.setErrorHandler(errorHandler)
  app.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
  app.register(rateLimit, { max: 100, timeWindow: '1 minute' })

  await app.register(fastifyMultipart, {
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  })
  await app.register(fastifyStatic, {
    root: path.resolve(process.cwd(), 'uploads'),
    prefix: '/uploads/',
    decorateReply: false,
  })

  app.get('/health', async () => ({ ok: true }))
  registerSiteRoutes(app)
  registerMemoryLetterRoutes(app)
  registerCapsuleRoutes(app)
  registerAdminRoutes(app)
  registerCommunityRoutes(app)
  registerUploadRoutes(app)

  return app
}
