"use client"

import Image from "next/image"
import {
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react"
import { ExternalLink, TriangleAlert } from "lucide-react"

import { cn } from "@/lib/utils"
import { useOptionalPlayer, type PlayerControls, type PlayerStatus } from "./player-context"
import { loadYouTubeIframeApi, YT_PLAYER_STATE, type YTPlayer } from "./youtube-iframe-api"

const TIME_UPDATE_INTERVAL_MS = 1000

type VideoPlayerProps = {
  youtubeId: string
  title: string
  thumbnailUrl?: string
  autoplay?: boolean
  onReady?: (duration: number) => void
  onPlay?: (currentTime: number) => void
  onPause?: (currentTime: number) => void
  /** Dipanggil tiap ±1 detik selama video berputar. */
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onEnded?: () => void
  onError?: (code: number) => void
  /** Kontrol dari luar: play(), pause(), seekTo(), getCurrentTime(), getDuration(). */
  ref?: Ref<PlayerControls>
  className?: string
  /** Overlay di atas player (pop up produk, hitung mundur, dll). */
  children?: ReactNode
}

/**
 * Player YouTube (IFrame Player API, mode privasi youtube-nocookie.com).
 * Event dipancarkan lewat callback DAN lewat <PlayerProvider> bila ada.
 */
export function VideoPlayer({
  youtubeId,
  title,
  thumbnailUrl,
  autoplay = false,
  onReady,
  onPlay,
  onPause,
  onTimeUpdate,
  onEnded,
  onError,
  ref,
  className,
  children,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const [status, setStatus] = useState<PlayerStatus>("loading")
  const context = useOptionalPlayer()

  const controls = useMemo<PlayerControls>(
    () => ({
      play: () => playerRef.current?.playVideo(),
      pause: () => playerRef.current?.pauseVideo(),
      seekTo: (seconds) => playerRef.current?.seekTo(Math.max(0, seconds), true),
      getCurrentTime: () => playerRef.current?.getCurrentTime() ?? 0,
      getDuration: () => playerRef.current?.getDuration() ?? 0,
    }),
    []
  )

  useImperativeHandle(ref, () => controls, [controls])

  const register = context?.register
  useEffect(() => {
    register?.(controls)
    return () => register?.(null)
  }, [register, controls])

  // Event dibungkus useEffectEvent supaya selalu memakai callback terbaru
  // tanpa membuat ulang player.
  const emitReady = useEffectEvent((duration: number) => {
    onReady?.(duration)
    context?.emit({ type: "ready", duration })
  })
  const emitPlay = useEffectEvent((currentTime: number) => {
    onPlay?.(currentTime)
    context?.emit({ type: "play", currentTime })
  })
  const emitPause = useEffectEvent((currentTime: number) => {
    onPause?.(currentTime)
    context?.emit({ type: "pause", currentTime })
  })
  const emitTimeUpdate = useEffectEvent((currentTime: number, duration: number) => {
    onTimeUpdate?.(currentTime, duration)
    context?.emit({ type: "timeupdate", currentTime, duration })
  })
  const emitEnded = useEffectEvent(() => {
    onEnded?.()
    context?.emit({ type: "ended" })
  })
  const emitError = useEffectEvent((code: number) => {
    onError?.(code)
    context?.emit({ type: "error", code })
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cancelled = false
    let player: YTPlayer | null = null
    let interval: number | undefined

    // Elemen untuk iframe dibuat manual supaya tidak bentrok dengan React.
    const mount = document.createElement("div")
    mount.className = "absolute inset-0 [&>iframe]:size-full"
    const host = document.createElement("div")
    mount.appendChild(host)
    container.prepend(mount)

    const tick = () => {
      if (player) emitTimeUpdate(player.getCurrentTime(), player.getDuration())
    }
    const stopPolling = () => {
      window.clearInterval(interval)
      interval = undefined
    }
    const startPolling = () => {
      stopPolling()
      tick()
      interval = window.setInterval(tick, TIME_UPDATE_INTERVAL_MS)
    }

    loadYouTubeIframeApi()
      .then((YT) => {
        if (cancelled) return
        player = new YT.Player(host, {
          videoId: youtubeId,
          host: "https://www.youtube-nocookie.com",
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: autoplay ? 1 : 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            iv_load_policy: 3,
            hl: "id",
            cc_lang_pref: "id",
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              if (cancelled) return
              playerRef.current = event.target
              setStatus("ready")
              emitReady(event.target.getDuration())
              if (autoplay) event.target.playVideo()
            },
            onStateChange: (event) => {
              const target = event.target
              switch (event.data) {
                case YT_PLAYER_STATE.PLAYING:
                  setStatus("playing")
                  emitPlay(target.getCurrentTime())
                  startPolling()
                  break
                case YT_PLAYER_STATE.PAUSED:
                  setStatus("paused")
                  stopPolling()
                  tick()
                  emitPause(target.getCurrentTime())
                  break
                case YT_PLAYER_STATE.BUFFERING:
                  setStatus("buffering")
                  break
                case YT_PLAYER_STATE.ENDED:
                  setStatus("ended")
                  stopPolling()
                  tick()
                  emitEnded()
                  break
              }
            },
            onError: (event) => {
              setStatus("error")
              stopPolling()
              emitError(event.data)
            },
          },
        })
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error")
          emitError(-1)
        }
      })

    return () => {
      cancelled = true
      stopPolling()
      player?.destroy()
      playerRef.current = null
      mount.remove()
    }
  }, [youtubeId, autoplay])

  return (
    <div
      ref={containerRef}
      className={cn(
        "@container relative aspect-video w-full overflow-hidden rounded-2xl bg-foreground shadow-soft",
        className
      )}
    >
      {/* Poster selama player belum siap */}
      {thumbnailUrl && status === "loading" && (
        <Image
          src={thumbnailUrl}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 70vw, 100vw"
          className="pointer-events-none object-cover"
        />
      )}
      {status === "loading" && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center" role="status">
          <span className="sr-only">Memuat video {title}</span>
          <span className="size-14 animate-spin rounded-full border-4 border-card/40 border-t-card" />
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-foreground/90 p-6 text-center text-background">
          <TriangleAlert className="size-10" aria-hidden="true" />
          <p className="font-heading text-xl font-bold">Video ini belum bisa diputar di sini</p>
          <a
            href={`https://www.youtube.com/watch?v=${youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold underline-offset-4 hover:underline"
          >
            Tonton di YouTube
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </div>
      )}

      {children}
    </div>
  )
}
