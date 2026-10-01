"use client"

import { useEffect, useId, useOptimistic, useState, useTransition, type FormEvent } from "react"
import { MessageCircle, Trash2 } from "lucide-react"

import { addComment, deleteComment, type CommentView } from "@/app/actions/interactions"
import { useAuth } from "@/components/auth/auth-provider"
import { UserAvatar } from "@/components/auth/user-avatar"
import { Mascot } from "@/components/layout/mascot"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/toaster"
import { MAX_COMMENT_LENGTH } from "@/lib/engagement"
import { formatRelativeTime } from "@/lib/format"
import { containsProfanity, PROFANITY_MESSAGE } from "@/lib/profanity"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 50

type ListedComment = CommentView & { pending?: boolean }
type CommentChange = { type: "add"; comment: ListedComment } | { type: "remove"; id: string }

function applyChange(list: ListedComment[], change: CommentChange): ListedComment[] {
  return change.type === "add" ? [change.comment, ...list] : list.filter((comment) => comment.id !== change.id)
}

/** Komentar: terbaru di atas, tambah & hapus milik sendiri (optimistic). */
export function CommentsSection({ videoId }: { videoId: string }) {
  const { status, user, displayName, profile, requireAuth } = useAuth()
  const { toast } = useToast()
  const [comments, setComments] = useState<ListedComment[] | null>(null)
  const [optimisticComments, applyOptimistic] = useOptimistic(comments ?? [], applyChange)
  const [content, setContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const inputId = useId()

  useEffect(() => {
    let cancelled = false
    createClient()
      .rpc("get_video_comments", { p_video_id: videoId, p_limit: PAGE_SIZE })
      .then(({ data }) => {
        if (cancelled) return
        setComments(
          (data ?? []).map((row) => ({
            id: row.id,
            userId: row.user_id,
            content: row.content,
            createdAt: row.created_at,
            authorName: row.author_name ?? "Ayah/Bunda",
            authorAvatar: row.author_avatar,
          }))
        )
      })
    return () => {
      cancelled = true
    }
  }, [videoId])

  const trimmed = content.trim()
  const hasProfanity = trimmed.length > 0 && containsProfanity(trimmed)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user || !trimmed) return
    if (hasProfanity) return setError(PROFANITY_MESSAGE)

    const draft = trimmed
    const temp: ListedComment = {
      id: `pending-${Date.now()}`,
      userId: user.id,
      content: draft,
      createdAt: new Date().toISOString(),
      authorName: displayName,
      authorAvatar: profile?.avatar_url ?? null,
      pending: true,
    }
    setContent("")
    setError(null)
    startTransition(async () => {
      applyOptimistic({ type: "add", comment: temp })
      const result = await addComment(videoId, draft)
      if (result.ok) {
        setComments((current) => [result.data, ...(current ?? [])])
        toast("Komentar terkirim")
      } else {
        setContent(draft)
        setError(result.error)
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      applyOptimistic({ type: "remove", id })
      const result = await deleteComment(id)
      if (result.ok) {
        setComments((current) => (current ?? []).filter((comment) => comment.id !== id))
        toast("Komentar dihapus")
      } else {
        toast(result.error, { variant: "error" })
      }
    })
  }

  const count = optimisticComments.length
  const remaining = MAX_COMMENT_LENGTH - content.length

  return (
    <section aria-labelledby="komentar-title" className="mt-10">
      <h2 id="komentar-title" className="text-xl font-bold">
        Komentar{" "}
        <span className="font-sans text-base font-semibold text-muted-foreground">
          {comments === null ? "" : count >= PAGE_SIZE ? `${PAGE_SIZE}+` : count}
        </span>
      </h2>

      {status === "authenticated" && user ? (
        <form className="mt-4 flex items-start gap-3" onSubmit={handleSubmit}>
          <UserAvatar name={displayName} avatarUrl={profile?.avatar_url} />
          <div className="flex-1">
            <label htmlFor={inputId} className="sr-only">
              Tulis komentar
            </label>
            <textarea
              id={inputId}
              value={content}
              onChange={(event) => {
                setContent(event.target.value.slice(0, MAX_COMMENT_LENGTH))
                setError(null)
              }}
              maxLength={MAX_COMMENT_LENGTH}
              rows={2}
              placeholder="Tulis komentar yang baik..."
              aria-invalid={hasProfanity || error !== null}
              aria-describedby={`${inputId}-help`}
              className="w-full resize-none border-b-2 border-input bg-transparent px-1 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring aria-invalid:border-destructive"
            />
            <div className="mt-2 flex items-start justify-between gap-3">
              <p
                id={`${inputId}-help`}
                role={error || hasProfanity ? "alert" : undefined}
                className={cn("text-xs", error || hasProfanity ? "font-semibold text-destructive" : "text-muted-foreground")}
              >
                {error ?? (hasProfanity ? PROFANITY_MESSAGE : `${remaining} karakter tersisa`)}
              </p>
              <div className="flex shrink-0 gap-2">
                {content && (
                  <Button type="button" size="sm" variant="ghost" onClick={() => setContent("")}>
                    Batal
                  </Button>
                )}
                <Button type="submit" size="sm" disabled={!trimmed || hasProfanity}>
                  Kirim
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mt-4 flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sky-soft">
            <Mascot className="size-7" />
          </span>
          <button
            type="button"
            onClick={() => requireAuth(undefined, "Masuk untuk menulis komentar yang baik di video ini.")}
            disabled={status === "loading"}
            className="h-11 flex-1 border-b-2 border-input px-1 text-left text-muted-foreground transition-colors outline-none hover:border-sky focus-visible:border-ring"
          >
            Tulis komentar yang baik...
          </button>
        </div>
      )}

      {comments === null ? (
        <div className="mt-8 flex flex-col gap-6" aria-label="Memuat komentar" role="status">
          {[0, 1].map((index) => (
            <div key={index} className="flex gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : optimisticComments.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border px-6 py-8 text-center">
          <MessageCircle className="size-8 text-lavender-ink" aria-hidden="true" />
          <p className="font-bold">Belum ada komentar</p>
          <p className="text-sm text-muted-foreground">Jadilah yang pertama memberi semangat untuk video ini.</p>
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-6">
          {optimisticComments.map((comment) => (
            <li key={comment.id} className={cn("flex gap-3", comment.pending && "opacity-60")}>
              <UserAvatar name={comment.authorName} avatarUrl={comment.authorAvatar} />
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-bold">{comment.authorName}</span>{" "}
                  <span className="text-muted-foreground">
                    {comment.pending ? "Mengirim..." : formatRelativeTime(comment.createdAt)}
                  </span>
                </p>
                <p className="mt-0.5 break-words whitespace-pre-line">{comment.content}</p>
              </div>
              {user?.id === comment.userId && !comment.pending && (
                <button
                  type="button"
                  onClick={() => handleDelete(comment.id)}
                  aria-label="Hapus komentar saya"
                  className="grid size-10 shrink-0 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
