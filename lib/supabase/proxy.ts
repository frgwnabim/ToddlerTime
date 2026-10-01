import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import type { Database } from "@/types/database"
import { safeNextPath } from "@/lib/auth-redirect"
import { getSupabaseEnv, hasSupabaseEnv } from "./env"

const GUEST_ONLY_PATHS = ["/login", "/register"]

/** Refresh session Supabase di setiap request dan teruskan cookie-nya. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  if (!hasSupabaseEnv()) return response

  const { url, anonKey } = getSupabaseEnv()
  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value)
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options)
        // Header anti-cache dari Supabase: jangan sampai CDN menyajikan session orang lain.
        for (const [key, value] of Object.entries(headers ?? {})) response.headers.set(key, value)
      },
    },
  })

  // Jangan taruh kode lain di antara createServerClient dan getClaims().
  const { data } = await supabase.auth.getClaims()
  const isSignedIn = Boolean(data?.claims)

  // Orang tua yang sudah masuk tidak perlu melihat halaman masuk/daftar lagi.
  if (isSignedIn && GUEST_ONLY_PATHS.includes(request.nextUrl.pathname)) {
    const target = request.nextUrl.clone()
    target.pathname = safeNextPath(request.nextUrl.searchParams.get("next"))
    target.search = ""
    const redirect = NextResponse.redirect(target)
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie)
    return redirect
  }

  return response
}
