// Browser-side AES-256-GCM helpers for time capsules.
//
// Payload layout (shared with the backend): base64(iv(12) | tag(16) | ciphertext).
// The key is a random 32-byte value as base64; the site only receives it when the
// visitor opts to let the site keep it ("保存密钥"), otherwise it lives only here.

const ALGO = 'AES-GCM'

function toBase64(bytes) {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

function fromBase64(value) {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function concatBytes(...parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const part of parts) {
    out.set(part, offset)
    offset += part.length
  }
  return out
}

async function importKey(keyBase64) {
  return crypto.subtle.importKey('raw', fromBase64(keyBase64), { name: ALGO }, false, ['encrypt', 'decrypt'])
}

export async function generateCapsuleKey() {
  return toBase64(crypto.getRandomValues(new Uint8Array(32)))
}

export async function encryptCapsuleText(plainText, keyBase64) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const cipherBlob = await crypto.subtle.encrypt(
    { name: ALGO, iv },
    await importKey(keyBase64),
    new TextEncoder().encode(plainText),
  )
  const bytes = new Uint8Array(cipherBlob)
  // WebCrypto appends the GCM tag at the end; re-order to iv|tag|ct like the backend.
  const tag = bytes.slice(bytes.length - 16)
  const ciphertext = bytes.slice(0, bytes.length - 16)
  return toBase64(concatBytes(iv, tag, ciphertext))
}

export async function decryptCapsuleText(payloadBase64, keyBase64) {
  const raw = fromBase64(payloadBase64)
  const iv = raw.slice(0, 12)
  const tag = raw.slice(12, 28)
  const ciphertext = raw.slice(28)
  const encrypted = concatBytes(ciphertext, tag)
  const plain = await crypto.subtle.decrypt(
    { name: ALGO, iv },
    await importKey(keyBase64),
    encrypted,
  )
  return new TextDecoder().decode(plain)
}
