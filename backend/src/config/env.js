import 'dotenv/config'

function read(name, fallback) {
  const value = process.env[name]
  if (value && value.trim()) return value.trim()
  if (fallback !== undefined) return fallback
  throw new Error(`Missing required environment variable: ${name}`)
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3001),
  host: process.env.HOST ?? '0.0.0.0',
  databaseUrl: read('DATABASE_URL', 'mysql://root:password@127.0.0.1:3306/forest_memorial'),
  adminJwtSecret: read('ADMIN_JWT_SECRET', 'dev-admin-secret-change-me'),
  capsuleSecretKey: read('CAPSULE_SECRET_KEY', '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),
}
