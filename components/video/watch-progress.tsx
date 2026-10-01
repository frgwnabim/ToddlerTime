"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

import { useAuth } from "@/components/auth/auth-provider"
import { watchProgressRatio } from "@/lib/engagement"
import { createClient } from "@/lib/supabase/client"

type WatchProgressContextValue = {
  /** True setelah riwayat user selesai dimuat. */
  loaded: boolean
  getPosition(videoId: string): number | undefined
  setPosition(videoId: string, seconds: number): void
  remove(videoId: string | null): void
}

const WatchProgressContext = createContext<WatchProgressContextValue | null>(null)

const HISTORY_LIMIT = 500

/** Posisi terakhir tiap video yang pernah ditonton (untuk progress bar & lanjut menonton). */
export function WatchProgressProvider({ children }: { children: ReactNode }) {
  const { status, user } = useAuth()
  const userId = user?.id
  const [positions, setPositions] = useState<Map<string, number>>(() => new Map())
  const [loadedFor, setLoadedFor] = useState<string | null>(null)

  useEffect(() => {
    if (status !== "authenticated" || !userId) return
    let cancelled = false
    createClient()
      .from("watch_history")
      .select("video_id, last_position_seconds")
      .order("updated_at", { ascending: false })
      .limit(HISTORY_LIMIT)
      .then(({ data }) => {
        if (cancelled) return
        setPositions(new Map((data ?? []).map((row) => [row.video_id, row.last_position_seconds])))
        setLoadedFor(userId)
      })
    return () => {
      cancelled = true
    }
  }, [status, userId])

  const setPosition = useCallback((videoId: string, seconds: number) => {
    setPositions((current) => new Map(current).set(videoId, seconds))
  }, [])

  const remove = useCallback((videoId: string | null) => {
    setPositions((current) => {
      if (videoId === null) return new Map()
      const next = new Map(current)
      next.delete(videoId)
      return next
    })
  }, [])

  // Data milik user lain (setelah keluar / ganti akun) tidak dipakai.
  const active = status === "authenticated" && loadedFor === userId
  const value = useMemo<WatchProgressContextValue>(
    () => ({
      loaded: active,
      getPosition: (videoId) => (active ? positions.get(videoId) : undefined),
      setPosition,
      remove,
    }),
    [active, positions, setPosition, remove]
  )

  return <WatchProgressContext.Provider value={value}>{children}</WatchProgressContext.Provider>
}

export function useWatchProgress(): WatchProgressContextValue {
  const context = useContext(WatchProgressContext)
  if (!context) throw new Error("useWatchProgress harus dipakai di dalam <WatchProgressProvider>")
  return context
}

/** Bar tipis di bawah thumbnail untuk video yang pernah ditonton. */
export function WatchProgressBar({ videoId, durationSeconds }: { videoId: string; durationSeconds: number }) {
  const { getPosition } = useWatchProgress()
  const position = getPosition(videoId)
  if (position === undefined) return null
  const ratio = Math.max(0.04, watchProgressRatio(position, durationSeconds))

  return (
    <div
      className="absolute inset-x-0 bottom-0 h-1.5 bg-foreground/25"
      role="progressbar"
      aria-label="Sudah ditonton"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(ratio * 100)}
    >
      <div className="h-full bg-peach" style={{ width: `${ratio * 100}%` }} />
    </div>
  )
}
