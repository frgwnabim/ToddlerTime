"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Baris yang bisa di-scroll horizontal. Di layar dengan pointer, tombol panah
 * muncul di sisi yang masih punya konten tersembunyi.
 */
export function ScrollRow({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  function update() {
    const el = ref.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(() => update())
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  function scrollBy(direction: 1 | -1) {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: "smooth" })
  }

  const arrow =
    "absolute top-1/2 z-10 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-card text-foreground shadow-soft transition-colors hover:bg-muted pointer-fine:grid"

  return (
    <div className="relative">
      <div
        ref={ref}
        onScroll={update}
        className={cn("flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}
      >
        {children}
      </div>
      {canLeft && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-linear-to-r from-background to-transparent" />
          <button type="button" onClick={() => scrollBy(-1)} aria-label="Geser ke kiri" className={cn(arrow, "left-2")}>
            <ChevronLeft className="size-5" />
          </button>
        </>
      )}
      {canRight && (
        <>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-linear-to-l from-background to-transparent" />
          <button type="button" onClick={() => scrollBy(1)} aria-label="Geser ke kanan" className={cn(arrow, "right-2")}>
            <ChevronRight className="size-5" />
          </button>
        </>
      )}
    </div>
  )
}
