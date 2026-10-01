"use client"

import { useEffect, useOptimistic, useState, useTransition } from "react"
import { ThumbsDown, ThumbsUp } from "lucide-react"

import { setReaction } from "@/app/actions/interactions"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/components/ui/toaster"
import { baseLikes } from "@/lib/engagement"
import { formatCompactNumber, formatNumber } from "@/lib/format"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { pillButton } from "./styles"

type Reaction = 1 | -1 | 0
type State = { reaction: Reaction; dbLikes: number }

function applyReaction(state: State, next: Reaction): State {
  const likeDelta = (next === 1 ? 1 : 0) - (state.reaction === 1 ? 1 : 0)
  return { reaction: next, dbLikes: Math.max(0, state.dbLikes + likeDelta) }
}

/** Suka / tidak suka. Jumlah suka = angka dasar (dummy) + data Supabase. */
export function ReactionButtons({ videoId, views }: { videoId: string; views: number }) {
  const { status, user, requireAuth } = useAuth()
  const { toast } = useToast()
  const userId = status === "authenticated" ? user?.id : undefined

  const [state, setState] = useState<State>({ reaction: 0, dbLikes: 0 })
  const [optimistic, addOptimistic] = useOptimistic(state, applyReaction)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (status === "loading") return
    let cancelled = false
    const supabase = createClient()
    Promise.all([
      supabase.rpc("get_video_reaction_counts", { p_video_id: videoId }),
      userId
        ? supabase.from("video_reactions").select("value").eq("video_id", videoId).maybeSingle()
        : Promise.resolve({ data: null }),
    ]).then(([counts, own]) => {
      if (cancelled) return
      setState({ reaction: own.data?.value ?? 0, dbLikes: Number(counts.data?.[0]?.likes ?? 0) })
    })
    return () => {
      cancelled = true
    }
  }, [videoId, userId, status])

  const reaction = userId ? optimistic.reaction : 0
  const likes = baseLikes(views) + optimistic.dbLikes

  function react(value: 1 | -1) {
    requireAuth(
      () => {
        const next: Reaction = reaction === value ? 0 : value
        startTransition(async () => {
          addOptimistic(next)
          const result = await setReaction(videoId, next)
          if (result.ok) setState((current) => applyReaction(current, next))
          else toast(result.error, { variant: "error" })
        })
      },
      value === 1 ? "Masuk untuk menyukai video ini." : "Masuk untuk memberi tahu kami video yang kurang disukai."
    )
  }

  return (
    <div className="flex shrink-0 items-center rounded-2xl bg-muted" role="group" aria-label="Suka atau tidak suka">
      <button
        type="button"
        onClick={() => react(1)}
        aria-pressed={reaction === 1}
        aria-label={`Suka. ${formatNumber(likes)} orang menyukai video ini`}
        disabled={pending}
        className={cn(pillButton, "rounded-r-none pr-3")}
      >
        <ThumbsUp className={cn("size-5", reaction === 1 && "fill-current text-sky-ink")} aria-hidden="true" />
        <span className="tabular-nums">{formatCompactNumber(likes)}</span>
      </button>
      <span className="h-6 w-px bg-border" aria-hidden="true" />
      <button
        type="button"
        onClick={() => react(-1)}
        aria-pressed={reaction === -1}
        aria-label="Tidak suka"
        disabled={pending}
        className={cn(pillButton, "rounded-l-none pl-3")}
      >
        <ThumbsDown className={cn("size-5", reaction === -1 && "fill-current text-peach-ink")} aria-hidden="true" />
      </button>
    </div>
  )
}
