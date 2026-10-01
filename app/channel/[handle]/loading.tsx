import { PageContainer } from "@/components/layout/page-container"
import { Skeleton } from "@/components/ui/skeleton"
import { VideoGridSkeleton } from "@/components/video/video-skeleton"

export default function Loading() {
  return (
    <PageContainer className="max-w-6xl">
      <Skeleton className="h-28 rounded-3xl sm:h-40 lg:h-48" />
      <div className="mt-6 flex items-center gap-4 sm:gap-6">
        <Skeleton className="size-20 shrink-0 rounded-full sm:size-32" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72 max-w-full" />
          <Skeleton className="hidden h-11 w-36 rounded-2xl sm:block" />
        </div>
      </div>
      <Skeleton className="mt-8 h-px w-full" />
      <div className="mt-6">
        <VideoGridSkeleton count={4} />
      </div>
    </PageContainer>
  )
}
