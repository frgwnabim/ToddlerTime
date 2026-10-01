/**
 * Katalog produk marketplace (dikurasi manual) + generator ilustrasinya.
 *
 * Gambar produk BUKAN dari toko: tiap produk dibuatkan ilustrasi SVG
 * sederhana (latar pastel + ikon lucide) di public/products/{id}.svg.
 * Link toko memakai URL pencarian Tokopedia/Shopee.
 */
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import {
  Apple,
  BookOpen,
  Bus,
  Car,
  Coffee,
  CookingPot,
  Drum,
  Fish,
  Layers,
  Leaf,
  type LucideIcon,
  Mic,
  Paintbrush,
  Palette,
  PawPrint,
  Piano,
  Presentation,
  Puzzle,
  Search,
  Shapes,
  Sprout,
  ToyBrick,
  TrainFront,
  Triangle,
  Truck,
  Volleyball,
} from "lucide-react"

import type { AccentColor, CategoryId, Product } from "../types"

// Nilai hex mode siang dari app/globals.css (file SVG statis tidak bisa membaca CSS variables).
const ACCENT_HEX: Record<AccentColor, { fill: string; soft: string; ink: string }> = {
  sky: { fill: "#7cc6f2", soft: "#e3f3fd", ink: "#1d5a85" },
  mint: { fill: "#8fdcc2", soft: "#e2f7ef", ink: "#1e6b52" },
  sun: { fill: "#ffd873", soft: "#fff4cf", ink: "#7a5a00" },
  peach: { fill: "#ffb89a", soft: "#ffe9de", ink: "#94472a" },
  lavender: { fill: "#bba8f0", soft: "#efeafd", ink: "#5a45a8" },
}

type CatalogItem = {
  id: string
  name: string
  description: string
  priceIdr: number
  category: CategoryId
  /** Kata kunci pencarian di Tokopedia/Shopee. */
  query: string
  icon: LucideIcon
  color: AccentColor
}

