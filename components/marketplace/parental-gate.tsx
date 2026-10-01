"use client"

import { createContext, useCallback, useContext, useId, useMemo, useState, type FormEvent, type ReactNode } from "react"
import { ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"

export type Store = "tokopedia" | "shopee"

export const STORE_NAMES: Record<Store, string> = {
  tokopedia: "Tokopedia",
  shopee: "Shopee",
}

const ALLOWED_HOSTS = ["www.tokopedia.com", "tokopedia.com", "shopee.co.id"]

type GateRequest = { url: string; store: Store; productName: string }
type Question = { a: number; b: number }

type ParentalGateContextValue = {
  /** Minta jawaban orang tua sebelum membuka link toko di tab baru. */
  requestOpen(request: GateRequest): void
}

const ParentalGateContext = createContext<ParentalGateContextValue | null>(null)

function randomBetween(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function newQuestion(previous?: Question): Question {
  let question: Question
  do {
    question = { a: randomBetween(4, 9), b: randomBetween(3, 9) }
  } while (previous && question.a === previous.a && question.b === previous.b)
  return question
}

/** Buka link toko di tab baru dengan rel="noopener noreferrer". */
function openStoreLink(url: string) {
  const parsed = new URL(url)
  if (parsed.protocol !== "https:" || !ALLOWED_HOSTS.includes(parsed.hostname)) return
  const link = document.createElement("a")
  link.href = parsed.toString()
  link.target = "_blank"
  link.rel = "noopener noreferrer"
  link.click()
}

/** Satu modal "gerbang orang tua" untuk seluruh aplikasi. */
export function ParentalGateProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<GateRequest | null>(null)
  const [question, setQuestion] = useState<Question>({ a: 7, b: 5 })
  const [answer, setAnswer] = useState("")
  const [error, setError] = useState<string | null>(null)
  const inputId = useId()

  const requestOpen = useCallback((next: GateRequest) => {
    setRequest(next)
    setQuestion((previous) => newQuestion(previous))
    setAnswer("")
    setError(null)
  }, [])

  const contextValue = useMemo(() => ({ requestOpen }), [requestOpen])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!request) return
    if (Number(answer.trim()) === question.a + question.b && answer.trim() !== "") {
      openStoreLink(request.url)
      setRequest(null)
      return
    }
    setError("Jawabannya belum tepat. Coba soal yang baru, ya.")
    setQuestion((previous) => newQuestion(previous))
    setAnswer("")
  }

  const storeName = request ? STORE_NAMES[request.store] : ""

  return (
    <ParentalGateContext.Provider value={contextValue}>
      {children}
      <Dialog open={request !== null} onOpenChange={(open) => !open && setRequest(null)}>
        <DialogContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex items-start gap-3 pr-10">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-lavender-soft text-lavender-ink">
                <ShieldCheck className="size-6" aria-hidden="true" />
              </span>
              <div>
                <DialogTitle>Khusus orang tua</DialogTitle>
                <DialogDescription className="mt-1">
                  Jawab soal ini untuk membuka <strong className="text-foreground">{request?.productName}</strong> di{" "}
                  {storeName}.
                </DialogDescription>
              </div>
            </div>

            <div className="rounded-2xl bg-muted p-4 text-center">
              <label htmlFor={inputId} className="block font-heading text-4xl font-bold tabular-nums">
                {question.a} + {question.b} = ?
              </label>
              <input
                id={inputId}
                value={answer}
                onChange={(event) => {
                  setAnswer(event.target.value.replace(/\D/g, "").slice(0, 3))
                  setError(null)
                }}
                inputMode="numeric"
                autoComplete="off"
                autoFocus
                aria-invalid={error !== null}
                aria-describedby={error ? `${inputId}-error` : undefined}
                placeholder="Jawaban"
                className="mt-3 h-14 w-32 rounded-2xl border-2 border-input bg-card text-center text-2xl font-bold outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring aria-invalid:border-destructive"
              />
              {error && (
                <p id={`${inputId}-error`} role="alert" className="mt-2 text-sm font-semibold text-destructive">
                  {error}
                </p>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Link membuka hasil pencarian di {storeName}, toko pihak ketiga, di tab baru. ToddlerTime tidak
              menjual produk ini.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </DialogClose>
              <Button type="submit" disabled={answer === ""}>
                Buka {storeName}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </ParentalGateContext.Provider>
  )
}

export function useParentalGate(): ParentalGateContextValue {
  const context = useContext(ParentalGateContext)
  if (!context) throw new Error("useParentalGate harus dipakai di dalam <ParentalGateProvider>")
  return context
}
