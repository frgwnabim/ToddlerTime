"use client"

import { Eye, GlassWater, PersonStanding, Play, type LucideIcon } from "lucide-react"

import { Mascot } from "@/components/layout/mascot"
import { Button } from "@/components/ui/button"
import { FullscreenDialog } from "./fullscreen-dialog"

const TIPS: { icon: LucideIcon; text: string }[] = [
  { icon: GlassWater, text: "Ayo minum air dan regangkan badan!" },
  { icon: Eye, text: "Yuk, kedipkan mata lalu lihat ke tempat yang jauh!" },
  { icon: PersonStanding, text: "Ayo berdiri, lompat-lompat kecil, lalu tarik napas!" },
]

/** Ajakan istirahat sejenak; si kecil bisa lanjut menonton sendiri. */
export function BreakScreen({
  minutes,
  tipIndex,
  onContinue,
}: {
  minutes: number
  /** Ganti ajakan setiap kali istirahat. */
  tipIndex: number
  onContinue: () => void
}) {
  const tip = TIPS[tipIndex % TIPS.length]
  const Icon = tip.icon

  return (
    <FullscreenDialog
      title="Waktunya istirahat sebentar"
      description={tip.text}
      className="bg-linear-to-b from-mint-soft via-sky-soft to-background"
    >
      <div className="relative">
        <div className="grid size-44 place-items-center rounded-full bg-card shadow-soft">
          <Mascot mood="happy" className="size-28" />
        </div>
        <span className="absolute -top-2 -right-4 grid size-16 place-items-center rounded-3xl bg-sky text-sky-foreground shadow-soft">
          <Icon className="size-8" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-8 max-w-lg font-heading text-4xl leading-tight font-extrabold sm:text-5xl">{tip.text}</p>
      {minutes > 0 && (
        <p className="mt-3 text-lg text-muted-foreground">Kamu sudah menonton {minutes} menit. Hebat!</p>
      )}
      <Button size="xl" variant="mint" className="mt-10" onClick={onContinue}>
        <Play data-icon="inline-start" className="fill-current" />
        Lanjut nonton
      </Button>
    </FullscreenDialog>
  )
}
