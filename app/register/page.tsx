import type { Metadata } from "next"
import Link from "next/link"

import { AuthCard } from "@/components/auth/auth-card"
import { RegisterForm } from "@/components/auth/register-form"
import { loginHref, safeNextPath } from "@/lib/auth-redirect"

export const metadata: Metadata = { title: "Daftar", robots: { index: false } }

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const { next: rawNext } = await searchParams
  const next = safeNextPath(Array.isArray(rawNext) ? rawNext[0] : rawNext)

  return (
    <AuthCard
      title="Buat akun orang tua"
      description="Gratis. Menonton tetap bisa tanpa akun; akun dipakai untuk fitur orang tua."
      footer={
        <>
          Sudah punya akun?{" "}
          <Link href={loginHref(next)} className="font-bold text-sky-ink underline-offset-4 hover:underline">
            Masuk
          </Link>
        </>
      }
    >
      <RegisterForm next={next} />
    </AuthCard>
  )
}
