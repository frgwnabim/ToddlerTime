import type { Metadata } from "next"
import Link from "next/link"

import { AuthCard } from "@/components/auth/auth-card"
import { LoginForm } from "@/components/auth/login-form"
import { loginHref, safeNextPath } from "@/lib/auth-redirect"

export const metadata: Metadata = { title: "Masuk", robots: { index: false } }

const ERRORS: Record<string, string> = {
  konfirmasi: "Link konfirmasi tidak valid atau sudah kedaluwarsa. Coba masuk, atau daftar ulang.",
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams
  const next = safeNextPath(first(params.next))
  const error = ERRORS[first(params.error) ?? ""]
  const demoAvailable = Boolean(process.env.NEXT_PUBLIC_DEMO_EMAIL && process.env.NEXT_PUBLIC_DEMO_PASSWORD)

  return (
    <AuthCard
      title="Halo, Ayah/Bunda!"
      description="Masuk untuk menyimpan favorit si kecil dan mengatur waktu menonton."
      footer={
        <>
          Belum punya akun?{" "}
          <Link href={loginHref(next, "/register")} className="font-bold text-sky-ink underline-offset-4 hover:underline">
            Daftar sekarang
          </Link>
        </>
      }
    >
      {error && (
        <p role="alert" className="mb-4 rounded-2xl bg-peach-soft px-4 py-3 text-sm font-semibold text-peach-ink">
          {error}
        </p>
      )}
      <LoginForm next={next} demoAvailable={demoAvailable} />
    </AuthCard>
  )
}
