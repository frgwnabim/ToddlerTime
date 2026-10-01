import { ReactionButtons } from "@/components/interactions/reaction-buttons"
import { SaveToggle } from "@/components/interactions/save-toggle"
import { ShareButton } from "@/components/interactions/share-button"

/** Baris aksi di bawah video: Suka/Tidak suka, Tonton Nanti, Favorit, Bagikan. */
export function WatchActions({ videoId, views, title }: { videoId: string; views: number; title: string }) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
      <ReactionButtons videoId={videoId} views={views} />
      <SaveToggle list="watch_later" videoId={videoId} />
      <SaveToggle list="favorites" videoId={videoId} />
      <ShareButton title={title} />
    </div>
  )
}
