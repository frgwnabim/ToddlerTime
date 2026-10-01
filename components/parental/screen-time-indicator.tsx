"use client"

import Link from "next/link"
import { Clock } from "lucide-react"

import { WARNING_BEFORE_SECONDS } from "@/lib/parental"
import { cn } from "@/lib/utils"
import { useParentalControls } from "./parental-provider"

/** Pil kecil di header: sisa waktu nonton hari ini (hanya bila ada batas harian). */
export function ScreenTimeIndicator() {
  const { active, remaining, lock } = useParentalControls()
  if (!active || remaining === null || lock) return null

  const minutes = Math.ceil(remaining / 60)
  const low = remaining <= WARNING_BEFORE_SECONDS

  return (
    <Link
      href="/parental"
      aria-label={`Sisa waktu menonton hari ini ${minutes} menit`}
      title="Sisa waktu menonton hari ini"
      className={cn(
        "flex h-9 shrink-0 items-center gap-1 rounded-full px-2.5 text-sm font-bold sm:gap-1.5 sm:px-3 tabular-nums transition-colors outline-none focus-visible:ring-4 focus-visible:ring-ring",
        low ? "bg-peach-soft text-peach-ink" : "bg-mint-soft text-mint-ink"
      )}
    >
      <Clock className="size-4" aria-hidden="true" />
      <span className="sm:hidden">{minutes}</span>
      <span className="hidden sm:inline">{minutes} menit lagi</span>
    </Link>
  )
}
