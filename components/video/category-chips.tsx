import Link from "next/link"
import type { ReactNode } from "react"
import { Sparkles } from "lucide-react"

import { chipVariants } from "@/components/ui/chip"
import { ScrollRow } from "@/components/ui/scroll-row"
import { accentClasses } from "@/lib/accent"
import { getCategories } from "@/lib/data"
import { cn } from "@/lib/utils"
import type { CategoryId } from "@/types"
import { CategoryIcon } from "./category-icon"

type ChipLink = { key: string; label: string; href: string; selected: boolean; icon: ReactNode }

/**
 * Baris chip kategori yang menempel di bawah header.
 * `hrefFor` mengatur tujuan link (beranda/kategori atau filter marketplace).
 */
export function CategoryChips({
  active,
  hrefFor = (id) => (id === "all" ? "/" : `/category/${id}`),
  sticky = true,
  label = "Kategori video",
}: {
  active: CategoryId | "all"
  hrefFor?: (id: CategoryId | "all") => string
  sticky?: boolean
  label?: string
}) {
  const chips: ChipLink[] = [
    {
      key: "all",
      label: "Semua",
      href: hrefFor("all"),
      selected: active === "all",
      icon: <Sparkles aria-hidden="true" />,
    },
    ...getCategories().map((category) => ({
      key: category.id,
      label: category.name,
      href: hrefFor(category.id),
      selected: active === category.id,
      icon: (
        <CategoryIcon
          icon={category.icon}
          className={cn(active !== category.id && accentClasses[category.color].ink)}
        />
      ),
    })),
  ]

  return (
    <nav
      aria-label={label}
      className={cn(sticky && "sticky top-16 z-30 bg-background/95 backdrop-blur")}
    >
      <ScrollRow className="px-4 py-3 md:px-6">
        {chips.map((chip) => (
          <Link
            key={chip.key}
            href={chip.href}
            data-selected={chip.selected}
            aria-current={chip.selected ? "page" : undefined}
            className={chipVariants({ color: "neutral" })}
          >
            {chip.icon}
            {chip.label}
          </Link>
        ))}
      </ScrollRow>
    </nav>
  )
}
