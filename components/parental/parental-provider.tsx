"use client"

import { usePathname } from "next/navigation"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/components/ui/toaster"
import {
  emptyAllowance,
  jakartaDate,
  lockReason,
  remainingSeconds,
  toHHMM,
  WARNING_BEFORE_SECONDS,
  type DayAllowance,
  type LockReason,
  type ParentalSettings,
} from "@/lib/parental"
import { createClient } from "@/lib/supabase/client"
import { BreakScreen } from "./break-screen"
import { LockScreen } from "./lock-screen"

const SYNC_EVERY_MS = 30_000
const CLOCK_EVERY_MS = 15_000
/** Batas satu kiriman ke /api/screen-time (sama dengan server). */
const MAX_DELTA_SECONDS = 900
/** Abaikan lonjakan aneh (mis. laptop tidur) di antara dua tick player. */
const MAX_TICK_SECONDS = 65

type ParentalContextValue = {
  /** Orang tua sudah masuk & data kontrol sudah dimuat. Tamu: selalu false. */
  active: boolean
  settings: ParentalSettings | null
  secondsToday: number
  /** Sisa detik hari ini; null = tidak dibatasi. */
  remaining: number | null
  lock: LockReason | null
  breakDue: boolean
  /** Video harus berhenti: terkunci atau waktunya istirahat. */
  blocked: boolean
  /** Laporkan detik video yang benar-benar diputar. */
  trackPlayback(seconds: number): void
  /** Muat ulang pengaturan & kelonggaran (setelah diubah). */
  refresh(): void
  applyAllowance(allowance: DayAllowance): void
}

const ParentalContext = createContext<ParentalContextValue | null>(null)

/**
 * Kontrol orang tua global (dipasang di AppShell), tetap berjalan saat pindah
 * halaman: menghitung waktu tonton, sinkron ke Supabase, mengunci layar saat
 * batas habis / jam tidur, dan mengingatkan istirahat.
 */
