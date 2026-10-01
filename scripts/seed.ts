/**
 * Seed konten ToddlerTime dari YouTube Data API v3.
 *
 *   npx tsx scripts/seed.ts                   # produk + video + channel
 *   npx tsx scripts/seed.ts --products-only   # hanya produk (tanpa API)
 *
 * Output: data/videos.json, data/channels.json, data/products.json,
 * public/products/*.svg. YOUTUBE_API_KEY (dari .env.local) HANYA dipakai
 * di sini, tidak pernah di kode website.
 */
import { writeFile } from "node:fs/promises"
import path from "node:path"

import { categories } from "../data/categories"
import type { Category, CategoryId, Channel, Product, Video } from "../types"
import { writeProducts } from "./products"

const ROOT = path.resolve(__dirname, "..")
const API_BASE = "https://www.googleapis.com/youtube/v3"

const VIDEOS_PER_CATEGORY = 6
const MIN_TOTAL_VIDEOS = 36
const SEARCH_RESULTS_PER_QUERY = 15
const MAX_PER_CHANNEL_PER_CATEGORY = 2
const PRODUCTS_PER_VIDEO = 2
const MAX_DESCRIPTION_LENGTH = 300
const MIN_DURATION_SECONDS = 60
const MAX_DURATION_SECONDS = 20 * 60

// Dua kueri pertama (Indonesia + Inggris) selalu dijalankan supaya bahasanya
// campuran; kueri berikutnya hanya dipakai kalau videonya belum cukup.
const QUERIES: Record<CategoryId, string[]> = {
  hewan: ["lagu hewan anak", "animal sounds for toddlers", "mengenal nama hewan untuk balita"],
  "menggambar-mewarnai": ["belajar mewarnai untuk anak", "kids drawing for toddlers", "cara menggambar mudah untuk anak"],
  "musik-lagu": ["lagu anak indonesia", "nursery rhymes for toddlers", "lagu anak balita populer"],
  alam: ["mengenal alam untuk anak", "nature for kids toddlers", "lagu pelangi anak"],
  kendaraan: ["kendaraan untuk anak", "vehicles for toddlers", "lagu kendaraan anak"],
  bermain: ["bermain sambil belajar balita", "toddler learning through play", "permainan edukasi anak"],
  "masak-masakan": ["masak masakan anak", "pretend play cooking for kids", "mainan masak masakan"],
  "warna-bentuk": ["belajar warna dan bentuk balita", "learn colors and shapes for toddlers", "mengenal warna untuk anak"],
}

// Judul dengan kata-kata ini dibuang (tidak cocok untuk balita).
const TITLE_BLOCKLIST = /\b(prank|hantu|seram|horor|horror|scary|ghost|zombie|monster|berantem|fight|#shorts|asmr)\b/i

// ---------------------------------------------------------------------------
// Kuota (unit YouTube Data API v3)

const QUOTA_COST = { search: 100, videos: 1, channels: 1 } as const
const quotaCalls = { search: 0, videos: 0, channels: 0 }

// ---------------------------------------------------------------------------
// Tipe respons API (hanya field yang dipakai)

type Thumbnails = Partial<Record<"default" | "medium" | "high" | "standard" | "maxres", { url: string }>>

type SearchResponse = { items: { id: { videoId?: string } }[] }

type YtVideo = {
  id: string
  snippet: {
    publishedAt: string
    channelId: string
    title: string
    description: string
    thumbnails: Thumbnails
    tags?: string[]
    liveBroadcastContent: string
  }
  contentDetails: {
    duration: string
    regionRestriction?: { allowed?: string[]; blocked?: string[] }
    contentRating?: { ytRating?: string }
  }
  statistics: { viewCount?: string }
  status: {
    uploadStatus: string
    privacyStatus: string
    embeddable: boolean
    madeForKids?: boolean
  }
}

type YtChannel = {
  id: string
  snippet: { title: string; description: string; customUrl?: string; thumbnails: Thumbnails }
  statistics: { subscriberCount?: string; hiddenSubscriberCount: boolean }
}

// ---------------------------------------------------------------------------
// Helper umum

function loadApiKey(): string {
  for (const file of [".env.local", ".env"]) {
    try {
      process.loadEnvFile(path.join(ROOT, file))
    } catch {
      // File tidak ada: lanjut ke file berikutnya.
    }
  }
  const key = process.env.YOUTUBE_API_KEY?.trim()
  if (!key) {
    console.error(
      [
        "",
        "✖ YOUTUBE_API_KEY tidak ditemukan.",
        "",
        "  Tambahkan ke .env.local di root project:",
        "    YOUTUBE_API_KEY=isi_api_key_anda",
        "",
        "  Buat key di https://console.cloud.google.com/apis/credentials",
        "  dan aktifkan \"YouTube Data API v3\" untuk project tersebut.",
        "",
      ].join("\n")
    )
    process.exit(1)
  }
  return key
}

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size))
  return result
}

