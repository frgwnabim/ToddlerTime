import Image from "next/image"
import Link from "next/link"

import { getChannelById } from "@/lib/data"
import { formatDuration, formatDurationLabel, formatRelativeTime, formatViews } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Video } from "@/types"
import { WatchProgressBar } from "./watch-progress"

export function videoHref(video: Video) {
  return `/watch/${video.slug}`
}

type VideoCardProps = {
  video: Video
  /** "grid" untuk beranda, "row" untuk hasil pencarian (horizontal mulai sm). */
  layout?: "grid" | "row"
  /** Sembunyikan avatar & nama channel (mis. di halaman channel). */
  showChannel?: boolean
  /** Prioritaskan gambar untuk kartu di atas lipatan. */
  priority?: boolean
}

export function VideoCard({ video, layout = "grid", showChannel = true, priority = false }: VideoCardProps) {
  const channel = getChannelById(video.channelId)
  const href = videoHref(video)
  const isRow = layout === "row"
  const meta = `${formatViews(video.views)} • ${formatRelativeTime(video.publishedAt)}`

  const avatar = channel && (
    <Link
      href={`/channel/${channel.handle}`}
      tabIndex={-1}
      aria-hidden="true"
      className="shrink-0"
    >
      <Image
        src={channel.avatarUrl}
        alt=""
        width={40}
        height={40}
        className={cn("rounded-full bg-muted object-cover", isRow ? "size-6" : "size-10")}
      />
    </Link>
  )

  return (
    <article className={cn("group flex flex-col gap-3", isRow && "sm:flex-row sm:gap-5")}>
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className={cn(
          "relative block aspect-video shrink-0 overflow-hidden rounded-2xl bg-muted shadow-soft transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lift",
          isRow && "sm:w-[min(22rem,45%)]"
        )}
      >
        <Image
          src={video.thumbnailUrl}
          alt=""
          fill
          priority={priority}
          sizes={isRow ? "(min-width: 640px) 352px, 100vw" : "(min-width: 1536px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span
          className="absolute right-2 bottom-2 rounded-lg bg-foreground/80 px-1.5 py-0.5 text-xs font-bold text-background tabular-nums"
          aria-label={`Durasi ${formatDurationLabel(video.durationSeconds)}`}
        >
          {formatDuration(video.durationSeconds)}
        </span>
        <WatchProgressBar videoId={video.id} durationSeconds={video.durationSeconds} />
      </Link>

      <div className={cn("flex min-w-0 gap-3", isRow && "sm:flex-1 sm:py-1")}>
        {showChannel && !isRow && avatar}
        <div className="min-w-0 flex-1">
          <h3 className={cn("line-clamp-2 font-sans leading-snug font-bold", isRow ? "text-lg" : "text-base")}>
            <Link
              href={href}
              className="rounded-md outline-none transition-colors group-hover:text-sky-ink focus-visible:ring-4 focus-visible:ring-ring"
            >
              {video.title}
            </Link>
          </h3>

          {isRow && <p className="mt-1 text-sm text-muted-foreground">{meta}</p>}

          {showChannel && channel && (
            <div className={cn("flex items-center gap-2", isRow ? "mt-3" : "mt-1")}>
              {isRow && avatar}
              <Link
                href={`/channel/${channel.handle}`}
                className="truncate rounded-md text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring"
              >
                {channel.name}
              </Link>
            </div>
          )}

          {!isRow && <p className="text-sm text-muted-foreground">{meta}</p>}

          {isRow && video.description && (
            <p className="mt-3 line-clamp-2 hidden text-sm text-muted-foreground sm:block">{video.description}</p>
          )}
        </div>
      </div>
    </article>
  )
}
