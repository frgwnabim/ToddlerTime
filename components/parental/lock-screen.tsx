"use client"

import Link from "next/link"
import { useId, useState, useTransition, type FormEvent } from "react"
import { ShieldCheck } from "lucide-react"

import { grantExtraTime, verifyPin, type ExtraTimeOption } from "@/app/actions/parental"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toaster"
import { EXTRA_TIME_OPTIONS, PIN_LENGTH, type DayAllowance, type LockReason } from "@/lib/parental"
import { FullscreenDialog } from "./fullscreen-dialog"
import { NightIllustration } from "./night-illustration"
import { PinInput } from "./pin-input"

const COPY: Record<LockReason, string> = {
  limit: "Waktu menonton hari ini sudah habis. Sampai jumpa besok, ya!",
  bedtime: "Sudah jam tidur. Selamat tidur dan mimpi indah!",
}

type Step = "rest" | "pin" | "options"

/**
 * Layar penuh saat waktu habis / jam tidur. Tidak bisa ditutup anak; orang
 * tua membuka lewat tombol kecil "Untuk orang tua" + PIN.
 */
export function LockScreen({
  reason,
  hasPin,
  onGranted,
}: {
  reason: LockReason
  hasPin: boolean
  onGranted: (allowance: DayAllowance) => void
}) {
  const { toast } = useToast()
  const [step, setStep] = useState<Step>("rest")
  const [pin, setPin] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const pinId = useId()

  function handlePin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    startTransition(async () => {
      const result = await verifyPin(pin)
      setPin("")
      if (result.ok) {
        setError(null)
        setStep("options")
      } else {
        setError(result.error)
      }
    })
  }

  function handleGrant(option: ExtraTimeOption) {
    startTransition(async () => {
      const result = await grantExtraTime(option)
      if (result.ok) {
        onGranted(result.data)
        toast(option === "unlock" ? "Kunci dibuka untuk hari ini" : `Waktu ditambah ${option} menit`)
        return
      }
      setError(result.error)
      setStep(result.code === "pin" ? "pin" : "options")
    })
  }

  return (
    <FullscreenDialog
      title="Waktunya istirahat dulu ya!"
      description={COPY[reason]}
      className="bg-linear-to-b from-lavender-soft via-sky-soft to-background"
    >
      {step === "rest" && (
        <>
          <NightIllustration />
          <p className="mt-8 font-heading text-4xl leading-tight font-extrabold sm:text-5xl">
            Waktunya istirahat dulu ya!
          </p>
          <p className="mt-3 max-w-md text-lg text-muted-foreground">{COPY[reason]}</p>
          <button
            type="button"
            onClick={() => setStep("pin")}
            className="mt-14 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground underline-offset-4 opacity-80 hover:underline hover:opacity-100 focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none"
          >
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Untuk orang tua
          </button>
        </>
      )}

      {step !== "rest" && (
        <div className="w-full max-w-sm rounded-3xl bg-card p-6 text-card-foreground shadow-lift ring-1 ring-border">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-lavender-soft text-lavender-ink">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </span>
          <h2 className="mt-3 text-2xl font-bold">Khusus orang tua</h2>

          {step === "pin" && !hasPin && (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                PIN belum dibuat. Buat PIN dulu di halaman Kontrol Orang Tua untuk menambah waktu.
              </p>
              <Button asChild className="mt-5 w-full">
                <Link href="/parental">Buka Kontrol Orang Tua</Link>
              </Button>
            </>
          )}

          {step === "pin" && hasPin && (
            <form onSubmit={handlePin} className="mt-4 flex flex-col items-center gap-3">
              <label htmlFor={pinId} className="text-sm text-muted-foreground">
                Masukkan PIN {PIN_LENGTH} angka
              </label>
              <PinInput
                id={pinId}
                value={pin}
                onValueChange={(value) => {
                  setPin(value)
                  setError(null)
                }}
                autoFocus
                aria-invalid={error !== null}
                aria-describedby={error ? `${pinId}-error` : undefined}
              />
              {error && (
                <p id={`${pinId}-error`} role="alert" className="text-sm font-semibold text-destructive">
                  {error}
                </p>
              )}
              <Button type="submit" className="mt-2 w-full" disabled={pin.length !== PIN_LENGTH || pending}>
                {pending ? "Memeriksa..." : "Lanjut"}
              </Button>
            </form>
          )}

          {step === "options" && (
            <div className="mt-4 flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">Mau memberi kelonggaran berapa lama?</p>
              <div className="grid grid-cols-3 gap-2">
                {EXTRA_TIME_OPTIONS.map((minutes) => (
                  <Button key={minutes} variant="mint" disabled={pending} onClick={() => handleGrant(minutes)}>
                    +{minutes} mnt
                  </Button>
                ))}
              </div>
              <Button variant="outline" disabled={pending} onClick={() => handleGrant("unlock")}>
                Buka kunci untuk hari ini
              </Button>
              {error && (
                <p role="alert" className="text-sm font-semibold text-destructive">
                  {error}
                </p>
              )}
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="mt-4"
            onClick={() => {
              setStep("rest")
              setPin("")
              setError(null)
            }}
          >
            Kembali
          </Button>
        </div>
      )}
    </FullscreenDialog>
  )
}
