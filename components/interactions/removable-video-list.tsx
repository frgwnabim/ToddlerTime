"use client"

import { useRouter } from "next/navigation"
import { useOptimistic, useState, useTransition, type ReactNode } from "react"
import { Trash2, X } from "lucide-react"

import { removeHistory, setSaved, type ActionResult } from "@/app/actions/interactions"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/toaster"
import { useWatchProgress } from "@/components/video/watch-progress"
import { cn } from "@/lib/utils"

export type RemovableKind = "history" | "watch_later" | "favorites"

const LABELS: Record<RemovableKind, { remove: string; removed: string }> = {
  history: { remove: "Hapus dari riwayat", removed: "Dihapus dari riwayat" },
  watch_later: { remove: "Hapus dari Tonton Nanti", removed: "Dihapus dari Tonton Nanti" },
  favorites: { remove: "Hapus dari Favorit", removed: "Dihapus dari Favorit" },
}

function removeOne(kind: RemovableKind, videoId: string): Promise<ActionResult> {
  return kind === "history" ? removeHistory(videoId) : setSaved(kind, videoId, false)
}

type Item = { id: string; title: string; node: ReactNode }

/**
 * Daftar video (dirender di server) dengan tombol hapus per item dan, untuk
 * riwayat, tombol "Hapus semua". Item langsung hilang (optimistic).
 */
export function RemovableVideoList({
  kind,
  items,
  layout,
  empty,
}: {
  kind: RemovableKind
  items: Item[]
  layout: "grid" | "list"
  /** Ditampilkan saat daftar kosong. */
  empty: ReactNode
}) {
  const router = useRouter()
  const { toast } = useToast()
  const progress = useWatchProgress()
  // `hidden`: sudah terhapus di server; `removed`: + yang sedang dihapus (optimistic).
  const [hidden, setHidden] = useState<Set<string>>(() => new Set())
  const hide = (current: Set<string>, id: string | "all") =>
    id === "all" ? new Set(items.map((item) => item.id)) : new Set(current).add(id)
  const [removed, addRemoved] = useOptimistic(hidden, hide)
  const [, startTransition] = useTransition()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const visible = items.filter((item) => !removed.has(item.id))

  function handleRemove(item: Item) {
    startTransition(async () => {
      addRemoved(item.id)
      const result = await removeOne(kind, item.id)
      if (!result.ok) {
        toast(result.error, { variant: "error" })
        return
      }
      setHidden((current) => hide(current, item.id))
      if (kind === "history") progress.remove(item.id)
      toast(LABELS[kind].removed)
      router.refresh()
    })
  }

  function handleClearAll() {
    setConfirmOpen(false)
    startTransition(async () => {
      addRemoved("all")
      const result = await removeHistory(null)
      if (!result.ok) {
        toast(result.error, { variant: "error" })
        return
      }
      setHidden((current) => hide(current, "all"))
      progress.remove(null)
      toast("Semua riwayat dihapus")
      router.refresh()
    })
  }

  if (visible.length === 0) return <>{empty}</>

  return (
    <>
      {kind === "history" && (
        <div className="mb-6 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setConfirmOpen(true)}>
            <Trash2 data-icon="inline-start" />
            Hapus semua riwayat
          </Button>
        </div>
      )}

      <ul
        className={cn(
          layout === "grid"
            ? "grid grid-cols-1 gap-x-5 gap-y-9 @xl:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4"
            : "flex flex-col gap-6"
        )}
      >
        {visible.map((item) => (
          <li key={item.id} className="relative">
            {item.node}
            <button
              type="button"
              onClick={() => handleRemove(item)}
              aria-label={`${LABELS[kind].remove}: ${item.title}`}
              title={LABELS[kind].remove}
              className="absolute top-2 right-2 z-10 grid size-10 place-items-center rounded-full bg-card/95 text-muted-foreground shadow-soft ring-1 ring-border transition-colors hover:text-destructive focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none"
            >
              <X className="size-5" />
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogTitle>Hapus semua riwayat?</DialogTitle>
          <DialogDescription className="mt-2 text-base">
            Semua video di riwayat dan posisi terakhir menontonnya akan dihapus. Tindakan ini tidak bisa dibatalkan.
          </DialogDescription>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleClearAll}>
              Hapus semua
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
