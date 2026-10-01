import Link from "next/link"
import { Clock, Heart } from "lucide-react"

import { CollectionHeader } from "@/components/layout/collection-header"
import { EmptyState } from "@/components/layout/empty-state"
import { LoginRequired } from "@/components/layout/login-required"
import { PageContainer } from "@/components/layout/page-container"
import { Button } from "@/components/ui/button"
import { VideoCard } from "@/components/video/video-card"
import { getSavedVideos, getSessionUser } from "@/lib/supabase/queries"
import { RemovableVideoList } from "./removable-video-list"

const COPY = {
  watch_later: {
    icon: Clock,
    title: "Tonton Nanti",
    description: "Video yang disimpan untuk ditonton nanti.",
    href: "/watch-later",
    guest: "Simpan video untuk ditonton nanti. Masuk dulu supaya daftarnya tersimpan.",
    emptyTitle: "Belum ada video tersimpan",
    empty: "Tekan tombol Tonton Nanti di halaman video untuk menyimpannya di sini.",
  },
  favorites: {
    icon: Heart,
    title: "Favorit",
    description: "Video kesukaan si kecil.",
    href: "/favorites",
    guest: "Kumpulkan video kesukaan si kecil. Masuk dulu supaya favoritnya tersimpan.",
    emptyTitle: "Belum ada favorit",
    empty: "Tekan tombol Favorit di halaman video untuk menyimpannya di sini.",
  },
} as const

/** Halaman /watch-later dan /favorites. */
export async function SavedVideosPage({ list }: { list: "watch_later" | "favorites" }) {
  const copy = COPY[list]
  const { supabase, user } = await getSessionUser()

  return (
    <PageContainer className="py-6">
      <CollectionHeader icon={copy.icon} title={copy.title} description={copy.description} />
      {!user ? (
        <LoginRequired icon={copy.icon} next={copy.href} description={copy.guest} />
      ) : (
        <RemovableVideoList
          kind={list}
          layout="grid"
          items={(await getSavedVideos(supabase, list)).map((video) => ({
            id: video.id,
            title: video.title,
            node: <VideoCard video={video} />,
          }))}
          empty={
            <EmptyState
              mood="happy"
              icon={copy.icon}
              title={copy.emptyTitle}
              description={copy.empty}
              action={
                <Button asChild size="lg">
                  <Link href="/">Jelajahi video</Link>
                </Button>
              }
            />
          }
        />
      )}
    </PageContainer>
  )
}
