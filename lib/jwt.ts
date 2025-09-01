function base64url(input: ArrayBuffer | string) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input)
  const str = btoa(String.fromCharCode(...bytes))
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}
function base64urlDecode(input: string): Uint8Array {
  const str = input.replace(/-/g, "+").replace(/_/g, "/")
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4))
  const bin = atob(str + pad)
  return new Uint8Array([...bin].map((c) => c.charCodeAt(0)))
}

async function importKey(secret: string) {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ])
}

export type JWTPayload = { sub: string; iat: number; exp: number }

const DEMO_SECRET = "demo-secret-only-for-frontend"

export async function signJWT(payload: JWTPayload, secret = DEMO_SECRET): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" }
  const data = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`
  const key = await importKey(secret)
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data))
  return `${data}.${base64url(sig)}`
}

export async function verifyJWT(token: string, secret = DEMO_SECRET): Promise<JWTPayload | null> {
  const [h, p, s] = token.split(".")
  if (!h || !p || !s) return null
  const data = `${h}.${p}`
  const key = await importKey(secret)
  const valid = await crypto.subtle.verify("HMAC", key, base64urlDecode(s), new TextEncoder().encode(data))
  if (!valid) return null
  try {
    const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(p))) as JWTPayload
    if (Date.now() / 1000 > payload.exp) return null
    return payload
  } catch {
    return null
  }
}
