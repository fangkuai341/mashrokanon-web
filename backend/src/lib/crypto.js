import crypto from 'node:crypto'
import { env } from '../config/env.js'

const algorithm = 'aes-256-gcm'

function getMasterKey() {
  return Buffer.from(env.capsuleSecretKey, 'hex')
}

// Payload layout shared by every layer here: base64(iv(12) | tag(16) | ciphertext).
function seal(plainText, key) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

function open(payload, key) {
  const raw = Buffer.from(payload, 'base64')
  const iv = raw.subarray(0, 12)
  const tag = raw.subarray(12, 28)
  const encrypted = raw.subarray(28)
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  decipher.setAuthTag(tag)
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return decrypted.toString('utf8')
}

// Legacy helpers: capsule content encrypted by the site master key directly.
export function encryptCapsuleContent(value) {
  return seal(value, getMasterKey())
}

export function decryptCapsuleContent(payload) {
  return open(payload, getMasterKey())
}

// A capsule key is generated in the visitor's browser. When the site is asked to
// keep it ("保存密钥"), we wrap the plaintext key with the master key before
// storing it, so the raw key never sits in the database.
export function encryptCapsuleKey(keyBase64) {
  return seal(keyBase64, getMasterKey())
}

export function decryptCapsuleKey(payload) {
  return open(payload, getMasterKey())
}

// Decrypt content that was encrypted client-side with a per-capsule key.
export function decryptCapsulePayload(payload, keyBase64) {
  return open(payload, Buffer.from(keyBase64, 'base64'))
}

// Decrypt a capsule row by preferring its wrapped key and falling back to the
// legacy master-key payload (rows created before per-capsule keys existed).
export function decryptCapsuleRow(capsule) {
  if (capsule.keyEncrypted) {
    return decryptCapsulePayload(capsule.contentEncrypted, decryptCapsuleKey(capsule.keyEncrypted))
  }
  return decryptCapsuleContent(capsule.contentEncrypted)
}
