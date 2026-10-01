"use server"

import { authErrorMessage } from "@/lib/supabase/auth-errors"
import { createClient } from "@/lib/supabase/server"

/**
 * Masuk dengan akun demo. Kredensial dibaca di server saja, jadi kata sandi
 * demo tidak ikut terkirim di bundle JavaScript.
 */
export async function signInAsDemo(): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = process.env.NEXT_PUBLIC_DEMO_EMAIL
  const password = process.env.NEXT_PUBLIC_DEMO_PASSWORD
  if (!email || !password) return { ok: false, error: "Akun demo belum disiapkan." }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { ok: false, error: authErrorMessage(error) }
  return { ok: true }
}
