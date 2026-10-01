import { PageContainer } from "@/components/layout/page-container"
import { Skeleton } from "@/components/ui/skeleton"
import { VideoGridSkeleton } from "@/components/video/video-skeleton"

export default function Loading() {
  return (
    <PageContainer className="py-6">
      <div className="mb-6 flex items-center gap-3" aria-hidden="true">
        <Skeleton className="size-12 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <VideoGridSkeleton count={8} />
    </PageContainer>
  )
}
