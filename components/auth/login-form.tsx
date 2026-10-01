"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition, type FormEvent } from "react"
import { LogIn, Sparkles } from "lucide-react"

import { signInAsDemo } from "@/app/login/actions"
import { Button } from "@/components/ui/button"
import { authErrorMessage } from "@/lib/supabase/auth-errors"
import { createClient } from "@/lib/supabase/client"
import { FormError, FormField } from "./form-field"

export function LoginForm({ next, demoAvailable }: { next: string; demoAvailable: boolean }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [demoPending, startDemo] = useTransition()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setPending(true)
    setError(null)

    const { error: signInError } = await createClient().auth.signInWithPassword({
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    })

    if (signInError) {
      setError(authErrorMessage(signInError))
      setPending(false)
      return
    }
    router.replace(next)
    router.refresh()
  }

  function handleDemo() {
    setError(null)
    startDemo(async () => {
      const result = await signInAsDemo()
      if (!result.ok) {
        setError(result.error)
        return
      }
      // Session dibuat di server: muat ulang supaya client membaca cookie baru.
      window.location.assign(next)
    })
  }

  const busy = pending || demoPending

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label="Email" name="email" type="email" autoComplete="email" required placeholder="ayah@contoh.com" />
        <FormField label="Kata sandi" name="password" type="password" autoComplete="current-password" required />
        <FormError message={error} />
        <Button type="submit" size="lg" disabled={busy}>
          <LogIn data-icon="inline-start" />
          {pending ? "Sedang masuk..." : "Masuk"}
        </Button>
      </form>

      {demoAvailable && (
        <>
          <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            atau
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="rounded-2xl bg-sun-soft p-4 text-sun-ink">
            <p className="text-sm font-semibold">Mau lihat-lihat dulu? Pakai akun demo tanpa perlu daftar.</p>
            <Button type="button" variant="sun" className="mt-3 w-full" onClick={handleDemo} disabled={busy}>
              <Sparkles data-icon="inline-start" />
              {demoPending ? "Menyiapkan akun demo..." : "Coba akun demo"}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
