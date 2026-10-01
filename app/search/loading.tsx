import { PageContainer } from "@/components/layout/page-container"
import { Skeleton } from "@/components/ui/skeleton"
import { VideoCardSkeleton } from "@/components/video/video-skeleton"

export default function Loading() {
  return (
    <PageContainer className="max-w-5xl py-6">
      <div role="status" aria-label="Mencari video">
        <Skeleton className="h-8 w-64" />
        <div className="mt-6 flex flex-col gap-8">
          {Array.from({ length: 4 }, (_, index) => (
            <VideoCardSkeleton key={index} layout="row" />
          ))}
        </div>
      </div>
    </PageContainer>
  )
}
