import type { Metadata } from "next"
import Link from "next/link"
import { Search, SearchX } from "lucide-react"

import { chipVariants } from "@/components/ui/chip"
import { EmptyState } from "@/components/layout/empty-state"
import { PageContainer } from "@/components/layout/page-container"
import { VideoCard } from "@/components/video/video-card"
import { searchVideos } from "@/lib/data"

const SUGGESTIONS = ["lagu anak", "hewan", "mewarnai", "mobil", "warna", "masak"]

function readQuery(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? ""
}

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const query = readQuery((await searchParams).q)
  return { title: query ? `Cari “${query}”` : "Cari video", robots: { index: false } }
}

function Suggestions() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {SUGGESTIONS.map((suggestion) => (
        <Link
          key={suggestion}
          href={`/search?q=${encodeURIComponent(suggestion)}`}
          className={chipVariants({ color: "neutral" })}
        >
          <Search aria-hidden="true" />
          {suggestion}
        </Link>
      ))}
    </div>
  )
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const query = readQuery((await searchParams).q)

  if (!query) {
    return (
      <PageContainer>
        <EmptyState
          mood="happy"
          icon={Search}
          title="Mau nonton apa hari ini?"
          description="Ketik kata kunci di kolom pencarian, atau pilih salah satu ini:"
          action={<Suggestions />}
        />
      </PageContainer>
    )
  }

  const results = searchVideos(query)

  return (
    <PageContainer className="max-w-5xl py-6">
      <h1 className="text-2xl font-bold">
        {results.length > 0 ? `${results.length} video untuk “${query}”` : `Hasil untuk “${query}”`}
      </h1>

      {results.length > 0 ? (
        <div className="mt-6 flex flex-col gap-8">
          {results.map((video, index) => (
            <VideoCard key={video.id} video={video} layout="row" priority={index < 2} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={SearchX}
          title="Yah, videonya belum ketemu"
          description={
            <>
              Tidak ada video untuk “{query}”. Coba kata lain, misalnya:
            </>
          }
          action={<Suggestions />}
        />
      )}
    </PageContainer>
  )
}
