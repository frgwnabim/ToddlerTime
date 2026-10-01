import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"

import { EmptyState } from "@/components/layout/empty-state"
import { Mascot } from "@/components/layout/mascot"
import { PageContainer } from "@/components/layout/page-container"
import { SubscribeButton, SubscriberCount, SubscriptionProvider } from "@/components/interactions/subscription"
import { VideoGrid } from "@/components/video/video-grid"
import { accentClasses, accentForId } from "@/lib/accent"
import { getChannelByHandle, getChannels, getVideosByChannel } from "@/lib/data"
import { cn } from "@/lib/utils"

export const dynamicParams = false
export const revalidate = 86400

export function generateStaticParams() {
  return getChannels().map((channel) => ({ handle: channel.handle }))
}

export async function generateMetadata({ params }: PageProps<"/channel/[handle]">): Promise<Metadata> {
  const { handle } = await params
  const channel = getChannelByHandle(handle)
  if (!channel) return {}
  const description = channel.description || `Video dari ${channel.name} di ToddlerTime.`
  return {
    title: channel.name,
    description,
    alternates: { canonical: `/channel/${channel.handle}` },
    openGraph: {
      type: "profile",
      title: channel.name,
      description,
      images: [{ url: channel.avatarUrl, alt: channel.name }],
    },
    twitter: { card: "summary" },
  }
}

export default async function ChannelPage({ params }: PageProps<"/channel/[handle]">) {
  const { handle } = await params
  const channel = getChannelByHandle(handle)
  if (!channel) notFound()

  const videos = getVideosByChannel(channel.id)
  const accent = accentClasses[accentForId(channel.id)]

  return (
    <PageContainer className="max-w-6xl">
      {/* Banner dekoratif (YouTube Data API tidak dipakai untuk banner) */}
      <div
        className={cn(
          "relative h-28 overflow-hidden rounded-3xl bg-linear-to-br sm:h-40 lg:h-48",
          accent.banner
        )}
        aria-hidden="true"
      >
        <div className="absolute -top-10 -left-6 size-40 rounded-full bg-card/40" />
        <div className="absolute -right-8 -bottom-16 size-56 rounded-full bg-card/30" />
        <div className="absolute top-6 right-1/3 size-6 rounded-full bg-card/50" />
        <Mascot mood="happy" className="absolute right-6 bottom-3 size-16 opacity-90 sm:right-12 sm:size-24" />
      </div>

      <SubscriptionProvider
        channelId={channel.id}
        channelName={channel.name}
        baseSubscribers={channel.baseSubscribers}
      >
        <div className="mt-5 flex flex-col gap-4 sm:mt-6 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center gap-4 sm:contents">
            <Image
              src={channel.avatarUrl}
              alt=""
              width={128}
              height={128}
              priority
              className="size-20 shrink-0 rounded-full bg-muted object-cover shadow-soft sm:size-32"
            />
            <div className="min-w-0 sm:flex-1">
              <h1 className="text-2xl leading-tight font-bold sm:text-4xl">{channel.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                <span className="font-semibold text-foreground">@{channel.handle}</span>
                {" • "}
                <SubscriberCount />
                {" • "}
                {videos.length} video
              </p>
              {channel.description && (
                <p className="mt-2 line-clamp-2 hidden max-w-2xl text-sm text-muted-foreground sm:block">
                  {channel.description}
                </p>
              )}
              <SubscribeButton className="mt-4 hidden sm:inline-flex" />
            </div>
          </div>
          <SubscribeButton className="w-full sm:hidden" />
        </div>
      </SubscriptionProvider>

      <div className="mt-8 border-b">
        <h2 className="-mb-px inline-block border-b-[3px] border-foreground px-1 pb-3 font-sans text-base font-bold">
          Video
        </h2>
      </div>

      <div className="mt-6">
        {videos.length > 0 ? (
          <VideoGrid videos={videos} showChannel={false} />
        ) : (
          <EmptyState mood="sleepy" title="Belum ada video" description="Channel ini belum punya video di ToddlerTime." />
        )}
      </div>
    </PageContainer>
  )
}
