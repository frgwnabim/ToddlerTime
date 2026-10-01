"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Play, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { usePlayerEvent } from "./player-context"

const COUNTDOWN_SECONDS = 5

export type UpNextVideo = { slug: string; title: string; thumbnailUrl: string; channelName: string }

/** Hitung mundur 5 detik ke video berikutnya saat video selesai; bisa dibatalkan. */
export function UpNextOverlay({ next }: { next: UpNextVideo }) {
  const router = useRouter()
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const href = `/watch/${next.slug}`

  usePlayerEvent((event) => {
    if (event.type === "ended") setSecondsLeft(COUNTDOWN_SECONDS)
    if (event.type === "play") setSecondsLeft(null)
  })

  useEffect(() => {
    if (secondsLeft === null) return
    if (secondsLeft <= 0) {
      router.push(href)
      return
    }
    const timeout = window.setTimeout(() => setSecondsLeft((value) => (value === null ? null : value - 1)), 1000)
    return () => window.clearTimeout(timeout)
  }, [secondsLeft, router, href])

  if (secondsLeft === null) return null

  const progress = (COUNTDOWN_SECONDS - secondsLeft) / COUNTDOWN_SECONDS

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-foreground/85 p-4 text-background backdrop-blur-sm animate-in fade-in-0">
      <div className="flex w-full max-w-md flex-col items-center gap-3 text-center @lg:gap-4">
        <p className="text-sm font-semibold opacity-80" aria-live="polite">
          Video berikutnya dalam {secondsLeft} detik
        </p>

        <div className="flex w-full items-center gap-3 text-left">
          <div className="relative hidden aspect-video w-36 shrink-0 overflow-hidden rounded-xl @md:block">
            <Image src={next.thumbnailUrl} alt="" fill sizes="144px" className="object-cover" />
          </div>
          <div className="relative grid size-14 shrink-0 place-items-center @md:hidden" aria-hidden="true">
            <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
              <circle cx="18" cy="18" r="16" className="fill-none stroke-background/25" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="16"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - progress}
                strokeLinecap="round"
                className="fill-none stroke-sky transition-[stroke-dashoffset] duration-1000 ease-linear"
                strokeWidth="3"
              />
            </svg>
            <span className="font-heading text-xl font-bold">{secondsLeft}</span>
          </div>
          <div className="min-w-0">
            <p className="line-clamp-2 font-bold leading-snug @lg:text-lg">{next.title}</p>
            <p className="truncate text-sm opacity-75">{next.channelName}</p>
          </div>
        </div>

        <div className="flex w-full gap-2 @md:w-auto">
          <Button
            variant="ghost"
            onClick={() => setSecondsLeft(null)}
            className="flex-1 text-background hover:bg-background/15 @md:flex-none"
          >
            <X data-icon="inline-start" />
            Batal
          </Button>
          <Button onClick={() => router.push(href)} className="flex-1 @md:flex-none">
            <Play data-icon="inline-start" className="fill-current" />
            Putar sekarang
          </Button>
        </div>
      </div>
    </div>
  )
}
