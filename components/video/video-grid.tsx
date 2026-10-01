import { cn } from "@/lib/utils"
import type { Video } from "@/types"
import { VideoCard } from "./video-card"

/** Kolom mengikuti lebar area konten (container query), bukan lebar layar. */
export const videoGridClass =
  "grid grid-cols-1 gap-x-5 gap-y-9 @xl:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4"

export function VideoGrid({
  videos,
  showChannel = true,
  className,
}: {
  videos: Video[]
  showChannel?: boolean
  className?: string
}) {
  return (
    <div className={cn(videoGridClass, className)}>
      {videos.map((video, index) => (
        <VideoCard key={video.id} video={video} showChannel={showChannel} priority={index < 4} />
      ))}
    </div>
  )
}
