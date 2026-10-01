"use server"

// Server Actions untuk semua interaksi yang butuh akun orang tua.
// Setiap action memvalidasi input (id harus ada di data JSON), memastikan
// user sudah masuk, lalu menulis ke Supabase (RLS tetap berlaku).

import { getChannelById, getVideoById } from "@/lib/data"
import { MAX_COMMENT_LENGTH } from "@/lib/engagement"
import { containsProfanity, PROFANITY_MESSAGE } from "@/lib/profanity"
import { createClient } from "@/lib/supabase/server"

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string; code?: "auth" }

const AUTH_ERROR = { ok: false, error: "Sesi sudah berakhir. Silakan masuk lagi.", code: "auth" } as const
const GENERIC_ERROR = { ok: false, error: "Gagal menyimpan. Periksa koneksi lalu coba lagi." } as const
const INVALID_VIDEO = { ok: false, error: "Video tidak ditemukan." } as const

async function getUserClient() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  return { supabase, user: data.user }
}

// ---------------------------------------------------------------------------
// Suka / tidak suka

/** value: 1 = suka, -1 = tidak suka, 0 = hapus reaction. */
export async function setReaction(videoId: string, value: 1 | -1 | 0): Promise<ActionResult> {
  if (!getVideoById(videoId)) return INVALID_VIDEO
  if (![1, -1, 0].includes(value)) return GENERIC_ERROR
  const { supabase, user } = await getUserClient()
  if (!user) return AUTH_ERROR

  const { error } =
    value === 0
      ? await supabase.from("video_reactions").delete().eq("user_id", user.id).eq("video_id", videoId)
      : await supabase.from("video_reactions").upsert({ user_id: user.id, video_id: videoId, value })
  return error ? GENERIC_ERROR : { ok: true }
}

// ---------------------------------------------------------------------------
// Subscribe

export async function setSubscription(channelId: string, subscribed: boolean): Promise<ActionResult> {
  if (!getChannelById(channelId)) return { ok: false, error: "Channel tidak ditemukan." }
  const { supabase, user } = await getUserClient()
  if (!user) return AUTH_ERROR

  const { error } = subscribed
    ? await supabase
        .from("subscriptions")
        .upsert({ user_id: user.id, channel_id: channelId }, { onConflict: "user_id,channel_id", ignoreDuplicates: true })
    : await supabase.from("subscriptions").delete().eq("user_id", user.id).eq("channel_id", channelId)
  return error ? GENERIC_ERROR : { ok: true }
}

// ---------------------------------------------------------------------------
// Tonton Nanti & Favorit

export type SavedList = "watch_later" | "favorites"

export async function setSaved(list: SavedList, videoId: string, saved: boolean): Promise<ActionResult> {
  if (list !== "watch_later" && list !== "favorites") return GENERIC_ERROR
  if (!getVideoById(videoId)) return INVALID_VIDEO
  const { supabase, user } = await getUserClient()
  if (!user) return AUTH_ERROR

  const { error } = saved
    ? await supabase
        .from(list)
        .upsert({ user_id: user.id, video_id: videoId }, { onConflict: "user_id,video_id", ignoreDuplicates: true })
    : await supabase.from(list).delete().eq("user_id", user.id).eq("video_id", videoId)
  return error ? GENERIC_ERROR : { ok: true }
}

// ---------------------------------------------------------------------------
// Riwayat tonton

export async function saveWatchProgress(videoId: string, positionSeconds: number): Promise<ActionResult> {
  const video = getVideoById(videoId)
  if (!video) return INVALID_VIDEO
  const position = Math.round(Math.min(Math.max(0, positionSeconds), video.durationSeconds))
  if (!Number.isFinite(position)) return GENERIC_ERROR
  const { supabase, user } = await getUserClient()
  if (!user) return AUTH_ERROR

  const { error } = await supabase
    .from("watch_history")
    .upsert({ user_id: user.id, video_id: videoId, last_position_seconds: position })
  return error ? GENERIC_ERROR : { ok: true }
}

/** Hapus satu video dari riwayat, atau semua riwayat bila videoId null. */
export async function removeHistory(videoId: string | null): Promise<ActionResult> {
  if (videoId !== null && !getVideoById(videoId)) return INVALID_VIDEO
  const { supabase, user } = await getUserClient()
  if (!user) return AUTH_ERROR

  let query = supabase.from("watch_history").delete().eq("user_id", user.id)
  if (videoId) query = query.eq("video_id", videoId)
  const { error } = await query
  return error ? GENERIC_ERROR : { ok: true }
}

// ---------------------------------------------------------------------------
// Komentar

export type CommentView = {
  id: string
  userId: string
  content: string
  createdAt: string
  authorName: string
  authorAvatar: string | null
}

export async function addComment(videoId: string, rawContent: string): Promise<ActionResult<CommentView>> {
  if (!getVideoById(videoId)) return INVALID_VIDEO
  const content = rawContent.trim()
  if (!content) return { ok: false, error: "Komentar belum diisi." }
  if (content.length > MAX_COMMENT_LENGTH) {
    return { ok: false, error: `Komentar maksimal ${MAX_COMMENT_LENGTH} karakter.` }
  }
  if (containsProfanity(content)) return { ok: false, error: PROFANITY_MESSAGE }

  const { supabase, user } = await getUserClient()
  if (!user) return AUTH_ERROR

  const { data, error } = await supabase
    .from("comments")
    .insert({ user_id: user.id, video_id: videoId, content })
    .select("id, user_id, content, created_at")
    .single()
  if (error || !data) {
    return error?.code === "23514" ? { ok: false, error: PROFANITY_MESSAGE } : GENERIC_ERROR
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle()

  return {
    ok: true,
    data: {
      id: data.id,
      userId: data.user_id,
      content: data.content,
      createdAt: data.created_at,
      authorName: profile?.display_name ?? "Ayah/Bunda",
      authorAvatar: profile?.avatar_url ?? null,
    },
  }
}

export async function deleteComment(commentId: string): Promise<ActionResult> {
  if (!/^[0-9a-f-]{36}$/i.test(commentId)) return GENERIC_ERROR
  const { supabase, user } = await getUserClient()
  if (!user) return AUTH_ERROR

  // RLS memastikan hanya komentar milik sendiri yang bisa dihapus.
  const { error } = await supabase.from("comments").delete().eq("id", commentId).eq("user_id", user.id)
  return error ? GENERIC_ERROR : { ok: true }
}
