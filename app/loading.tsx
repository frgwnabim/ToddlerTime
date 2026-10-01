import { PageContainer } from "@/components/layout/page-container"
import { ChipRowSkeleton, VideoGridSkeleton } from "@/components/video/video-skeleton"

export default function Loading() {
  return (
    <>
      <ChipRowSkeleton />
      <PageContainer className="pt-2">
        <VideoGridSkeleton />
      </PageContainer>
    </>
  )
}
