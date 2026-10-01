import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ExternalLink } from "lucide-react"

import { ProductCard } from "@/components/marketplace/product-card"
import { ParentalPlayerBridge } from "@/components/parental/player-bridge"
import { productAnchorId } from "@/components/marketplace/product-anchor"
import { StoreDisclaimer } from "@/components/marketplace/store-disclaimer"
import { SubscribeButton, SubscriberCount, SubscriptionProvider } from "@/components/interactions/subscription"
import { Badge } from "@/components/ui/badge"
import { CommentsSection } from "@/components/video/comments-section"
import { CompactVideoCard } from "@/components/video/compact-video-card"
import { DescriptionBox } from "@/components/video/description-box"
import { HistoryTracker } from "@/components/video/history-tracker"
import { PlayerProvider } from "@/components/video/player-context"
import { WatchActions } from "@/components/video/watch-actions"
import { WatchPlayer } from "@/components/video/watch-player"
import {
  getCategoryById,
  getChannelById,
  getProductsForVideo,
  getUpNextVideos,
  getVideoBySlug,
  getVideos,
} from "@/lib/data"
import { formatDate, formatNumber } from "@/lib/format"

export const dynamicParams = false
export const revalidate = 86400

export function generateStaticParams() {
  return getVideos().map((video) => ({ slug: video.slug }))
}

export async function generateMetadata({ params }: PageProps<"/watch/[slug]">): Promise<Metadata> {
  const video = getVideoBySlug((await params).slug)
  if (!video) return {}
  const channel = getChannelById(video.channelId)
  const description = video.description || `Tonton "${video.title}" dari ${channel?.name ?? "YouTube"} di ToddlerTime.`
  const image = { url: video.thumbnailUrl, width: 1280, height: 720, alt: video.title }
  return {
    title: video.title,
    description,
    alternates: { canonical: `/watch/${video.slug}` },
    openGraph: {
      type: "video.other",
      title: video.title,
      description,
      url: `/watch/${video.slug}`,
      images: [image],
      videos: [{ url: `https://www.youtube-nocookie.com/embed/${video.youtubeId}`, width: 1280, height: 720 }],
    },
    twitter: { card: "summary_large_image", title: video.title, description, images: [image] },
  }
}

export default async function WatchPage({ params }: PageProps<"/watch/[slug]">) {
  const video = getVideoBySlug((await params).slug)
  if (!video) notFound()

  const channel = getChannelById(video.channelId)
  const category = getCategoryById(video.category)
  const products = getProductsForVideo(video)
  const upNext = getUpNextVideos(video)
  const next = upNext[0]
  const nextChannel = next ? getChannelById(next.channelId) : undefined
  const youtubeUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`

  return (
    // key: player & overlay dibuat ulang saat pindah video
    <PlayerProvider key={video.youtubeId}>
      <div className="mx-auto grid w-full max-w-[1760px] gap-x-6 px-4 pt-4 pb-6 md:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:grid-rows-[auto_1fr] xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        {/* Kolom kiri: player sampai produk */}
        <div className="min-w-0">
          <WatchPlayer
            video={{ youtubeId: video.youtubeId, title: video.title, thumbnailUrl: video.thumbnailUrl }}
            next={
              next
                ? {
                    slug: next.slug,
                    title: next.title,
                    thumbnailUrl: next.thumbnailUrl,
                    channelName: nextChannel?.name ?? "",
                  }
                : null
            }
            product={
              products[0]
                ? {
                    id: products[0].id,
                    name: products[0].name,
                    priceIdr: products[0].priceIdr,
                    imageUrl: products[0].imageUrl,
                  }
                : null
            }
          />
          <HistoryTracker videoId={video.id} durationSeconds={video.durationSeconds} />
          <ParentalPlayerBridge />

          <h1 className="mt-4 font-sans text-xl leading-snug font-bold sm:text-2xl">{video.title}</h1>

          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {channel && (
              <SubscriptionProvider
                channelId={channel.id}
                channelName={channel.name}
                baseSubscribers={channel.baseSubscribers}
              >
                <div className="flex items-center gap-3">
                  <Link href={`/channel/${channel.handle}`} className="shrink-0 rounded-full" tabIndex={-1} aria-hidden="true">
                    <Image
                      src={channel.avatarUrl}
                      alt=""
                      width={44}
                      height={44}
                      className="size-11 rounded-full bg-muted object-cover"
                    />
                  </Link>
                  <div className="mr-2 min-w-0">
                    <Link
                      href={`/channel/${channel.handle}`}
                      className="block truncate rounded-md font-bold outline-none hover:underline focus-visible:ring-4 focus-visible:ring-ring"
                    >
                      {channel.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      <SubscriberCount />
                    </p>
                  </div>
                  <div className="ml-auto lg:ml-0">
                    <SubscribeButton />
                  </div>
                </div>
              </SubscriptionProvider>
            )}
            <WatchActions videoId={video.id} views={video.views} title={video.title} />
          </div>

          <div className="mt-4">
            <DescriptionBox
              meta={`${formatNumber(video.views)} x ditonton • ${formatDate(video.publishedAt)}`}
              description={video.description}
              details={
                <div className="flex flex-col gap-3">
                  {category && (
                    <p>
                      Kategori:{" "}
                      <Link href={`/category/${category.id}`} className="font-bold underline-offset-4 hover:underline">
                        {category.name}
                      </Link>
                    </p>
                  )}
                  {video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {video.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="bg-card">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              }
            />
            <p className="mt-2 px-1 text-xs text-muted-foreground">
              Video oleh{" "}
              <span className="font-semibold text-foreground">{channel?.name ?? "kreator YouTube"}</span>, diputar
              dari YouTube.{" "}
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 font-semibold underline-offset-4 hover:underline"
              >
                Buka di YouTube
                <ExternalLink className="size-3" aria-hidden="true" />
              </a>
            </p>
          </div>

          {products.length > 0 && (
            <section id="perlengkapan" aria-labelledby="perlengkapan-title" className="mt-8 scroll-mt-20">
              <h2 id="perlengkapan-title" className="text-xl font-bold">
                Perlengkapan di video ini
              </h2>
              <div className="@container mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:max-w-2xl">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} id={productAnchorId(product.id)} />
                ))}
              </div>
              <StoreDisclaimer className="mt-3 lg:max-w-2xl" />
            </section>
          )}
        </div>

        {/* Kanan (desktop) / bawah (mobile) */}
        <aside aria-labelledby="berikutnya-title" className="mt-8 min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0">
          <h2 id="berikutnya-title" className="mb-2 px-1.5 font-sans text-base font-bold">
            Video berikutnya
          </h2>
          <div className="flex flex-col gap-1">
            {upNext.map((item) => (
              <CompactVideoCard key={item.id} video={item} />
            ))}
          </div>
        </aside>

        <div className="min-w-0 lg:col-start-1">
          <CommentsSection videoId={video.id} />
        </div>
      </div>
    </PlayerProvider>
  )
}
