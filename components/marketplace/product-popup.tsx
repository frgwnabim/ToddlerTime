"use client"

import Image from "next/image"
import { useState } from "react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { usePlayer, usePlayerEvent } from "@/components/video/player-context"
import { formatPrice } from "@/lib/format"
import type { Product } from "@/types"
import { productAnchorId } from "./product-anchor"

const SHOW_AFTER_SECONDS = 10
const DISMISSED_KEY = "toddlertime-dismissed-product-popups"

export type PopupProduct = Pick<Product, "id" | "name" | "priceIdr" | "imageUrl">

function readDismissed(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? "[]")
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function rememberDismissed(youtubeId: string) {
  try {
    const next = [...new Set([...readDismissed(), youtubeId])].slice(-200)
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(next))
  } catch {
    // Penyimpanan diblokir: pop up tetap tertutup untuk sesi ini.
  }
}

/**
 * Kartu produk kecil di pojok player, muncul setelah ±10 detik menonton.
 * Setelah ditutup, tidak muncul lagi untuk video yang sama.
 */
export function ProductPopup({ youtubeId, product }: { youtubeId: string; product: PopupProduct }) {
  const { status, pause } = usePlayer()
  const [phase, setPhase] = useState<"waiting" | "visible" | "hidden">("waiting")

  usePlayerEvent((event) => {
    if (phase !== "waiting" || event.type !== "timeupdate" || event.currentTime < SHOW_AFTER_SECONDS) return
    setPhase(readDismissed().includes(youtubeId) ? "hidden" : "visible")
  })

  if (phase !== "visible" || status === "ended") return null

  function handleView() {
    pause()
    setPhase("hidden")
    const card = document.getElementById(productAnchorId(product.id))
    if (!card) return
    card.scrollIntoView({ behavior: "smooth", block: "center" })
    card.dataset.highlight = "true"
    window.setTimeout(() => delete card.dataset.highlight, 2200)
  }

  function handleClose() {
    rememberDismissed(youtubeId)
    setPhase("hidden")
  }

  return (
    <div
      role="complementary"
      aria-label="Perlengkapan di video ini"
      className="absolute bottom-14 left-3 z-10 flex max-w-[calc(100%-1.5rem)] items-center gap-2.5 rounded-2xl bg-card/95 p-2 pr-2.5 text-card-foreground shadow-lift ring-1 ring-border backdrop-blur animate-in fade-in-0 slide-in-from-bottom-3 duration-500 @lg:bottom-16 @lg:left-4"
    >
      <Image
        src={product.imageUrl}
        alt=""
        width={56}
        height={42}
        className="h-10 w-12 shrink-0 rounded-xl bg-muted object-cover @lg:h-12 @lg:w-16"
      />
      <div className="min-w-0">
        <p className="hidden max-w-44 truncate text-sm leading-tight font-bold @md:block">{product.name}</p>
        <p className="text-sm font-bold text-peach-ink">{formatPrice(product.priceIdr)}</p>
      </div>
      <Button size="sm" variant="peach" onClick={handleView} className="shrink-0">
        Lihat
      </Button>
      <button
        type="button"
        onClick={handleClose}
        aria-label="Tutup info produk"
        className="absolute -top-2.5 -right-2.5 grid size-7 place-items-center rounded-full bg-card text-muted-foreground shadow-soft ring-1 ring-border transition-colors after:absolute after:-inset-2 hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
