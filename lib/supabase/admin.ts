import "server-only"

import { createClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database"
import { getSupabaseEnv } from "./env"

/**
 * Client service role (melewati RLS). HANYA untuk server, hanya untuk data
 * yang memang tidak boleh disentuh dari browser: PIN & kelonggaran waktu
 * kontrol orang tua. Selalu filter dengan user_id yang sudah diverifikasi.
 */
export function hasAdminEnv(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY belum diisi (lihat .env.example).")
  return createClient<Database>(getSupabaseEnv().url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
