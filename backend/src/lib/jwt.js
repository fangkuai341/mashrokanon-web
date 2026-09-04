import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function signAdminToken(payload) {
  return jwt.sign(payload, env.adminJwtSecret, { expiresIn: '12h' })
}

export function verifyAdminToken(token) {
  return jwt.verify(token, env.adminJwtSecret)
}
