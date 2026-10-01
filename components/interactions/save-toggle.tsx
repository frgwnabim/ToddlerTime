"use client"

import { Clock, ClockCheck, Heart } from "lucide-react"

import { setSaved, type SavedList } from "@/app/actions/interactions"
import { useRequireAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import { pillButton } from "./styles"
import { useOwnedToggle } from "./use-owned-toggle"

const COPY: Record<SavedList, { label: string; activeLabel: string; href: string; reason: string }> = {
  watch_later: {
    label: "Tonton Nanti",
    activeLabel: "Tersimpan",
    href: "/watch-later",
    reason: "Masuk untuk menyimpan video ke Tonton Nanti.",
  },
  favorites: {
    label: "Favorit",
    activeLabel: "Favorit",
    href: "/favorites",
    reason: "Masuk untuk menyimpan video ke Favorit si kecil.",
  },
}

/** Toggle Tonton Nanti / Favorit dengan ikon jelas dan toast konfirmasi. */
export function SaveToggle({ list, videoId }: { list: SavedList; videoId: string }) {
  const requireAuth = useRequireAuth()
  const { toast } = useToast()
  const copy = COPY[list]
  const { active, pending, toggle } = useOwnedToggle(`${list}:${videoId}`, async (supabase) => {
    const { data } = await supabase.from(list).select("video_id").eq("video_id", videoId).maybeSingle()
    return data !== null
  })

  function handleClick() {
    requireAuth(
      () =>
        toggle(
          (next) => setSaved(list, videoId, next),
          (next) =>
            next
              ? toast(`Disimpan ke ${copy.label}`, { action: { label: "Lihat", href: copy.href } })
              : toast(`Dihapus dari ${copy.label}`)
        ),
      copy.reason
    )
  }

  const Icon = list === "favorites" ? Heart : active ? ClockCheck : Clock

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      disabled={pending}
      className={cn(
        pillButton,
        active
          ? list === "favorites"
            ? "bg-peach-soft text-peach-ink hover:bg-peach-soft"
            : "bg-sky-soft text-sky-ink hover:bg-sky-soft"
          : "bg-muted"
      )}
    >
      <Icon className={cn("size-5", active && list === "favorites" && "fill-current")} aria-hidden="true" />
      {active ? copy.activeLabel : copy.label}
    </button>
  )
}
