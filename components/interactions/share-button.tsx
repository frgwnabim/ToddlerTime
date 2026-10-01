"use client"

import { Share2 } from "lucide-react"

import { useToast } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import { pillButton } from "./styles"

/** Bagikan: Web Share API bila tersedia (umumnya HP), selain itu salin link. */
export function ShareButton({ title }: { title: string }) {
  const { toast } = useToast()

  async function handleShare() {
    const url = window.location.href
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url })
        return
      } catch (error) {
        // Dialog bagikan ditutup: tidak perlu pesan apa pun.
        if (error instanceof DOMException && error.name === "AbortError") return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      toast("Link video disalin")
    } catch {
      toast("Link belum bisa disalin. Salin dari bilah alamat, ya.", { variant: "error" })
    }
  }

  return (
    <button type="button" onClick={handleShare} className={cn(pillButton, "bg-muted")}>
      <Share2 className="size-5" aria-hidden="true" />
      Bagikan
    </button>
  )
}
