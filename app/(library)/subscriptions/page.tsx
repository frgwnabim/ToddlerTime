import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Tv } from "lucide-react"

import { CollectionHeader } from "@/components/layout/collection-header"
import { EmptyState } from "@/components/layout/empty-state"
import { LoginRequired } from "@/components/layout/login-required"
import { PageContainer } from "@/components/layout/page-container"
import { Button } from "@/components/ui/button"
import { ScrollRow } from "@/components/ui/scroll-row"
import { VideoGrid } from "@/components/video/video-grid"
import { getSessionUser, getSubscribedChannels, latestVideosFrom } from "@/lib/supabase/queries"

export const metadata: Metadata = { title: "Langganan", robots: { index: false } }

export default async function SubscriptionsPage() {
  const { supabase, user } = await getSessionUser()
  const channels = user ? await getSubscribedChannels(supabase) : []

  return (
    <PageContainer className="py-6">
      <CollectionHeader icon={Tv} title="Langganan" description="Video terbaru dari channel yang diikuti." />
      {!user ? (
        <LoginRequired
          icon={Tv}
          next="/subscriptions"
          description="Ikuti channel kesukaan si kecil. Masuk dulu untuk melihat langganan."
        />
      ) : channels.length === 0 ? (
        <EmptyState
          mood="happy"
          icon={Tv}
          title="Belum ada langganan"
          description="Tekan Subscribe di halaman video atau channel untuk mengikuti channel kesukaan si kecil."
          action={
            <Button asChild size="lg">
              <Link href="/">Cari channel seru</Link>
            </Button>
          }
        />
      ) : (
        <>
          <nav aria-label="Channel yang diikuti" className="-mx-4 mb-8 md:-mx-6">
            <ScrollRow className="gap-4 px-4 md:px-6">
              {channels.map((channel) => (
                <Link
                  key={channel.id}
                  href={`/channel/${channel.handle}`}
                  className="flex w-20 shrink-0 flex-col items-center gap-2 rounded-2xl p-1 text-center outline-none focus-visible:ring-4 focus-visible:ring-ring"
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
              ))}
            </ScrollRow>
          </nav>
          <h2 className="mb-4 text-xl font-bold">Video terbaru</h2>
          <VideoGrid videos={latestVideosFrom(channels)} />
        </>
      )}
    </PageContainer>
  )
}
