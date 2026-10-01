"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { MailCheck, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { loginHref } from "@/lib/auth-redirect"
import { authErrorMessage } from "@/lib/supabase/auth-errors"
import { createClient } from "@/lib/supabase/client"
import { FormError, FormField } from "./form-field"

const MIN_PASSWORD = 8

export function RegisterForm({ next }: { next: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const displayName = String(form.get("displayName") ?? "").trim()
    const email = String(form.get("email") ?? "").trim()
    const password = String(form.get("password") ?? "")

    if (!displayName) return setError("Isi nama tampilan dulu, ya.")
    if (password.length < MIN_PASSWORD) return setError(`Kata sandi minimal ${MIN_PASSWORD} karakter.`)

    setPending(true)
    setError(null)
    const callback = new URL("/auth/callback", window.location.origin)
    callback.searchParams.set("next", next)

    const { data, error: signUpError } = await createClient().auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName }, emailRedirectTo: callback.toString() },
    })

    if (signUpError) {
      setError(authErrorMessage(signUpError))
      setPending(false)
      return
    }

    // Konfirmasi email dimatikan di Supabase: langsung masuk.
    if (data.session) {
      router.replace(next)
      router.refresh()
      return
    }
    setSentTo(email)
    setPending(false)
  }

  if (sentTo) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-mint-soft text-mint-ink">
          <MailCheck className="size-7" aria-hidden="true" />
        </span>
        <p className="font-bold">Cek email Ayah/Bunda</p>
        <p className="text-sm text-muted-foreground">
          Kalau <strong className="text-foreground">{sentTo}</strong> belum terdaftar, kami sudah mengirim link
          konfirmasi ke sana. Klik link itu untuk mengaktifkan akun.
        </p>
        <Button asChild variant="outline" className="mt-2">
          <Link href={loginHref(next)}>Kembali ke halaman masuk</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField
        label="Nama tampilan"
        name="displayName"
        autoComplete="nickname"
        required
        maxLength={50}
        placeholder="Bunda Rara"
        hint="Tampil di komentar. Hindari nama lengkap anak."
      />
      <FormField label="Email" name="email" type="email" autoComplete="email" required placeholder="bunda@contoh.com" />
      <FormField
        label="Kata sandi"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD}
        hint={`Minimal ${MIN_PASSWORD} karakter.`}
      />
      <FormError message={error} />
      <Button type="submit" size="lg" disabled={pending}>
        <UserPlus data-icon="inline-start" />
        {pending ? "Sedang mendaftar..." : "Buat akun"}
      </Button>
    </form>
  )
}
