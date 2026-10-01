import "server-only"

import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

// "Sesi orang tua": setelah PIN benar, server memberi cookie httpOnly yang
// ditandatangani (HMAC) dan berlaku singkat. Dipakai untuk mengubah
// pengaturan tanpa mengetik PIN di setiap langkah.

const COOKIE_NAME = "tt_parent"
const SESSION_SECONDS = 10 * 60

function secret(): string {
  const value = process.env.PARENTAL_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!value) throw new Error("PARENTAL_SESSION_SECRET atau SUPABASE_SERVICE_ROLE_KEY belum diisi.")
  return value
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url")
}

export async function startParentSession(userId: string) {
  const expiresAt = Date.now() + SESSION_SECONDS * 1000
  const payload = `${userId}.${expiresAt}`
  const store = await cookies()
  store.set(COOKIE_NAME, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  })
}

export async function endParentSession() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

/** True bila cookie sesi orang tua valid untuk user ini. */
export async function hasParentSession(userId: string): Promise<boolean> {
  const value = (await cookies()).get(COOKIE_NAME)?.value
  if (!value) return false
  const [cookieUserId, expiresAt, signature] = value.split(".")
  if (cookieUserId !== userId || !expiresAt || !signature) return false
  if (Number(expiresAt) < Date.now()) return false
  let expected: string
  try {
    expected = sign(`${cookieUserId}.${expiresAt}`)
  } catch {
    return false
  }
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}
