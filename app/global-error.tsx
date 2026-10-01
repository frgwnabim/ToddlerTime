"use client"

import "./globals.css"

import { Mascot } from "@/components/layout/mascot"

/** Error di layout akar: tampil tanpa header, jadi dibuat mandiri. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center font-sans text-foreground">
        <div className="grid size-36 place-items-center rounded-full bg-sky-soft">
          <Mascot mood="dizzy" className="size-24" />
        </div>
        <h1 className="text-3xl font-bold">Waduh, TV-nya pusing!</h1>
        <p className="max-w-md text-muted-foreground">
          ToddlerTime sedang tersandung. Muat ulang halaman sebentar lagi, ya.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-2 h-12 rounded-2xl bg-sky px-6 font-bold text-sky-foreground shadow-soft outline-none focus-visible:ring-4 focus-visible:ring-ring"
        >
          Muat ulang
        </button>
      </body>
    </html>
  )
}
