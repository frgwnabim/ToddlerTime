import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { EmptyState } from "@/components/layout/empty-state"
import { PageContainer } from "@/components/layout/page-container"
import { CategoryChips } from "@/components/video/category-chips"
import { CategoryIcon } from "@/components/video/category-icon"
import { VideoGrid } from "@/components/video/video-grid"
import { accentClasses } from "@/lib/accent"
import { getCategories, getCategoryById, getVideosByCategory } from "@/lib/data"
import { cn } from "@/lib/utils"

export const dynamicParams = false
export const revalidate = 86400

export function generateStaticParams() {
  return getCategories().map((category) => ({ slug: category.id }))
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const category = getCategoryById(slug)
  return category ? { title: category.name, description: category.description } : {}
}

export default async function CategoryPage({ params }: PageProps<"/category/[slug]">) {
  const { slug } = await params
  const category = getCategoryById(slug)
  if (!category) notFound()

  const videos = getVideosByCategory(category.id)
  const accent = accentClasses[category.color]

  return (
    <>
      <CategoryChips active={category.id} />
      <PageContainer className="pt-2">
        <div className="mb-8 flex items-center gap-4">
          <span className={cn("grid size-14 shrink-0 place-items-center rounded-2xl", accent.soft)}>
            <CategoryIcon icon={category.icon} className="size-7" />
          </span>
          <div>
            <h1 className="text-3xl leading-tight font-bold">{category.name}</h1>
            <p className="text-muted-foreground">
              {category.description} · {videos.length} video
            </p>
          </div>
        </div>

        {videos.length > 0 ? (
          <VideoGrid videos={videos} />
        ) : (
          <EmptyState
            mood="sleepy"
            title="Belum ada video di sini"
            description="Video untuk kategori ini sedang disiapkan. Coba kategori lain dulu, ya!"
          />
        )}
      </PageContainer>
    </>
  )
}
