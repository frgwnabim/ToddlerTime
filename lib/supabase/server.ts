import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import type { Database } from "@/types/database"
import { getSupabaseEnv } from "./env"

/**
 * Supabase client untuk Server Component, Server Action, dan Route Handler.
 * Buat baru di setiap request. Memanggil ini membuat halaman jadi dinamis.
 */
export async function createClient() {
  const cookieStore = await cookies()
  const { url, anonKey } = getSupabaseEnv()

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options)
        } catch {
          // Dipanggil dari Server Component (cookie read-only). Aman diabaikan
          // karena proxy.ts sudah me-refresh session.
        }
      },
    },
  })
}
