import type { Metadata } from "next"

import { SavedVideosPage } from "@/components/interactions/saved-videos-page"

export const metadata: Metadata = { title: "Favorit", robots: { index: false } }

export default function FavoritesPage() {
  return <SavedVideosPage list="favorites" />
}