const CATALOG: CatalogItem[] = [
  // Hewan
  { id: "buku-cerita-hewan", name: "Buku Cerita Hewan Bergambar", description: "Buku board tebal dengan gambar hewan lucu, tahan sobek untuk tangan mungil.", priceIdr: 65000, category: "hewan", query: "buku cerita hewan anak", icon: BookOpen, color: "mint" },
  { id: "boneka-jari-hewan", name: "Boneka Jari Hewan (10 pcs)", description: "Boneka jari kain berbentuk hewan untuk bercerita dan bermain peran.", priceIdr: 49000, category: "hewan", query: "boneka jari hewan", icon: PawPrint, color: "peach" },
  { id: "puzzle-kayu-hewan", name: "Puzzle Kayu Hewan", description: "Puzzle kayu dengan pegangan besar, kenalkan nama dan bentuk hewan.", priceIdr: 55000, category: "hewan", query: "puzzle kayu hewan anak", icon: Puzzle, color: "sun" },

  // Menggambar & Mewarnai
  { id: "krayon-jumbo", name: "Krayon Jumbo 24 Warna", description: "Krayon besar yang mudah digenggam, aman dan tidak beracun.", priceIdr: 45000, category: "menggambar-mewarnai", query: "krayon jumbo anak", icon: Palette, color: "peach" },
  { id: "buku-mewarnai-balita", name: "Buku Mewarnai Balita", description: "Gambar besar dengan garis tebal, pas untuk latihan mewarnai pertama.", priceIdr: 25000, category: "menggambar-mewarnai", query: "buku mewarnai balita", icon: BookOpen, color: "sun" },
  { id: "papan-gambar-magnetik", name: "Papan Gambar Magnetik", description: "Gambar, hapus, gambar lagi. Tanpa tinta dan tanpa kotor.", priceIdr: 89000, category: "menggambar-mewarnai", query: "papan gambar magnetik anak", icon: Presentation, color: "sky" },
  { id: "cat-air-anak", name: "Set Cat Air Anak + Kuas", description: "Cat air warna cerah dengan kuas besar untuk eksplorasi warna.", priceIdr: 39000, category: "menggambar-mewarnai", query: "cat air anak set kuas", icon: Paintbrush, color: "lavender" },

  // Musik & Lagu
  { id: "xylophone-mainan", name: "Xylophone Kayu Pelangi", description: "Alat musik ketuk warna-warni untuk mengenal nada.", priceIdr: 79000, category: "musik-lagu", query: "xylophone kayu anak", icon: Piano, color: "sky" },
  { id: "drum-mainan", name: "Drum Mainan Anak", description: "Drum kecil dengan stik empuk, suaranya tidak terlalu keras.", priceIdr: 95000, category: "musik-lagu", query: "drum mainan anak", icon: Drum, color: "peach" },
  { id: "mikrofon-karaoke-anak", name: "Mikrofon Karaoke Anak", description: "Mikrofon dengan pengeras suara mini untuk bernyanyi bersama.", priceIdr: 69000, category: "musik-lagu", query: "mikrofon karaoke anak", icon: Mic, color: "lavender" },

  // Alam
  { id: "kaca-pembesar-anak", name: "Kaca Pembesar Anak", description: "Kaca pembesar plastik aman untuk menjelajah daun dan serangga.", priceIdr: 29000, category: "alam", query: "kaca pembesar anak", icon: Search, color: "mint" },
  { id: "set-berkebun-mini", name: "Set Berkebun Mini", description: "Sekop, garu, dan pot kecil untuk menanam bersama.", priceIdr: 59000, category: "alam", query: "set berkebun anak", icon: Sprout, color: "sun" },
  { id: "buku-stiker-alam", name: "Buku Stiker Alam", description: "Stiker bunga, pohon, dan awan yang bisa ditempel ulang.", priceIdr: 35000, category: "alam", query: "buku stiker anak alam", icon: Leaf, color: "mint" },

  // Kendaraan
  { id: "mobil-tarik-mundur", name: "Mobil-mobilan Tarik Mundur", description: "Tarik ke belakang, lepas, dan mobil melaju sendiri.", priceIdr: 35000, category: "kendaraan", query: "mainan mobil tarik mundur", icon: Car, color: "sky" },
  { id: "set-kereta-api-mainan", name: "Set Kereta Api Mainan", description: "Kereta dan rel yang bisa disusun sendiri.", priceIdr: 120000, category: "kendaraan", query: "mainan kereta api anak", icon: TrainFront, color: "lavender" },
  { id: "truk-konstruksi-mainan", name: "Truk Konstruksi Mainan", description: "Truk sampah, ekskavator, dan molen ukuran genggam.", priceIdr: 75000, category: "kendaraan", query: "mainan truk konstruksi anak", icon: Truck, color: "sun" },
  { id: "bus-sekolah-mainan", name: "Bus Sekolah Mainan", description: "Bus kuning dengan pintu yang bisa dibuka tutup.", priceIdr: 49000, category: "kendaraan", query: "mainan bus sekolah", icon: Bus, color: "sun" },

  // Bermain
  { id: "balok-susun-kayu", name: "Balok Susun Kayu", description: "Balok warna-warni untuk menyusun menara dan rumah.", priceIdr: 85000, category: "bermain", query: "balok susun kayu anak", icon: ToyBrick, color: "peach" },
  { id: "bola-sensorik", name: "Bola Sensorik (6 pcs)", description: "Bola bertekstur lembut untuk melatih indra peraba.", priceIdr: 45000, category: "bermain", query: "bola sensorik bayi", icon: Volleyball, color: "mint" },
  { id: "mainan-pancing-ikan", name: "Mainan Pancing Ikan Magnet", description: "Pancing ikan bermagnet untuk melatih koordinasi tangan.", priceIdr: 39000, category: "bermain", query: "mainan pancing ikan magnet", icon: Fish, color: "sky" },

  // Masak-masakan
  { id: "set-masak-mainan", name: "Set Masak-masakan", description: "Panci, wajan, dan spatula mini untuk koki cilik.", priceIdr: 79000, category: "masak-masakan", query: "mainan masak masakan anak", icon: CookingPot, color: "peach" },
  { id: "mainan-potong-buah", name: "Mainan Potong Buah", description: "Buah dan sayur berperekat yang bisa dipotong pisau mainan.", priceIdr: 55000, category: "masak-masakan", query: "mainan potong buah", icon: Apple, color: "mint" },
  { id: "set-teh-mainan", name: "Set Minum Teh Mainan", description: "Teko dan cangkir mini untuk pesta teh pura-pura.", priceIdr: 49000, category: "masak-masakan", query: "mainan tea set anak", icon: Coffee, color: "lavender" },

  // Belajar Warna & Bentuk
  { id: "shape-sorter-kayu", name: "Shape Sorter Kayu", description: "Masukkan bentuk ke lubang yang pas sambil belajar warna.", priceIdr: 65000, category: "warna-bentuk", query: "shape sorter kayu", icon: Shapes, color: "lavender" },
  { id: "kartu-flash-warna", name: "Kartu Flash Warna & Bentuk", description: "Kartu tebal bergambar untuk mengenal warna dan bentuk.", priceIdr: 30000, category: "warna-bentuk", query: "flash card warna bentuk anak", icon: Layers, color: "sky" },
  { id: "puzzle-geometri", name: "Puzzle Bentuk Geometri", description: "Lingkaran, segitiga, dan kotak dari kayu warna-warni.", priceIdr: 45000, category: "warna-bentuk", query: "puzzle geometri kayu anak", icon: Triangle, color: "sun" },
]

