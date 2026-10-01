import type { Metadata } from "next"
import Link from "next/link"

import { PageContainer } from "@/components/layout/page-container"
import { CategoryIcon } from "@/components/video/category-icon"
import { accentClasses } from "@/lib/accent"
import { getCategories, getVideosByCategory } from "@/lib/data"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Kategori",
  description: "Pilih kategori video untuk si kecil: hewan, lagu, kendaraan, dan lainnya.",
}

export default function CategoriesPage() {
  return (
    <PageContainer className="py-6">
      <h1 className="text-3xl font-bold">Kategori</h1>
      <p className="mt-1 text-muted-foreground">Mau nonton apa hari ini?</p>

      <ul className="mt-6 grid grid-cols-1 gap-4 @md:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4">
        {getCategories().map((category) => {
          const accent = accentClasses[category.color]
          const count = getVideosByCategory(category.id).length
          return (
            <li key={category.id}>
              <Link
                href={`/category/${category.id}`}
                className={cn(
                  "group flex h-full items-center gap-4 rounded-3xl p-5 transition-all duration-300 outline-none hover:-translate-y-0.5 hover:shadow-lift focus-visible:ring-4 focus-visible:ring-ring",
                  accent.soft
                )}
              >
                <span
                  className={cn(
                    "grid size-16 shrink-0 place-items-center rounded-2xl shadow-soft transition-transform duration-300 group-hover:scale-105",
                    accent.fill
                  )}
                >
                  <CategoryIcon icon={category.icon} className="size-8" />
                </span>
                <span className="min-w-0">
                  <span className="block font-heading text-xl leading-tight font-bold text-foreground">
                    {category.name}
                  </span>
                  <span className="mt-0.5 block text-sm">{count} video</span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </PageContainer>
  )
}
