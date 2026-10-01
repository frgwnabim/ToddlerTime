"use client"

import { useRouter } from "next/navigation"
import { useId, useState, useTransition, type FormEvent, type ReactNode } from "react"
import { BedDouble, Coffee, Hourglass, Save } from "lucide-react"

import { lockParentSettings, updateParentalSettings, type SettingsInput } from "@/app/actions/parental"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/toaster"
import { BREAK_PRESETS, BREAK_RANGE, DAILY_LIMIT_PRESETS, LIMIT_RANGE } from "@/lib/parental"
import { useParentalControls } from "./parental-provider"

type Choice = { kind: "off" } | { kind: "preset"; value: number } | { kind: "custom" }

function initialChoice(value: number | null, presets: readonly number[]): Choice {
  if (value === null) return { kind: "off" }
  return presets.includes(value) ? { kind: "preset", value } : { kind: "custom" }
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Hourglass
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <fieldset className="rounded-2xl bg-card p-5 shadow-soft ring-1 ring-border">
      <legend className="sr-only">{title}</legend>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-lavender-soft text-lavender-ink">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-heading text-lg leading-tight font-bold">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </fieldset>
  )
}

/** Pilihan chip + input "Lainnya" untuk angka menit. */
function MinutesPicker({
  choice,
  onChoice,
  custom,
  onCustom,
  presets,
  range,
  offLabel,
  label,
}: {
  choice: Choice
  onChoice: (choice: Choice) => void
  custom: string
  onCustom: (value: string) => void
  presets: readonly number[]
  range: { min: number; max: number }
  offLabel: string
  label: string
}) {
  const customId = useId()
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        <Chip selected={choice.kind === "off"} onClick={() => onChoice({ kind: "off" })}>
          {offLabel}
        </Chip>
        {presets.map((minutes) => (
          <Chip
            key={minutes}
            color="sky"
            selected={choice.kind === "preset" && choice.value === minutes}
            onClick={() => onChoice({ kind: "preset", value: minutes })}
          >
            {minutes} menit
          </Chip>
        ))}
        <Chip color="lavender" selected={choice.kind === "custom"} onClick={() => onChoice({ kind: "custom" })}>
          Lainnya
        </Chip>
      </div>
      {choice.kind === "custom" && (
        <div className="flex items-center gap-2">
          <label htmlFor={customId} className="sr-only">
            {label} (menit)
          </label>
          <Input
            id={customId}
            type="number"
            inputMode="numeric"
            min={range.min}
            max={range.max}
            value={custom}
            onChange={(event) => onCustom(event.target.value)}
            className="w-28"
            autoFocus
          />
          <span className="text-sm text-muted-foreground">
            menit ({range.min}-{range.max})
          </span>
        </div>
      )}
    </div>
  )
}

function resolveMinutes(choice: Choice, custom: string): number | null | "invalid" {
  if (choice.kind === "off") return null
  if (choice.kind === "preset") return choice.value
  const value = Number(custom)
  return Number.isInteger(value) && value > 0 ? value : "invalid"
}

export function ParentalSettingsForm({ initial }: { initial: SettingsInput }) {
  const router = useRouter()
  const { toast } = useToast()
  const { refresh } = useParentalControls()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [limitChoice, setLimitChoice] = useState(() => initialChoice(initial.dailyLimitMinutes, DAILY_LIMIT_PRESETS))
  const [limitCustom, setLimitCustom] = useState(String(initial.dailyLimitMinutes ?? 120))
  const [bedtimeOn, setBedtimeOn] = useState(initial.bedtimeStart !== null)
  const [bedtimeStart, setBedtimeStart] = useState(initial.bedtimeStart ?? "19:30")
  const [bedtimeEnd, setBedtimeEnd] = useState(initial.bedtimeEnd ?? "06:00")
  const [breakChoice, setBreakChoice] = useState(() => initialChoice(initial.breakReminderMinutes, BREAK_PRESETS))
  const [breakCustom, setBreakCustom] = useState(String(initial.breakReminderMinutes ?? 25))
  const startId = useId()
  const endId = useId()
  const switchId = useId()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const dailyLimitMinutes = resolveMinutes(limitChoice, limitCustom)
    const breakReminderMinutes = resolveMinutes(breakChoice, breakCustom)
    if (dailyLimitMinutes === "invalid") return setError("Isi batas harian dengan angka menit.")
    if (breakReminderMinutes === "invalid") return setError("Isi pengingat istirahat dengan angka menit.")

    setError(null)
    startTransition(async () => {
      const result = await updateParentalSettings({
        dailyLimitMinutes,
        bedtimeStart: bedtimeOn ? bedtimeStart : null,
        bedtimeEnd: bedtimeOn ? bedtimeEnd : null,
        breakReminderMinutes,
      })
      if (!result.ok) {
        setError(result.error)
        if (result.code === "pin") router.refresh()
        return
      }
      toast("Pengaturan disimpan")
      refresh()
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Section
        icon={Hourglass}
        title="Batas waktu harian"
        description="Hanya menghitung saat video benar-benar diputar. Reset setiap tengah malam (WIB)."
      >
        <MinutesPicker
          label="Batas waktu harian"
          choice={limitChoice}
          onChoice={setLimitChoice}
          custom={limitCustom}
          onCustom={setLimitCustom}
          presets={DAILY_LIMIT_PRESETS}
          range={LIMIT_RANGE}
          offLabel="Tanpa batas"
        />
      </Section>

      <Section icon={BedDouble} title="Jam tidur" description="Video dikunci selama jam tidur.">
        <div className="flex items-center gap-3">
          <Switch id={switchId} checked={bedtimeOn} onCheckedChange={setBedtimeOn} />
          <label htmlFor={switchId} className="font-semibold">
            {bedtimeOn ? "Aktif" : "Tidak aktif"}
          </label>
        </div>
        {bedtimeOn && (
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={startId} className="text-sm font-bold">
                Mulai
              </label>
              <Input
                id={startId}
                type="time"
                value={bedtimeStart}
                onChange={(event) => setBedtimeStart(event.target.value)}
                required
                className="w-36"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={endId} className="text-sm font-bold">
                Selesai
              </label>
              <Input
                id={endId}
                type="time"
                value={bedtimeEnd}
                onChange={(event) => setBedtimeEnd(event.target.value)}
                required
                className="w-36"
              />
            </div>
          </div>
        )}
      </Section>

      <Section
        icon={Coffee}
        title="Pengingat istirahat"
        description="Video berhenti sejenak dan si kecil diajak minum air & bergerak."
      >
        <MinutesPicker
          label="Pengingat istirahat"
          choice={breakChoice}
          onChoice={setBreakChoice}
          custom={breakCustom}
          onCustom={setBreakCustom}
          presets={BREAK_PRESETS}
          range={BREAK_RANGE}
          offLabel="Mati"
        />
      </Section>

      {error && (
        <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-fit" disabled={pending}>
        <Save data-icon="inline-start" />
        {pending ? "Menyimpan..." : "Simpan pengaturan"}
      </Button>
    </form>
  )
}

/** Kunci kembali halaman pengaturan (akhiri sesi orang tua). */
export function LockSettingsButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await lockParentSettings()
          router.refresh()
        })
      }
    >
      Kunci pengaturan
    </Button>
  )
}
