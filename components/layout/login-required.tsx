import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import { loginHref } from "@/lib/auth-redirect"
import { EmptyState } from "./empty-state"

/** Ajakan masuk untuk tamu di halaman yang butuh akun orang tua. */
export function LoginRequired({
  title = "Masuk dulu ya, Ayah/Bunda",
  description,
  icon,
  next,
}: {
  title?: string
  description: string
  icon: LucideIcon
  /** Halaman tujuan setelah berhasil masuk. */
  next: string
}) {
  return (
    <EmptyState
      mood="sleepy"
      icon={icon}
      title={title}
      description={description}
      action={
        <>
          <Button asChild size="lg">
            <Link href={loginHref(next)}>
              <LogIn data-icon="inline-start" />
              Masuk
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={loginHref(next, "/register")}>Buat akun</Link>
          </Button>
        </>
      }
    />
  )
}
