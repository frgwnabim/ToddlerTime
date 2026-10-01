"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

export type PlayerStatus = "loading" | "ready" | "playing" | "paused" | "buffering" | "ended" | "error"

export type PlayerEvent =
  | { type: "ready"; duration: number }
  | { type: "play"; currentTime: number }
  | { type: "pause"; currentTime: number }
  | { type: "timeupdate"; currentTime: number; duration: number }
  | { type: "ended" }
  | { type: "error"; code: number }

/** Kontrol player yang bisa dipanggil dari luar (batas waktu, riwayat, dll). */
export type PlayerControls = {
  play(): void
  pause(): void
  seekTo(seconds: number): void
  getCurrentTime(): number
  getDuration(): number
}

type PlayerContextValue = PlayerControls & {
  status: PlayerStatus
  currentTime: number
  duration: number
  /** Dengarkan semua event player; kembalikan fungsi untuk berhenti. */
  subscribe(listener: (event: PlayerEvent) => void): () => void
  /** Dipakai VideoPlayer untuk menghubungkan dirinya ke context. */
  register(controls: PlayerControls | null): void
  /** Dipakai VideoPlayer untuk memancarkan event. */
  emit(event: PlayerEvent): void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const controlsRef = useRef<PlayerControls | null>(null)
  const listenersRef = useRef(new Set<(event: PlayerEvent) => void>())
  const [status, setStatus] = useState<PlayerStatus>("loading")
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const emit = useCallback((event: PlayerEvent) => {
    switch (event.type) {
      case "ready":
        setStatus("ready")
        setDuration(event.duration)
        break
      case "play":
        setStatus("playing")
        setCurrentTime(event.currentTime)
        break
      case "pause":
        setStatus("paused")
        setCurrentTime(event.currentTime)
        break
      case "timeupdate":
        setCurrentTime(event.currentTime)
        setDuration(event.duration)
        break
      case "ended":
        setStatus("ended")
        break
      case "error":
        setStatus("error")
        break
    }
    for (const listener of listenersRef.current) listener(event)
  }, [])

  // Fungsi-fungsi ini stabil (tidak berubah tiap detik) supaya aman dipakai di dependency effect.
  const stable = useMemo(
    () => ({
      play: () => controlsRef.current?.play(),
      pause: () => controlsRef.current?.pause(),
      seekTo: (seconds: number) => controlsRef.current?.seekTo(seconds),
      getCurrentTime: () => controlsRef.current?.getCurrentTime() ?? 0,
      getDuration: () => controlsRef.current?.getDuration() ?? 0,
      subscribe: (listener: (event: PlayerEvent) => void) => {
        listenersRef.current.add(listener)
        return () => {
          listenersRef.current.delete(listener)
        }
      },
      register: (controls: PlayerControls | null) => {
        controlsRef.current = controls
      },
    }),
    []
  )

  const value = useMemo<PlayerContextValue>(
    () => ({ ...stable, status, currentTime, duration, emit }),
    [stable, status, currentTime, duration, emit]
  )

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

/** Akses status & kontrol player terdekat. Wajib di dalam <PlayerProvider>. */
export function usePlayer(): PlayerContextValue {
  const context = useContext(PlayerContext)
  if (!context) throw new Error("usePlayer harus dipakai di dalam <PlayerProvider>")
  return context
}

/** Versi opsional, untuk VideoPlayer yang juga bisa dipakai tanpa provider. */
export function useOptionalPlayer(): PlayerContextValue | null {
  return useContext(PlayerContext)
}

/** Jalankan `listener` untuk setiap event player. */
export function usePlayerEvent(listener: (event: PlayerEvent) => void) {
  const { subscribe } = usePlayer()
  const onEvent = useEffectEvent(listener)
  useEffect(() => subscribe((event) => onEvent(event)), [subscribe])
}
