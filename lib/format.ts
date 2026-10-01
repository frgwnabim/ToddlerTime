// Format angka & tanggal dengan locale id-ID.

const LOCALE = "id-ID"

const compactNumber = new Intl.NumberFormat(LOCALE, {
  notation: "compact",
  maximumFractionDigits: 1,
})
const fullNumber = new Intl.NumberFormat(LOCALE)
const rupiah = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
})
const longDate = new Intl.DateTimeFormat(LOCALE, { dateStyle: "long" })

/** 1200 -> "1,2 rb", 7020000 -> "7 jt" */
export function formatCompactNumber(value: number): string {
  return compactNumber.format(value)
}

export function formatNumber(value: number): string {
  return fullNumber.format(value)
}

/** "1,2 rb x ditonton" */
export function formatViews(views: number): string {
  return `${formatCompactNumber(views)} x ditonton`
}

/** "7 jt subscriber" */
export function formatSubscribers(count: number): string {
  return count > 0 ? `${formatCompactNumber(count)} subscriber` : "Subscriber disembunyikan"
}

/** Rp45.000 */
export function formatPrice(priceIdr: number): string {
  return rupiah.format(priceIdr).replace(/\s/g, "")
}

/** 4 Agustus 2024 */
export function formatDate(iso: string): string {
  return longDate.format(new Date(iso))
}

/** 394 -> "6:34", 3725 -> "1:02:05" */
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const ss = String(seconds).padStart(2, "0")
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${ss}` : `${minutes}:${ss}`
}

/** Durasi untuk pembaca layar: "6 menit 34 detik" */
export function formatDurationLabel(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [
    hours && `${hours} jam`,
    minutes && `${minutes} menit`,
    seconds && `${seconds} detik`,
  ]
    .filter(Boolean)
    .join(" ")
}

const RELATIVE_UNITS: [label: string, seconds: number][] = [
  ["tahun", 365 * 24 * 3600],
  ["bulan", 30 * 24 * 3600],
  ["minggu", 7 * 24 * 3600],
  ["hari", 24 * 3600],
  ["jam", 3600],
  ["menit", 60],
]

/** "3 hari lalu", "2 tahun lalu" */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const diffSeconds = Math.max(0, (now.getTime() - new Date(iso).getTime()) / 1000)
  for (const [label, seconds] of RELATIVE_UNITS) {
    const value = Math.floor(diffSeconds / seconds)
    if (value >= 1) return `${value} ${label} lalu`
  }
  return "Baru saja"
}
