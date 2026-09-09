import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import { consumeRateLimit } from '../../lib/rateLimit.js'

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads')
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'])
const EXT_MAP = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
}
const MAX_BYTES = 5 * 1024 * 1024

function ensureDir() {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

function clientKey(request) {
  return request.ip ?? request.headers['x-forwarded-for'] ?? 'local'
}

export function registerUploadRoutes(app) {
  ensureDir()

  app.post('/api/upload', async (request, reply) => {
    const allowed = consumeRateLimit(`upload:${clientKey(request)}`, 10, 60_000)
    if (!allowed) {
      return reply.code(429).send({ success: false, error: { code: 'RATE_LIMITED', message: '上传过于频繁，请稍后再试' } })
    }

    const data = await request.file()
    if (!data) {
      return reply.code(400).send({ success: false, error: { code: 'NO_FILE', message: '请选择要上传的图片' } })
    }

    if (!ALLOWED_MIME.has(data.mimetype)) {
      return reply.code(400).send({ success: false, error: { code: 'INVALID_TYPE', message: '仅支持 JPG / PNG / WebP / GIF' } })
    }

    const ext = EXT_MAP[data.mimetype] ?? path.extname(data.filename || '') ?? '.jpg'
    const filename = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`
    const filepath = path.join(UPLOAD_DIR, filename)

    let size = 0
    try {
      const writeStream = fs.createWriteStream(filepath)
      data.file.on('data', (chunk) => {
        size += chunk.length
        if (size > MAX_BYTES) {
          data.file.destroy(new Error('FILE_TOO_LARGE'))
        }
      })
      await pipeline(data.file, writeStream)
    } catch (err) {
      try { fs.unlinkSync(filepath) } catch {}
      if (err.message === 'FILE_TOO_LARGE' || size > MAX_BYTES) {
        return reply.code(413).send({ success: false, error: { code: 'FILE_TOO_LARGE', message: '图片大小不能超过 5MB' } })
      }
      throw err
    }

    if (size > MAX_BYTES) {
      try { fs.unlinkSync(filepath) } catch {}
      return reply.code(413).send({ success: false, error: { code: 'FILE_TOO_LARGE', message: '图片大小不能超过 5MB' } })
    }

    const url = `/uploads/${filename}`
    return { success: true, data: { url, filename, mimetype: data.mimetype, size } }
  })
}
