import { verifyAdminToken } from '../lib/jwt.js'

export async function requireAdmin(request, reply) {
  const authorization = request.headers.authorization ?? ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''

  if (!token) {
    return reply.code(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: '需要管理员登录' } })
  }

  try {
    request.admin = verifyAdminToken(token)
  } catch {
    return reply.code(401).send({ success: false, error: { code: 'INVALID_TOKEN', message: '登录状态已失效' } })
  }
}
