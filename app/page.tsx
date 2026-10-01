import { PageContainer } from "@/components/layout/page-container"
import { CategoryChips } from "@/components/video/category-chips"
import { VideoGrid } from "@/components/video/video-grid"
import { getHomeFeed } from "@/lib/data"

// Bangun ulang sehari sekali supaya "x hari lalu" tetap akurat.
export const revalidate = 86400

export default function HomePage() {
  return (
    <>
      <h1 className="sr-only">Beranda ToddlerTime</h1>
      <CategoryChips active="all" />
      <PageContainer className="pt-2">
        <VideoGrid videos={getHomeFeed()} />
      </PageContainer>
    </>
  )
}
