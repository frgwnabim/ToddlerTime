"use client"

import Link from "next/link"
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react"
import { CircleAlert, CircleCheck } from "lucide-react"

import { cn } from "@/lib/utils"

type ToastOptions = {
  /** "error" memakai warna destruktif lembut. */
  variant?: "default" | "error"
  action?: { label: string; href: string }
  /** Lama tampil (ms). */
  duration?: number
}

type ToastItem = ToastOptions & { id: number; message: string }

type ToastContextValue = { toast(message: string, options?: ToastOptions): void }

const ToastContext = createContext<ToastContextValue | null>(null)

const DURATION_MS = 3200
const MAX_TOASTS = 3

/** Toast global, dipasang di AppShell. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(0)

  const toast = useCallback((message: string, options: ToastOptions = {}) => {
    const id = nextId.current++
    setToasts((current) => [...current.slice(-(MAX_TOASTS - 1)), { id, message, ...options }])
    window.setTimeout(
      () => setToasts((current) => current.filter((item) => item.id !== id)),
      options.duration ?? DURATION_MS
    )
  }, [])

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-8"
      >
        {toasts.map((item) => {
          const Icon = item.variant === "error" ? CircleAlert : CircleCheck
          return (
            <div
              key={item.id}
              className={cn(
                "pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold shadow-lift animate-in fade-in-0 slide-in-from-bottom-2",
                item.variant === "error" ? "bg-peach-soft text-peach-ink ring-1 ring-peach" : "bg-foreground text-background"
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              <span>{item.message}</span>
              {item.action && (
                <Link
                  href={item.action.href}
                  className="ml-1 shrink-0 rounded-lg px-2 py-1 font-bold text-sky-soft underline-offset-4 hover:underline"
                >
                  {item.action.label}
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast harus dipakai di dalam <ToastProvider>")
  return context
}
