import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

/** Judul halaman koleksi (Riwayat, Tonton Nanti, ...). */
export function CollectionHeader({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: LucideIcon
  title: string
  description?: string
  className?: string
}) {
  return (
    <div className={cn("mb-6 flex items-center gap-3", className)}>
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sky-soft text-sky-ink">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <div>
        <h1 className="text-3xl leading-tight font-bold">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
    </div>
  )
}

/** Judul section di /library dengan tautan "Lihat semua". */
export function SectionHeader({
  icon: Icon,
  title,
  count,
  href,
}: {
  icon: LucideIcon
  title: string
  count: number
  href: string
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-xl font-bold">
        <Icon className="size-5 text-sky-ink" aria-hidden="true" />
        {title}
        <span className="font-sans text-base font-semibold text-muted-foreground">{count}</span>
      </h2>
      {count > 0 && (
        <Link
          href={href}
          className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-bold text-sky-ink transition-colors outline-none hover:bg-sky-soft focus-visible:ring-4 focus-visible:ring-ring"
        >
          Lihat semua
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
