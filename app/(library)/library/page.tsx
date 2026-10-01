import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Clock, Heart, History, Library, Tv, type LucideIcon } from "lucide-react"

import { CollectionHeader, SectionHeader } from "@/components/layout/collection-header"
import { LoginRequired } from "@/components/layout/login-required"
import { PageContainer } from "@/components/layout/page-container"
import { VideoGrid } from "@/components/video/video-grid"
import {
  getHistory,
  getSavedVideos,
  getSessionUser,
  getSubscribedChannels,
} from "@/lib/supabase/queries"
import type { Video } from "@/types"

export const metadata: Metadata = { title: "Koleksiku", robots: { index: false } }

const PREVIEW_COUNT = 4

function EmptySection({ children }: { children: string }) {
  return (
    <p className="rounded-2xl border-2 border-dashed border-border px-5 py-6 text-center text-sm text-muted-foreground">
      {children}
    </p>
  )
}

function VideoSection({
  icon,
  title,
  href,
  videos,
  empty,
}: {
  icon: LucideIcon
  title: string
  href: string
  videos: Video[]
  empty: string
}) {
  return (
    <section aria-label={title}>
      <SectionHeader icon={icon} title={title} count={videos.length} href={href} />
      {videos.length > 0 ? <VideoGrid videos={videos.slice(0, PREVIEW_COUNT)} /> : <EmptySection>{empty}</EmptySection>}
    </section>
  )
}

export default async function LibraryPage() {
  const { supabase, user } = await getSessionUser()

  if (!user) {
    return (
      <PageContainer className="max-w-3xl py-6">
        <CollectionHeader icon={Library} title="Koleksiku" />
        <LoginRequired
          icon={Library}
          next="/library"
          description="Riwayat, Tonton Nanti, Favorit, dan Langganan tersimpan di akun orang tua. Menonton tetap bisa tanpa masuk."
        />
      </PageContainer>
    )
  }

  const [history, watchLater, favorites, channels] = await Promise.all([
    getHistory(supabase, 50),
    getSavedVideos(supabase, "watch_later", 50),
    getSavedVideos(supabase, "favorites", 50),
    getSubscribedChannels(supabase),
  ])

  return (
    <PageContainer className="flex flex-col gap-10 py-6">
      <CollectionHeader
        icon={Library}
        title="Koleksiku"
        description="Semua video simpanan si kecil di satu tempat."
        className="mb-0"
      />

      <VideoSection
        icon={History}
        title="Riwayat"
        href="/history"
        videos={history.map((entry) => entry.video)}
        empty="Belum ada video yang ditonton."
      />
      <VideoSection
        icon={Clock}
        title="Tonton Nanti"
        href="/watch-later"
        videos={watchLater}
        empty="Simpan video dengan tombol Tonton Nanti."
      />
      <VideoSection
        icon={Heart}
        title="Favorit"
        href="/favorites"
        videos={favorites}
        empty="Tandai video kesukaan dengan tombol Favorit."
      />

      <section aria-label="Langganan">
        <SectionHeader icon={Tv} title="Langganan" count={channels.length} href="/subscriptions" />
        {channels.length > 0 ? (
          <ul className="flex flex-wrap gap-4">
            {channels.map((channel) => (
              <li key={channel.id}>
                <Link
                  href={`/channel/${channel.handle}`}
                  className="flex w-20 flex-col items-center gap-2 rounded-2xl p-1 text-center outline-none focus-visible:ring-4 focus-visible:ring-ring"
                >
                  <Image
                    src={channel.avatarUrl}
                    alt=""
                    width={64}
                    height={64}
                    className="size-16 rounded-full bg-muted object-cover shadow-soft"
                  />
                  <span className="line-clamp-2 text-xs leading-tight font-semibold">{channel.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptySection>Belum mengikuti channel apa pun.</EmptySection>
        )}
      </section>
    </PageContainer>
  )
}
