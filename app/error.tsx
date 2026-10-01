"use client"

import Link from "next/link"
import { useEffect } from "react"
import { House, RotateCcw } from "lucide-react"

import { EmptyState } from "@/components/layout/empty-state"
import { Button } from "@/components/ui/button"

/** Error di dalam halaman (header & menu tetap tampil). */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <EmptyState
      mood="dizzy"
      title="Waduh, TV-nya pusing!"
      description={
        <>
          Ada yang tersandung saat memuat halaman ini. Coba lagi, ya. Kalau masih pusing, kembali ke beranda dulu.
          {error.digest && <span className="mt-2 block text-xs opacity-70">Kode: {error.digest}</span>}
        </>
      }
      action={
        <>
          <Button size="lg" onClick={reset}>
            <RotateCcw data-icon="inline-start" />
            Coba lagi
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <House data-icon="inline-start" />
              Ke Beranda
            </Link>
          </Button>
        </>
      }
    />
  )
}
