// Akses data konten statis (hasil scripts/seed.ts). Panggil dari Server
// Component atau route handler supaya JSON tidak ikut ke bundle client.
import channelsJson from "@/data/channels.json"
import productsJson from "@/data/products.json"
import videosJson from "@/data/videos.json"
import { categories } from "@/data/categories"
import type { Category, CategoryId, Channel, Product, Video } from "@/types"

const videos = videosJson as Video[]
const channels = channelsJson as Channel[]
const products = productsJson as Product[]

const videosById = new Map(videos.map((video) => [video.id, video]))
const channelsById = new Map(channels.map((channel) => [channel.id, channel]))
const productsById = new Map(products.map((product) => [product.id, product]))

/** Huruf kecil tanpa diakritik, untuk pencarian. */
function normalize(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
}

function tokenize(text: string): string[] {
  return normalize(text).split(/[^\p{L}\p{N}]+/u).filter(Boolean)
}

export function getCategories(): Category[] {
  return categories
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((category) => category.id === id)
}

export function getVideos(): Video[] {
  return videos
}

/** Video untuk beranda: diselang-seling antar kategori supaya variatif. */
export function getHomeFeed(): Video[] {
  const queues = categories.map((category) => getVideosByCategory(category.id))
  const feed: Video[] = []
  const longest = Math.max(0, ...queues.map((queue) => queue.length))
  for (let i = 0; i < longest; i++) {
    for (const queue of queues) if (queue[i]) feed.push(queue[i])
  }
  return feed
}

export function getVideoById(id: string): Video | undefined {
  return videosById.get(id)
}

export function getVideoBySlug(slug: string): Video | undefined {
  return videos.find((video) => video.slug === slug)
}

export function getVideosByCategory(categoryId: CategoryId): Video[] {
  return videos.filter((video) => video.category === categoryId)
}

export function getChannels(): Channel[] {
  return channels
}

export function getChannelById(id: string): Channel | undefined {
  return channelsById.get(id)
}

/** Menerima handle dengan atau tanpa "@", juga versi URL-encoded. */
export function getChannelByHandle(handle: string): Channel | undefined {
  let decoded = handle
  try {
    decoded = decodeURIComponent(handle)
  } catch {
    // Handle tidak valid sebagai URI: pakai apa adanya.
  }
  const wanted = decoded.replace(/^@/, "").toLowerCase()
  return channels.find((channel) => channel.handle === wanted)
}

export function getVideosByChannel(channelId: string): Video[] {
  return videos.filter((video) => video.channelId === channelId)
}

/**
 * Rekomendasi untuk halaman tonton: prioritas kategori sama, lalu channel
 * sama, lalu tag yang mirip; seri diurutkan dari views terbanyak.
 */
export function getRelatedVideos(video: Video, limit = 12): Video[] {
  const tags = new Set(video.tags)
  return videos
    .filter((candidate) => candidate.id !== video.id)
    .map((candidate) => {
      let score = 0
      if (candidate.category === video.category) score += 3
      if (candidate.channelId === video.channelId) score += 2
      score += candidate.tags.filter((tag) => tags.has(tag)).length * 0.5
      return { candidate, score }
    })
    .sort((a, b) => b.score - a.score || b.candidate.views - a.candidate.views)
    .slice(0, limit)
    .map(({ candidate }) => candidate)
}

/**
 * "Video berikutnya": video sekategori mulai dari setelah video ini (berputar),
 * lalu dilengkapi rekomendasi lain bila kurang.
 */
export function getUpNextVideos(video: Video, limit = 12): Video[] {
  const sameCategory = getVideosByCategory(video.category)
  const index = sameCategory.findIndex((candidate) => candidate.id === video.id)
  const rotated = [...sameCategory.slice(index + 1), ...sameCategory.slice(0, Math.max(index, 0))]
  const seen = new Set([video.id, ...rotated.map((candidate) => candidate.id)])
  const extra = getRelatedVideos(video, limit).filter((candidate) => !seen.has(candidate.id))
  return [...rotated, ...extra].slice(0, limit)
}

export function getProducts(categoryId?: CategoryId): Product[] {
  return categoryId ? products.filter((product) => product.category === categoryId) : products
}

export function getProductsForVideo(video: Video): Product[] {
  return video.productIds
    .map((id) => productsById.get(id))
    .filter((product): product is Product => product !== undefined)
}

// Padanan kata Indonesia <-> Inggris, karena sebagian judul video berbahasa Inggris.
const SYNONYM_GROUPS = [
  ["hewan", "binatang", "animal"],
  ["lagu", "nyanyi", "song", "rhyme", "music", "musik"],
  ["gambar", "menggambar", "draw", "drawing", "painting", "lukis"],
  ["warna", "mewarnai", "color", "colour", "coloring"],
  ["bentuk", "shape"],
  ["angka", "hitung", "number", "count"],
  ["kendaraan", "transportasi", "vehicle"],
  ["mobil", "car"],
  ["truk", "truck"],
  ["kereta", "train"],
  ["bus", "bis"],
  ["masak", "cooking", "cook", "kitchen", "dapur"],
  ["makanan", "food"],
  ["buah", "fruit"],
  ["alam", "nature"],
  ["main", "bermain", "play", "mainan", "toy"],
  ["bebek", "duck"],
  ["kucing", "cat"],
  ["anjing", "dog"],
  ["burung", "bird"],
  ["bayi", "baby"],
]

const synonymsByWord = new Map<string, string[]>()
for (const group of SYNONYM_GROUPS) {
  for (const word of group) synonymsByWord.set(word, group)
}

/**
 * Cari video berdasarkan judul, tag, nama channel, dan nama kategori.
 * Semua kata kunci harus cocok (atau padanannya); kecocokan di judul didahulukan.
 */
export function searchVideos(query: string): Video[] {
  const terms = tokenize(query).map((typed) => ({
    typed,
    synonyms: synonymsByWord.get(typed) ?? [],
  }))
  if (terms.length === 0) return []

  // Kata yang diketik boleh cocok di awal kata ("kuc" -> "kucing"); padanannya
  // harus cocok utuh atau bentuk jamak ("truk" -> "trucks", bukan "cat" di "educational").
  const matches = (words: string[], { typed, synonyms }: (typeof terms)[number]) =>
    words.some(
      (word) =>
        word.startsWith(typed) ||
        synonyms.some((synonym) => word === synonym || word === `${synonym}s` || word === `${synonym}es`)
    )

  return videos
    .map((video) => {
      const titleWords = tokenize(video.title)
      const allWords = [
        ...titleWords,
        ...tokenize(video.tags.join(" ")),
        ...tokenize(channelsById.get(video.channelId)?.name ?? ""),
        ...tokenize(getCategoryById(video.category)?.name ?? ""),
      ]

      if (!terms.every((term) => matches(allWords, term))) return null
      const titleHits = terms.filter((term) => matches(titleWords, term)).length
      return { video, titleHits }
    })
    .filter((result): result is { video: Video; titleHits: number } => result !== null)
    .sort((a, b) => b.titleHits - a.titleHits || b.video.views - a.video.views)
    .map(({ video }) => video)
}
