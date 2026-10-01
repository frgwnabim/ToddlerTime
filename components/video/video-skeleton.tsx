import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { videoGridClass } from "./video-grid"

export function VideoCardSkeleton({ layout = "grid" }: { layout?: "grid" | "row" }) {
  const isRow = layout === "row"
  return (
    <div className={cn("flex flex-col gap-3", isRow && "sm:flex-row sm:gap-5")} aria-hidden="true">
      <Skeleton className={cn("aspect-video rounded-2xl", isRow && "sm:w-[min(22rem,45%)] sm:shrink-0")} />
      <div className="flex flex-1 gap-3">
        {!isRow && <Skeleton className="size-10 shrink-0 rounded-full" />}
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3.5 w-1/2" />
        </div>
      </div>
    </div>
  )
}

export function VideoGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={videoGridClass} role="status" aria-label="Memuat video">
      {Array.from({ length: count }, (_, index) => (
        <VideoCardSkeleton key={index} />
      ))}
    </div>
  )
}

export function ChipRowSkeleton() {
  return (
    <div className="flex gap-2 overflow-hidden px-4 py-3 md:px-6" aria-hidden="true">
      {[80, 110, 170, 120, 90, 120, 150].map((width, index) => (
        <Skeleton key={index} className="h-10 shrink-0 rounded-full" style={{ width }} />
      ))}
    </div>
  )
}
