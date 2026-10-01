"use client"

import { useEffect, useRef } from "react"

import { usePlayer, usePlayerEvent } from "@/components/video/player-context"
import { useParentalControls } from "./parental-provider"

/**
 * Menghubungkan player halaman tonton dengan kontrol orang tua global:
 * - melaporkan detik yang BENAR-BENAR diputar (bukan buffering/pause)
 * - mem-pause video saat terkunci / waktunya istirahat, lalu melanjutkan
 *   lagi setelah dibuka.
 */
export function ParentalPlayerBridge() {
  const { blocked, trackPlayback } = useParentalControls()
  const { status, play, pause } = usePlayer()
  const lastTick = useRef<number | null>(null)
  const pausedByControls = useRef(false)

  function settle(at: number) {
    if (lastTick.current !== null) trackPlayback((at - lastTick.current) / 1000)
    lastTick.current = null
  }

  usePlayerEvent((event) => {
    const now = performance.now()
    switch (event.type) {
      case "play":
        lastTick.current = now
        if (blocked) {
          pausedByControls.current = true
          pause()
        }
        break
      case "timeupdate":
        if (status !== "playing") {
          // Buffering: jangan dihitung.
          lastTick.current = null
          break
        }
        if (lastTick.current !== null) trackPlayback((now - lastTick.current) / 1000)
        lastTick.current = now
        break
      case "pause":
      case "ended":
      case "error":
        settle(now)
        break
    }
  })

  useEffect(() => {
    if (blocked && status === "playing") {
      pausedByControls.current = true
      pause()
    } else if (!blocked && pausedByControls.current && status === "paused") {
      pausedByControls.current = false
      play()
    }
  }, [blocked, status, play, pause])

  return null
}