export function ParentalControlsProvider({ children }: { children: ReactNode }) {
  const { status, user } = useAuth()
  const { toast } = useToast()
  const pathname = usePathname()
  const userId = status === "authenticated" ? user?.id : undefined

  const [loadedFor, setLoadedFor] = useState<string | null>(null)
  const [settings, setSettings] = useState<ParentalSettings | null>(null)
  const [allowance, setAllowance] = useState<DayAllowance>(() => emptyAllowance(jakartaDate()))
  const [secondsToday, setSecondsToday] = useState(0)
  const [now, setNow] = useState(0)
  const [breakDue, setBreakDue] = useState(false)
  const [breakCount, setBreakCount] = useState(0)
  const [reloadKey, setReloadKey] = useState(0)

  // Detik yang belum terkirim ke server, per tanggal (Asia/Jakarta).
  const pending = useRef({ date: "", seconds: 0 })
  const secondsRef = useRef(0)
  const sinceBreak = useRef(0)
  const warnedDate = useRef<string | null>(null)

  const active = userId !== undefined && loadedFor === userId

  // ---------------------------------------------------------------------
  // Muat pengaturan & data hari ini

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    const supabase = createClient()
    const date = jakartaDate()
    Promise.all([
      supabase
        .from("parental_settings")
        .select("daily_limit_minutes, bedtime_start, bedtime_end, break_reminder_minutes, has_pin")
        .maybeSingle(),
      supabase
        .from("screen_time")
        .select("seconds_watched, bonus_minutes, unlocked, override_until")
        .eq("date", date)
        .maybeSingle(),
    ]).then(([settingsResult, todayResult]) => {
      if (cancelled) return
      const row = settingsResult.data
      setSettings(
        row
          ? {
              dailyLimitMinutes: row.daily_limit_minutes,
              bedtimeStart: toHHMM(row.bedtime_start),
              bedtimeEnd: toHHMM(row.bedtime_end),
              breakReminderMinutes: row.break_reminder_minutes,
              hasPin: row.has_pin,
            }
          : null
      )
      const today = todayResult.data
      setAllowance({
        date,
        bonusMinutes: today?.bonus_minutes ?? 0,
        unlocked: today?.unlocked ?? false,
        overrideUntil: today?.override_until ?? null,
      })
      const unsynced = pending.current.date === date ? pending.current.seconds : 0
      secondsRef.current = (today?.seconds_watched ?? 0) + unsynced
      setSecondsToday(secondsRef.current)
      setNow(Date.now())
      setLoadedFor(userId)
    })
    return () => {
      cancelled = true
    }
  }, [userId, reloadKey])

  // ---------------------------------------------------------------------
  // Sinkron ke /api/screen-time

  const flush = useCallback((useBeacon: boolean) => {
    const { date, seconds } = pending.current
    const whole = Math.min(Math.floor(seconds), MAX_DELTA_SECONDS)
    if (whole < 1) return
    pending.current.seconds -= whole
    const restore = () => {
      if (pending.current.date === date) pending.current.seconds += whole
    }
    const body = JSON.stringify({ date, seconds: whole })

    if (useBeacon && typeof navigator.sendBeacon === "function") {
      if (!navigator.sendBeacon("/api/screen-time", new Blob([body], { type: "application/json" }))) restore()
      return
    }
    fetch("/api/screen-time", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    })
      .then((response) => {
        // 400 = tanggal sudah lewat / data tidak valid: jangan dikirim ulang.
        if (!response.ok && response.status !== 400) restore()
      })
      .catch(restore)
  }, [])

  useEffect(() => {
    if (!active) return
    const interval = window.setInterval(() => flush(false), SYNC_EVERY_MS)
    const onHide = () => {
      if (document.visibilityState === "hidden") flush(true)
    }
    const onPageHide = () => flush(true)
    document.addEventListener("visibilitychange", onHide)
    window.addEventListener("pagehide", onPageHide)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener("visibilitychange", onHide)
      window.removeEventListener("pagehide", onPageHide)
      flush(false)
    }
  }, [active, flush])

  // ---------------------------------------------------------------------
  // Jam: cek jam tidur & pergantian hari (Asia/Jakarta)

  useEffect(() => {
    if (!active) return
    const interval = window.setInterval(() => {
      setNow(Date.now())
      if (jakartaDate() !== allowance.date) {
        flush(false)
        secondsRef.current = 0
        setSecondsToday(0)
        setAllowance(emptyAllowance(jakartaDate()))
        setReloadKey((key) => key + 1)
      }
    }, CLOCK_EVERY_MS)
    return () => window.clearInterval(interval)
  }, [active, allowance.date, flush])

  // ---------------------------------------------------------------------
  // Penghitung waktu putar

  const trackPlayback = useCallback(
    (rawSeconds: number) => {
      if (!active) return
      const seconds = Math.min(Math.max(0, rawSeconds), MAX_TICK_SECONDS)
      if (seconds === 0) return

      const date = jakartaDate()
      if (pending.current.date !== date) {
        flush(false)
        pending.current = { date, seconds: 0 }
      }
      pending.current.seconds += seconds
      if (pending.current.seconds >= MAX_DELTA_SECONDS) flush(false)

      secondsRef.current += seconds
      setSecondsToday(secondsRef.current)
      setNow(Date.now())

      // Peringatan lembut 5 menit sebelum waktu habis (sekali per hari).
      const left = remainingSeconds(settings, allowance, secondsRef.current)
      if (left !== null && left > 0 && left <= WARNING_BEFORE_SECONDS && warnedDate.current !== date) {
        warnedDate.current = date
        toast(`${Math.ceil(left / 60)} menit lagi waktunya istirahat, ya. Pilih video terakhir yang paling seru!`, {
          duration: 8000,
        })
      }

      // Pengingat istirahat setiap X menit menonton.
      const breakMinutes = settings?.breakReminderMinutes
      if (breakMinutes) {
        sinceBreak.current += seconds
        if (sinceBreak.current >= breakMinutes * 60) {
          sinceBreak.current = 0
          setBreakDue(true)
          setBreakCount((count) => count + 1)
        }
      }
    },
    [active, allowance, settings, flush, toast]
  )

  const refresh = useCallback(() => setReloadKey((key) => key + 1), [])
  const applyAllowance = useCallback((next: DayAllowance) => {
    setAllowance(next)
    setNow(Date.now())
  }, [])

  const lock = active && now > 0 ? lockReason(settings, allowance, secondsToday, new Date(now)) : null
  const remaining = active ? remainingSeconds(settings, allowance, secondsToday) : null
  const showBreak = active && breakDue && !lock

  const value = useMemo<ParentalContextValue>(
    () => ({
      active,
      settings,
      secondsToday,
      remaining,
      lock,
      breakDue: showBreak,
      blocked: lock !== null || showBreak,
      trackPlayback,
      refresh,
      applyAllowance,
    }),
    [active, settings, secondsToday, remaining, lock, showBreak, trackPlayback, refresh, applyAllowance]
  )

  // Halaman /parental tidak ditutupi supaya orang tua tetap bisa mengatur.
  const onParentalPage = pathname.startsWith("/parental")

  return (
    <ParentalContext.Provider value={value}>
      {children}
      {lock && !onParentalPage && (
        <LockScreen reason={lock} hasPin={settings?.hasPin ?? false} onGranted={applyAllowance} />
      )}
      {showBreak && !onParentalPage && (
        <BreakScreen
          minutes={settings?.breakReminderMinutes ?? 0}
          tipIndex={breakCount}
          onContinue={() => {
            sinceBreak.current = 0
            setBreakDue(false)
          }}
        />
      )}
    </ParentalContext.Provider>
  )
}

export function useParentalControls(): ParentalContextValue {
  const context = useContext(ParentalContext)
  if (!context) throw new Error("useParentalControls harus dipakai di dalam <ParentalControlsProvider>")
  return context
}
