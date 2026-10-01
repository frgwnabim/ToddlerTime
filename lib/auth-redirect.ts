/**
 * Validasi tujuan "kembali ke halaman semula" (?next=) supaya tidak bisa
 * dipakai untuk redirect ke situs lain.
 */
export function safeNextPath(value: string | null | undefined, fallback = "/"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback
  if (value.startsWith("/login") || value.startsWith("/register") || value.startsWith("/auth/")) return fallback
  return value
}

/** URL halaman masuk dengan tujuan kembali. */
export function loginHref(next: string, page: "/login" | "/register" = "/login"): string {
  const safe = safeNextPath(next)
  return safe === "/" ? page : `${page}?next=${encodeURIComponent(safe)}`
}
