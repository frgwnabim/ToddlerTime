import type { ReactNode } from "react"

import { Mascot, type MascotMood } from "@/components/layout/mascot"

/** Kartu lembut untuk halaman masuk & daftar. */
export function AuthCard({
  title,
  description,
  mood = "happy",
  children,
  footer,
}: {
  title: string
  description?: ReactNode
  mood?: MascotMood
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="flex justify-center px-4 py-8 sm:py-14">
      <div className="w-full max-w-md">
        <div className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-border sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="grid size-24 place-items-center rounded-full bg-sky-soft">
              <Mascot mood={mood} className="size-16" />
            </div>
            <h1 className="mt-4 text-3xl font-bold">{title}</h1>
            {description && <p className="mt-1 text-muted-foreground">{description}</p>}
          </div>
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  )
}
