import type { AccentColor } from "@/types"

// Kelas Tailwind per warna aksen. Ditulis lengkap (bukan template string)
// supaya terdeteksi oleh Tailwind saat build.
export const accentClasses: Record<
  AccentColor,
  { fill: string; soft: string; ink: string; banner: string }
> = {
  sky: {
    fill: "bg-sky text-sky-foreground",
    soft: "bg-sky-soft text-sky-ink",
    ink: "text-sky-ink",
    banner: "from-sky-soft via-lavender-soft to-mint-soft",
  },
  mint: {
    fill: "bg-mint text-mint-foreground",
    soft: "bg-mint-soft text-mint-ink",
    ink: "text-mint-ink",
    banner: "from-mint-soft via-sky-soft to-sun-soft",
  },
  sun: {
    fill: "bg-sun text-sun-foreground",
    soft: "bg-sun-soft text-sun-ink",
    ink: "text-sun-ink",
    banner: "from-sun-soft via-peach-soft to-mint-soft",
  },
  peach: {
    fill: "bg-peach text-peach-foreground",
    soft: "bg-peach-soft text-peach-ink",
    ink: "text-peach-ink",
    banner: "from-peach-soft via-sun-soft to-lavender-soft",
  },
  lavender: {
    fill: "bg-lavender text-lavender-foreground",
    soft: "bg-lavender-soft text-lavender-ink",
    ink: "text-lavender-ink",
    banner: "from-lavender-soft via-peach-soft to-sky-soft",
  },
}

const ACCENTS: AccentColor[] = ["sky", "mint", "sun", "peach", "lavender"]

/** Warna aksen yang stabil untuk sebuah id (mis. banner channel). */
export function accentForId(id: string): AccentColor {
  let hash = 0
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return ACCENTS[hash % ACCENTS.length]
}
