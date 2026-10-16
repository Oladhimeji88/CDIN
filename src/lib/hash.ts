/**
 * Lightweight deterministic hashing for the simulated chain.
 * NOT cryptographically secure — it stands in for SHA-256 so the UI can
 * display realistic, stable 64-char hex digests without async Web Crypto.
 */

function cyrb128(str: string): [number, number, number, number] {
  let h1 = 1779033703,
    h2 = 3144134277,
    h3 = 1013904242,
    h4 = 2773480762
  for (let i = 0; i < str.length; i++) {
    const k = str.charCodeAt(i)
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067)
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233)
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213)
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179)
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067)
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233)
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213)
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179)
  return [
    (h1 ^ h2 ^ h3 ^ h4) >>> 0,
    (h2 ^ h1) >>> 0,
    (h3 ^ h1) >>> 0,
    (h4 ^ h1) >>> 0,
  ]
}

function toHex(n: number): string {
  return (n >>> 0).toString(16).padStart(8, '0')
}

/** Produce a stable 64-char hex digest from any input string. */
export function sha256ish(input: string): string {
  const a = cyrb128(input)
  const b = cyrb128(input + '::salt::' + a.join(''))
  return [...a, ...b].map(toHex).join('')
}

/** Short, human-friendly digest preview: 0x1a2b…9f0e */
export function shortHash(hash: string, head = 6, tail = 4): string {
  const clean = hash.startsWith('0x') ? hash.slice(2) : hash
  return `0x${clean.slice(0, head)}…${clean.slice(-tail)}`
}

let counter = 0
/** Collision-resistant id for client-side records. */
export function uid(prefix = 'id'): string {
  counter += 1
  const seed = `${prefix}-${Date.now()}-${counter}-${Math.random()}`
  return `${prefix}_${sha256ish(seed).slice(0, 12)}`
}

/** Deterministic anonymised voter token (unlinkable to identity in UI). */
export function anonToken(voterId: string, electionId: string): string {
  return sha256ish(`anon::${voterId}::${electionId}`).slice(0, 24)
}
