import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Memuat video"
      className="mx-auto grid w-full max-w-[1760px] gap-x-6 px-4 pt-4 md:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]"
    >
      <div>
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <Skeleton className="mt-4 h-7 w-3/4" />
        <div className="mt-4 flex items-center gap-3">
          <Skeleton className="size-11 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="ml-auto h-11 w-32 rounded-2xl" />
        </div>
        <Skeleton className="mt-4 h-24 w-full rounded-2xl" />
      </div>
      <div className="mt-8 flex flex-col gap-3 lg:mt-0">
        <Skeleton className="h-5 w-36" />
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex gap-3">
            <Skeleton className="aspect-video w-40 shrink-0 rounded-xl sm:w-44" />
            <div className="flex-1 space-y-2 pt-1">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
