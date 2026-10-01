"use client"

import { useId, useState, type ReactNode } from "react"

/** Kotak deskripsi ala YouTube: ringkas, klik untuk melihat selengkapnya. */
export function DescriptionBox({
  meta,
  description,
  details,
}: {
  /** Baris tebal di atas (views, tanggal). */
  meta: ReactNode
  description: string
  /** Isi tambahan saat dibuka (tag, kategori). */
  details?: ReactNode
}) {
  const [expanded, setExpanded] = useState(false)
  const contentId = useId()

  return (
    <div className="rounded-2xl bg-muted p-4 text-sm">
      <p className="font-bold">{meta}</p>
      <div id={contentId} className="mt-1">
        <p className={expanded ? "whitespace-pre-line" : "line-clamp-2"}>
          {description || "Tidak ada deskripsi."}
        </p>
        {expanded && details && <div className="mt-4">{details}</div>}
      </div>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-controls={contentId}
        className="mt-2 rounded-md font-bold outline-none hover:underline focus-visible:ring-4 focus-visible:ring-ring"
      >
        {expanded ? "Tampilkan lebih sedikit" : "Selengkapnya"}
      </button>
    </div>
  )
}