async function youtube<T>(
  endpoint: keyof typeof QUOTA_COST,
  params: Record<string, string>,
  apiKey: string
): Promise<T> {
  quotaCalls[endpoint] += 1
  const url = `${API_BASE}/${endpoint}?${new URLSearchParams({ ...params, key: apiKey })}`
  const response = await fetch(url)
  if (!response.ok) {
    // Jangan cetak URL: berisi API key.
    const body = (await response.json().catch(() => null)) as {
      error?: { message?: string; errors?: { reason?: string }[] }
    } | null
    const reason = body?.error?.errors?.[0]?.reason ?? response.statusText
    throw new Error(`YouTube ${endpoint}.list gagal (${response.status} ${reason}): ${body?.error?.message ?? ""}`)
  }
  return (await response.json()) as T
}

function parseIsoDuration(iso: string): number {
  const match = /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso)
  if (!match) return 0
  const [, d, h, m, s] = match.map((part) => Number(part ?? 0))
  return d * 86400 + h * 3600 + m * 60 + s
}

function bestThumbnail(thumbnails: Thumbnails): string {
  const thumb =
    thumbnails.maxres ?? thumbnails.standard ?? thumbnails.high ?? thumbnails.medium ?? thumbnails.default
  return thumb?.url ?? ""
}