function tokopediaSearchUrl(query: string) {
  return `https://www.tokopedia.com/search?${new URLSearchParams({ st: "product", q: query })}`
}

function shopeeSearchUrl(query: string) {
  return `https://shopee.co.id/search?keyword=${encodeURIComponent(query)}`
}

function escapeXml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;")
}

function renderIllustration(item: CatalogItem) {
  const { fill, soft, ink } = ACCENT_HEX[item.color]
  const icon = renderToStaticMarkup(
    createElement(item.icon, { size: 150, color: ink, strokeWidth: 1.6 })
  ).replace("<svg ", '<svg x="125" y="75" ')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300" role="img" aria-label="${escapeXml(item.name)}">
  <rect width="400" height="300" fill="${soft}"/>
  <circle cx="200" cy="150" r="108" fill="${fill}" opacity="0.55"/>
  <circle cx="62" cy="60" r="18" fill="${fill}" opacity="0.5"/>
  <circle cx="345" cy="245" r="26" fill="${fill}" opacity="0.4"/>
  <circle cx="340" cy="58" r="9" fill="${ink}" opacity="0.18"/>
  <circle cx="70" cy="240" r="7" fill="${ink}" opacity="0.18"/>
  ${icon}
</svg>
`
}

export function buildProducts(): Product[] {
  return CATALOG.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    priceIdr: item.priceIdr,
    imageUrl: `/products/${item.id}.svg`,
    category: item.category,
    tokopediaUrl: tokopediaSearchUrl(item.query),
    shopeeUrl: shopeeSearchUrl(item.query),
  }))
}

/** Tulis data/products.json dan public/products/*.svg. */
export async function writeProducts(rootDir: string): Promise<Product[]> {
  const products = buildProducts()
  const imageDir = path.join(rootDir, "public", "products")
  await mkdir(imageDir, { recursive: true })

  await Promise.all(
    CATALOG.map((item) =>
      writeFile(path.join(imageDir, `${item.id}.svg`), renderIllustration(item))
    )
  )
  await writeFile(
    path.join(rootDir, "data", "products.json"),
    JSON.stringify(products, null, 2) + "\n"
  )
  return products
}
