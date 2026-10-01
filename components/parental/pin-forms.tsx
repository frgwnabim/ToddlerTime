"use client"

import { useRouter } from "next/navigation"
import { useId, useState, useTransition, type FormEvent } from "react"
import { KeyRound, LockOpen } from "lucide-react"

import { changePin, setupPin, verifyPin } from "@/app/actions/parental"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toaster"
import { PIN_LENGTH } from "@/lib/parental"
import { useParentalControls } from "./parental-provider"
import { PinInput } from "./pin-input"

function PinField({
  label,
  value,
  onValueChange,
  autoFocus,
  invalid,
}: {
  label: string
  value: string
  onValueChange: (value: string) => void
  autoFocus?: boolean
  invalid?: boolean
}) {
  const id = useId()
  return (
    <div className="flex flex-col items-center gap-2">
      <label htmlFor={id} className="text-sm font-bold">
        {label}
      </label>
      <PinInput id={id} value={value} onValueChange={onValueChange} autoFocus={autoFocus} aria-invalid={invalid} />
    </div>
  )
}

function ErrorText({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p role="alert" className="text-center text-sm font-semibold text-destructive">
      {message}
    </p>
  )
}

/** Buat PIN pertama kali (ketik 2x). */
export function PinSetupForm() {
  const router = useRouter()
  const { refresh } = useParentalControls()
  const { toast } = useToast()
  const [pin, setPin] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    startTransition(async () => {
      const result = await setupPin(pin, confirm)
      if (!result.ok) {
        setError(result.error)
        setConfirm("")
        return
      }
      toast("PIN orang tua dibuat")
      refresh()
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5">
      <PinField
        label={`Buat PIN ${PIN_LENGTH} angka`}
        value={pin}
        onValueChange={(value) => {
          setPin(value)
          setError(null)
        }}
        autoFocus
        invalid={error !== null}
      />
      <PinField
        label="Ketik ulang PIN"
        value={confirm}
        onValueChange={(value) => {
          setConfirm(value)
          setError(null)
        }}
        invalid={error !== null}
      />
      <ErrorText message={error} />
      <Button type="submit" size="lg" disabled={pin.length !== PIN_LENGTH || confirm.length !== PIN_LENGTH || pending}>
        <KeyRound data-icon="inline-start" />
        {pending ? "Menyimpan..." : "Simpan PIN"}
      </Button>
      <p className="max-w-xs text-center text-xs text-muted-foreground">
        PIN disimpan dalam bentuk terenkripsi. Jangan beri tahu si kecil, ya.
      </p>
    </form>
  )
}

/** Minta PIN sebelum membuka pengaturan. */
export function PinUnlockForm() {
  const router = useRouter()
  const [pin, setPin] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    startTransition(async () => {
      const result = await verifyPin(pin)
      setPin("")
      if (!result.ok) {
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5">
      <PinField
        label={`Masukkan PIN ${PIN_LENGTH} angka`}
        value={pin}
        onValueChange={(value) => {
          setPin(value)
          setError(null)
        }}
        autoFocus
        invalid={error !== null}
      />
      <ErrorText message={error} />
      <Button type="submit" size="lg" disabled={pin.length !== PIN_LENGTH || pending}>
        <LockOpen data-icon="inline-start" />
        {pending ? "Memeriksa..." : "Buka pengaturan"}
      </Button>
    </form>
  )
}

/** Ganti PIN (sesi orang tua harus aktif). */
export function ChangePinForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [pin, setPin] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    startTransition(async () => {
      const result = await changePin(pin, confirm)
      if (!result.ok) {
        setError(result.error)
        if (result.code === "pin") router.refresh()
        return
      }
      setPin("")
      setConfirm("")
      setError(null)
      toast("PIN berhasil diganti")
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-wrap justify-center gap-5 sm:justify-start">
        <PinField label="PIN baru" value={pin} onValueChange={setPin} invalid={error !== null} />
        <PinField label="Ketik ulang" value={confirm} onValueChange={setConfirm} invalid={error !== null} />
      </div>
      <ErrorText message={error} />
      <Button
        type="submit"
        variant="outline"
        className="w-fit"
        disabled={pin.length !== PIN_LENGTH || confirm.length !== PIN_LENGTH || pending}
      >
        <KeyRound data-icon="inline-start" />
        {pending ? "Menyimpan..." : "Ganti PIN"}
      </Button>
    </form>
  )
}
