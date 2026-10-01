import type { AuthError } from "@supabase/supabase-js"

const MESSAGES: Record<string, string> = {
  invalid_credentials: "Email atau kata sandi salah.",
  email_not_confirmed: "Email belum dikonfirmasi. Cek kotak masuk email Ayah/Bunda, lalu klik link konfirmasinya.",
  user_already_exists: "Email ini sudah terdaftar. Silakan masuk.",
  email_exists: "Email ini sudah terdaftar. Silakan masuk.",
  weak_password: "Kata sandi terlalu lemah. Gunakan minimal 8 karakter dengan campuran huruf dan angka.",
  email_address_invalid: "Alamat email tidak valid.",
  over_email_send_rate_limit: "Terlalu banyak email terkirim. Coba lagi beberapa menit lagi.",
  over_request_rate_limit: "Terlalu banyak percobaan. Tunggu sebentar, lalu coba lagi.",
  signup_disabled: "Pendaftaran akun sedang ditutup.",
}

/** Pesan error auth Supabase dalam Bahasa Indonesia. */
export function authErrorMessage(error: Pick<AuthError, "code" | "message"> | null | undefined): string {
  if (!error) return "Terjadi kesalahan. Coba lagi, ya."
  return (error.code && MESSAGES[error.code]) || "Terjadi kesalahan. Coba lagi, ya."
}
