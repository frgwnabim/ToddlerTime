import { PageContainer } from "@/components/layout/page-container"
import { Skeleton } from "@/components/ui/skeleton"
import { ChipRowSkeleton } from "@/components/video/video-skeleton"

export default function Loading() {
  return (
    <div role="status" aria-label="Memuat produk">
      <PageContainer className="pt-6 pb-0">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-3 h-4 w-full max-w-xl" />
      </PageContainer>
      <ChipRowSkeleton />
      <PageContainer className="pt-2">
        <div className="grid grid-cols-2 gap-3 sm:gap-5 @3xl:grid-cols-3 @6xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="space-y-3 rounded-2xl bg-card p-3 ring-1 ring-border">
              <Skeleton className="aspect-4/3 rounded-xl" />
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-28" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-9 rounded-xl" />
                <Skeleton className="h-9 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    </div>
  )
}
