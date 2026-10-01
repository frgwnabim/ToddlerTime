import "server-only"

import { getChannelById, getVideoById, getVideosByChannel } from "@/lib/data"
import type { Channel, Video } from "@/types"
import { createClient } from "./server"

// Query data milik user untuk halaman koleksi (Server Component).
// Semua query tunduk pada RLS: hanya data milik user yang sedang masuk.

export async function getSessionUser() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  return { supabase, user: data.user }
}

type Supabase = Awaited<ReturnType<typeof createClient>>

export type HistoryEntry = { video: Video; positionSeconds: number; watchedAt: string }

export async function getHistory(supabase: Supabase, limit = 200): Promise<HistoryEntry[]> {
  const { data } = await supabase
    .from("watch_history")
    .select("video_id, last_position_seconds, updated_at")
    .order("updated_at", { ascending: false })
    .limit(limit)
  return (data ?? []).flatMap((row) => {
    const video = getVideoById(row.video_id)
    return video ? [{ video, positionSeconds: row.last_position_seconds, watchedAt: row.updated_at }] : []
  })
}

export async function getSavedVideos(
  supabase: Supabase,
  list: "watch_later" | "favorites",
  limit = 200
): Promise<Video[]> {
  const { data } = await supabase
    .from(list)
    .select("video_id, created_at")
    .order("created_at", { ascending: false })
    .limit(limit)
  return (data ?? []).flatMap((row) => getVideoById(row.video_id) ?? [])
}

export async function getSubscribedChannels(supabase: Supabase): Promise<Channel[]> {
  const { data } = await supabase
    .from("subscriptions")
    .select("channel_id, created_at")
    .order("created_at", { ascending: false })
  return (data ?? []).flatMap((row) => getChannelById(row.channel_id) ?? [])
}

/** Video terbaru dari channel yang di-subscribe. */
export function latestVideosFrom(channels: Channel[]): Video[] {
  return channels
    .flatMap((channel) => getVideosByChannel(channel.id))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}
