"use client"

import { useEffect, useRef } from "react"

import { saveWatchProgress } from "@/app/actions/interactions"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/components/ui/toaster"
import { shouldResume } from "@/lib/engagement"
import { formatDuration } from "@/lib/format"
import { usePlayer, usePlayerEvent } from "./player-context"
import { useWatchProgress } from "./watch-progress"

const SAVE_EVERY_MS = 15_000

/**
 * Simpan riwayat & posisi terakhir otomatis (hanya untuk orang tua yang
 * sudah masuk), dan lanjutkan video dari posisi terakhir saat dibuka lagi.
 */
export function HistoryTracker({ videoId, durationSeconds }: { videoId: string; durationSeconds: number }) {
  const { status } = useAuth()
  const { status: playerStatus, seekTo } = usePlayer()
  const progress = useWatchProgress()
  const { toast } = useToast()
  const enabled = status === "authenticated"

  const lastSavedAt = useRef(0)
  const lastSavedPosition = useRef<number | null>(null)
  const latestPosition = useRef(0)
  const resumed = useRef(false)

  function save(position: number) {
    // Tunggu keputusan "lanjutkan dari posisi terakhir" dulu, supaya autoplay
    // dari 0:00 tidak menimpa posisi yang tersimpan.
    if (!enabled || !resumed.current) return
    const rounded = Math.round(position)
    lastSavedAt.current = Date.now()
    if (rounded === lastSavedPosition.current) return
    lastSavedPosition.current = rounded
    progress.setPosition(videoId, rounded)
    void saveWatchProgress(videoId, rounded)
  }

  usePlayerEvent((event) => {
    switch (event.type) {
      case "play":
        latestPosition.current = event.currentTime
        // Catat ke riwayat segera saat mulai menonton.
        if (lastSavedPosition.current === null) save(event.currentTime)
        break
      case "timeupdate":
        latestPosition.current = event.currentTime
        if (Date.now() - lastSavedAt.current >= SAVE_EVERY_MS) save(event.currentTime)
        break
      case "pause":
        latestPosition.current = event.currentTime
        save(event.currentTime)
        break
      case "ended":
        latestPosition.current = durationSeconds
        save(durationSeconds)
        break
    }
  })

  // Lanjutkan dari posisi terakhir (sekali), begitu player & riwayat siap.
  const savedPosition = progress.getPosition(videoId)
  const playerReady = playerStatus !== "loading" && playerStatus !== "error"
  useEffect(() => {
    if (resumed.current || !enabled || !progress.loaded || !playerReady) return
    resumed.current = true
    if (savedPosition === undefined || !shouldResume(savedPosition, durationSeconds)) return
    if (latestPosition.current > 3) return // anak sudah menonton dari awal
    seekTo(savedPosition)
    latestPosition.current = savedPosition
    lastSavedPosition.current = savedPosition
    toast(`Melanjutkan dari ${formatDuration(savedPosition)}`)
  }, [enabled, progress.loaded, playerReady, savedPosition, durationSeconds, seekTo, toast])

  // Simpan posisi terakhir saat tab disembunyikan atau halaman ditinggalkan.
  const saveLatest = useRef(save)
  useEffect(() => {
    saveLatest.current = save
  })
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden" && latestPosition.current > 0) {
        saveLatest.current(latestPosition.current)
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
      if (latestPosition.current > 0) saveLatest.current(latestPosition.current)
    }
  }, [])

  return null
}
