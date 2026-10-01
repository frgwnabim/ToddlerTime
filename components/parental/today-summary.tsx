"use client"

import { formatNumber } from "@/lib/format"
import { useParentalControls } from "./parental-provider"

/** Angka utama: menit menonton hari ini (ikut bertambah saat video diputar). */
export function TodaySummary({ initialSeconds }: { initialSeconds: number }) {
  const { active, secondsToday, remaining, settings } = useParentalControls()
  const seconds = active ? Math.max(secondsToday, initialSeconds) : initialSeconds
  const minutes = Math.floor(seconds / 60)

  return (
    <div>
      <p className="text-sm font-semibold text-muted-foreground">Total menonton hari ini</p>
      <p className="mt-1 font-sans text-5xl leading-none font-bold tabular-nums">
        {formatNumber(minutes)}
        <span className="ml-1.5 text-xl font-semibold text-muted-foreground">menit</span>
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {settings?.dailyLimitMinutes
          ? remaining === null
            ? "Kunci dibuka untuk hari ini."
            : `Sisa ${Math.ceil(remaining / 60)} dari ${settings.dailyLimitMinutes} menit.`
          : "Belum ada batas harian."}
      </p>
    </div>
  )
}
