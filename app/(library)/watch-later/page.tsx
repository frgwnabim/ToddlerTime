import type { Metadata } from "next"

import { SavedVideosPage } from "@/components/interactions/saved-videos-page"

export const metadata: Metadata = { title: "Tonton Nanti", robots: { index: false } }

export default function WatchLaterPage() {
  return <SavedVideosPage list="watch_later" />
}
