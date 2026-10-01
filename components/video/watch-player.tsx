"use client"

import { ProductPopup, type PopupProduct } from "@/components/marketplace/product-popup"
import { UpNextOverlay, type UpNextVideo } from "./up-next-overlay"
import { VideoPlayer } from "./video-player"

/** Player halaman tonton + overlay pop up produk dan hitung mundur video berikutnya. */
export function WatchPlayer({
  video,
  next,
  product,
}: {
  video: { youtubeId: string; title: string; thumbnailUrl: string }
  next: UpNextVideo | null
  product: PopupProduct | null
}) {
  return (
    <VideoPlayer youtubeId={video.youtubeId} title={video.title} thumbnailUrl={video.thumbnailUrl} autoplay>
      {product && <ProductPopup youtubeId={video.youtubeId} product={product} />}
      {next && <UpNextOverlay next={next} />}
    </VideoPlayer>
  )
}