function slugify(text: string, maxLength = 60): string {
  const slug = text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  if (slug.length <= maxLength) return slug
  return slug.slice(0, maxLength).replace(/-[^-]*$/, "") || slug.slice(0, maxLength)
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  const cut = text.slice(0, maxLength - 1)
  const lastSpace = cut.lastIndexOf(" ")
  return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

/** Bersihkan deskripsi: buang URL, hashtag, dan spasi berlebih, lalu potong. */
function cleanDescription(text: string): string {
  const cleaned = text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/#[\p{L}\p{N}_]+/gu, "")
    .replace(/\s+/g, " ")
    .trim()
  return truncate(cleaned, MAX_DESCRIPTION_LENGTH)
}

function buildTags(video: YtVideo, category: Category): string[] {
  const tags = new Set<string>([category.name.toLowerCase()])
  for (const tag of video.snippet.tags ?? []) {
    const normalized = tag.toLowerCase().trim()
    if (normalized && normalized.length <= 30) tags.add(normalized)
    if (tags.size >= 8) break
  }
  return [...tags]
}

function isSuitable(video: YtVideo): boolean {
  const { snippet, contentDetails, status } = video
  const duration = parseIsoDuration(contentDetails.duration)
  const restriction = contentDetails.regionRestriction
  const blockedInIndonesia =
    restriction?.blocked?.includes("ID") ||
    (restriction?.allowed !== undefined && !restriction.allowed.includes("ID"))

  return (
    status.embeddable === true &&
    status.privacyStatus === "public" &&
    status.uploadStatus === "processed" &&
    snippet.liveBroadcastContent === "none" &&
    contentDetails.contentRating?.ytRating !== "ytAgeRestricted" &&
    !blockedInIndonesia &&
    duration >= MIN_DURATION_SECONDS &&
    duration <= MAX_DURATION_SECONDS &&
    !TITLE_BLOCKLIST.test(snippet.title)
  )
}

// ---------------------------------------------------------------------------
// Langkah-langkah API

async function searchVideoIds(query: string, apiKey: string): Promise<string[]> {
  const data = await youtube<SearchResponse>(
    "search",
    {
      part: "id",
      q: query,
      type: "video",
      safeSearch: "strict",
      videoEmbeddable: "true",
      videoDuration: "medium",
      regionCode: "ID",
      relevanceLanguage: "id",
      maxResults: String(SEARCH_RESULTS_PER_QUERY),
    },
    apiKey
  )
  return data.items.map((item) => item.id.videoId).filter((id): id is string => Boolean(id))
}

/** Ambil detail video yang belum ada di cache, 50 id per request. */
async function fetchVideoDetails(ids: string[], cache: Map<string, YtVideo | null>, apiKey: string) {
  const missing = [...new Set(ids)].filter((id) => !cache.has(id))
  for (const batch of chunk(missing, 50)) {
    const data = await youtube<{ items: YtVideo[] }>(
      "videos",
      { part: "snippet,contentDetails,statistics,status", id: batch.join(","), maxResults: "50" },
      apiKey
    )
    for (const id of batch) cache.set(id, null)
    for (const video of data.items) cache.set(video.id, video)
  }
}

async function fetchChannels(ids: string[], apiKey: string): Promise<YtChannel[]> {
  const channels: YtChannel[] = []
  for (const batch of chunk([...new Set(ids)], 50)) {
    const data = await youtube<{ items?: YtChannel[] }>(
      "channels",
      { part: "snippet,statistics", id: batch.join(","), maxResults: "50" },
      apiKey
    )
    channels.push(...(data.items ?? []))
  }
  return channels
}

// ---------------------------------------------------------------------------
// Seleksi

type CategoryState = {
  category: Category
  /** Hasil search per kueri, urut relevansi. */
  results: string[][]
  selected: YtVideo[]
}

/** Gabungkan hasil beberapa kueri secara bergantian supaya bahasanya campuran. */
function interleave(lists: string[][]): string[] {
  const merged: string[] = []
  const longest = Math.max(0, ...lists.map((list) => list.length))
  for (let i = 0; i < longest; i++) {
    for (const list of lists) if (list[i]) merged.push(list[i])
  }
  return merged
}

function selectVideos(state: CategoryState, cache: Map<string, YtVideo | null>, usedIds: Set<string>) {
  const perChannel = new Map<string, number>()
  for (const video of state.selected) {
    perChannel.set(video.snippet.channelId, (perChannel.get(video.snippet.channelId) ?? 0) + 1)
  }

  for (const id of interleave(state.results)) {
    if (state.selected.length >= VIDEOS_PER_CATEGORY) break
    if (usedIds.has(id)) continue
    const video = cache.get(id)
    if (!video || !isSuitable(video)) continue
    const channelCount = perChannel.get(video.snippet.channelId) ?? 0
    if (channelCount >= MAX_PER_CHANNEL_PER_CATEGORY) continue

    state.selected.push(video)
    usedIds.add(id)
    perChannel.set(video.snippet.channelId, channelCount + 1)
  }
}

function toVideo(video: YtVideo, category: Category, productIds: string[]): Video {
  return {
    id: `yt_${video.id}`,
    youtubeId: video.id,
    slug: `${slugify(video.snippet.title) || "video"}-${video.id}`,
    title: video.snippet.title.trim(),
    description: cleanDescription(video.snippet.description),
    channelId: video.snippet.channelId,
    category: category.id,
    durationSeconds: parseIsoDuration(video.contentDetails.duration),
    thumbnailUrl: bestThumbnail(video.snippet.thumbnails),
    views: Number(video.statistics.viewCount ?? 0),
    publishedAt: video.snippet.publishedAt,
    productIds,
    tags: buildTags(video, category),
  }
}

function toChannel(channel: YtChannel): Channel {
  const handle = channel.snippet.customUrl?.replace(/^@/, "").toLowerCase()
  return {
    id: channel.id,
    name: channel.snippet.title.trim(),
    handle: handle || slugify(channel.snippet.title) || channel.id.toLowerCase(),
    avatarUrl: bestThumbnail(channel.snippet.thumbnails),
    description: truncate(channel.snippet.description.replace(/\s+/g, " ").trim(), MAX_DESCRIPTION_LENGTH),
    baseSubscribers: channel.statistics.hiddenSubscriberCount ? 0 : Number(channel.statistics.subscriberCount ?? 0),
  }
}

/** Pilih produk sekategori secara bergiliran supaya tiap video variatif. */
function pickProductIds(products: Product[], categoryId: CategoryId, index: number): string[] {
  const pool = products.filter((product) => product.category === categoryId)
  const count = Math.min(PRODUCTS_PER_VIDEO, pool.length)
  return Array.from({ length: count }, (_, offset) => pool[(index + offset) % pool.length].id)
}

function printQuotaReport() {
  const rows = (Object.keys(quotaCalls) as (keyof typeof quotaCalls)[]).map((endpoint) => ({
    endpoint: `${endpoint}.list`,
    calls: quotaCalls[endpoint],
    units: quotaCalls[endpoint] * QUOTA_COST[endpoint],
  }))
  const total = rows.reduce((sum, row) => sum + row.units, 0)
  console.log("\nPerkiraan pemakaian kuota YouTube Data API:")
  console.table(rows)
  console.log(`Total ≈ ${total} unit (kuota harian default 10.000 unit)`)
}

// ---------------------------------------------------------------------------

async function main() {
  const productsOnly = process.argv.includes("--products-only")

  const products = await writeProducts(ROOT)
  console.log(`✔ ${products.length} produk ditulis ke data/products.json + public/products/*.svg`)
  if (productsOnly) return

  const apiKey = loadApiKey()
  const cache = new Map<string, YtVideo | null>()
  const usedIds = new Set<string>()
  const states: CategoryState[] = categories.map((category) => ({ category, results: [], selected: [] }))

  // 1. Dua kueri pertama per kategori (Indonesia + Inggris).
  for (const state of states) {
    for (const query of QUERIES[state.category.id].slice(0, 2)) {
      state.results.push(await searchVideoIds(query, apiKey))
    }
  }
  await fetchVideoDetails(states.flatMap((state) => state.results.flat()), cache, apiKey)
  for (const state of states) selectVideos(state, cache, usedIds)

  // 2. Kueri cadangan untuk kategori yang belum cukup.
  for (const state of states) {
    for (const query of QUERIES[state.category.id].slice(2)) {
      if (state.selected.length >= VIDEOS_PER_CATEGORY) break
      const ids = await searchVideoIds(query, apiKey)
      state.results.push(ids)
      await fetchVideoDetails(ids, cache, apiKey)
      selectVideos(state, cache, usedIds)
    }
  }

  // 3. Susun data video + channel.
  const videos = states.flatMap((state) =>
    state.selected.map((video, index) =>
      toVideo(video, state.category, pickProductIds(products, state.category.id, index))
    )
  )
  const ytChannels = await fetchChannels(videos.map((video) => video.channelId), apiKey)
  const channels = ytChannels.map(toChannel).sort((a, b) => a.name.localeCompare(b.name))

  const channelIds = new Set(channels.map((channel) => channel.id))
  const orphaned = videos.filter((video) => !channelIds.has(video.channelId))
  if (orphaned.length > 0) {
    throw new Error(`${orphaned.length} video tidak punya data channel: ${orphaned.map((v) => v.youtubeId).join(", ")}`)
  }

  await writeFile(path.join(ROOT, "data", "videos.json"), JSON.stringify(videos, null, 2) + "\n")
  await writeFile(path.join(ROOT, "data", "channels.json"), JSON.stringify(channels, null, 2) + "\n")

  // 4. Ringkasan.
  console.log(`\n✔ ${videos.length} video dan ${channels.length} channel ditulis ke data/\n`)
  for (const state of states) {
    console.log(`${state.category.name} (${state.selected.length})`)
    for (const video of state.selected) console.log(`  - ${video.snippet.title}`)
  }
  printQuotaReport()

  if (videos.length < MIN_TOTAL_VIDEOS) {
    console.error(`\n✖ Hanya ${videos.length} video, target minimal ${MIN_TOTAL_VIDEOS}. Tambah kueri di QUERIES.`)
    process.exitCode = 1
  }
}

main().catch((error: unknown) => {
  console.error(`\n✖ Seed gagal: ${error instanceof Error ? error.message : String(error)}`)
  printQuotaReport()
  process.exit(1)
})
