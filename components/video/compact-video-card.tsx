import Image from "next/image"
import Link from "next/link"

import { getChannelById } from "@/lib/data"
import { formatDuration, formatDurationLabel, formatRelativeTime, formatViews } from "@/lib/format"
import type { Video } from "@/types"
import { videoHref } from "./video-card"
import { WatchProgressBar } from "./watch-progress"

/** Kartu horizontal untuk daftar "Video berikutnya". */
export function CompactVideoCard({ video }: { video: Video }) {
  const channel = getChannelById(video.channelId)

  return (
    <article className="group relative flex gap-3 rounded-2xl p-1.5 transition-colors hover:bg-muted">
      <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-xl bg-muted sm:w-44">
        <Image
          src={video.thumbnailUrl}
          alt=""
          fill
          sizes="176px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span
          className="absolute right-1.5 bottom-1.5 rounded-md bg-foreground/80 px-1.5 py-0.5 text-[0.7rem] font-bold text-background tabular-nums"
          aria-label={`Durasi ${formatDurationLabel(video.durationSeconds)}`}
        >
          {formatDuration(video.durationSeconds)}
        </span>
        <WatchProgressBar videoId={video.id} durationSeconds={video.durationSeconds} />
      </div>
      <div className="min-w-0 py-0.5">
        <h3 className="line-clamp-2 font-sans text-sm leading-snug font-bold">
          {/* Link menutupi seluruh kartu */}
          <Link
            href={videoHref(video)}
            className="rounded-md outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-4 focus-visible:after:ring-ring"
          >
            {video.title}
          </Link>
        </h3>
        {channel && <p className="mt-1 truncate text-xs text-muted-foreground">{channel.name}</p>}
        <p className="truncate text-xs text-muted-foreground">
          {formatViews(video.views)} • {formatRelativeTime(video.publishedAt)}
        </p>
      </div>
    </article>
  )
}
