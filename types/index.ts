// Tipe data konten ToddlerTime. Data video & channel berasal dari YouTube
// (diambil sekali oleh scripts/seed.ts), produk dikurasi manual.

export type AccentColor = "sky" | "mint" | "sun" | "peach" | "lavender"

export type CategoryId =
  | "hewan"
  | "menggambar-mewarnai"
  | "musik-lagu"
  | "alam"
  | "kendaraan"
  | "bermain"
  | "masak-masakan"
  | "warna-bentuk"

export type Category = {
  id: CategoryId
  /** Nama tampilan, Bahasa Indonesia. */
  name: string
  description: string
  color: AccentColor
  /** Nama ikon lucide-react, dipetakan ke komponen di UI. */
  icon:
    | "PawPrint"
    | "Palette"
    | "Music"
    | "TreePine"
    | "Car"
    | "Blocks"
    | "CookingPot"
    | "Shapes"
}

export type Channel = {
  /** Channel ID YouTube asli, mis. "UCxxxxxxxxxxxxxxxxxxxxxx". */
  id: string
  name: string
  /** Handle YouTube tanpa "@", huruf kecil. */
  handle: string
  avatarUrl: string
  description: string
  /** Jumlah subscriber dari YouTube saat seed (0 jika disembunyikan). */
  baseSubscribers: number
}

export type Video = {
  id: string
  youtubeId: string
  slug: string
  title: string
  /** Deskripsi dipotong, maksimal 300 karakter. */
  description: string
  channelId: string
  category: CategoryId
  durationSeconds: number
  thumbnailUrl: string
  views: number
  /** ISO 8601. */
  publishedAt: string
  productIds: string[]
  tags: string[]
}

export type Product = {
  id: string
  name: string
  description: string
  priceIdr: number
  /** Ilustrasi lokal di /public/products, bukan gambar dari toko. */
  imageUrl: string
  category: CategoryId
  tokopediaUrl: string
  shopeeUrl: string
}
