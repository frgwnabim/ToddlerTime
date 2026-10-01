// Aturan kontrol orang tua yang dipakai bersama oleh client & server.
// Semua "hari" mengikuti zona waktu Asia/Jakarta.

const TIME_ZONE = "Asia/Jakarta"

export const DAILY_LIMIT_PRESETS = [15, 30, 45, 60, 90] as const
export const BREAK_PRESETS = [10, 15, 20, 30] as const
export const EXTRA_TIME_OPTIONS = [10, 15, 30] as const
export const WARNING_BEFORE_SECONDS = 5 * 60

export const LIMIT_RANGE = { min: 5, max: 600 }
export const BREAK_RANGE = { min: 5, max: 180 }

export const PIN_LENGTH = 4
export const MAX_PIN_ATTEMPTS = 5
export const PIN_LOCK_MINUTES = 5

export type ParentalSettings = {
  dailyLimitMinutes: number | null
  /** "HH:MM" */
  bedtimeStart: string | null
  bedtimeEnd: string | null
  breakReminderMinutes: number | null
  hasPin: boolean
}

export type DayAllowance = {
  /** "YYYY-MM-DD" (Asia/Jakarta) */
  date: string
  bonusMinutes: number
  unlocked: boolean
  /** ISO; jam tidur diabaikan sampai waktu ini. */
  overrideUntil: string | null
}

export type LockReason = "limit" | "bedtime"

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
})

/** Tanggal hari ini di Jakarta, "YYYY-MM-DD". */
export function jakartaDate(at: Date = new Date()): string {
  return dateFormatter.format(at)
}

/** Menit sejak tengah malam di Jakarta (0-1439). */
function jakartaMinutes(at: Date = new Date()): number {
  const [hours, minutes] = timeFormatter.format(at).split(":").map(Number)
  return hours * 60 + minutes
}

/** "YYYY-MM-DD" n hari sebelum tanggal tersebut. */
export function shiftDate(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number)
  const shifted = new Date(Date.UTC(year, month - 1, day + days))
  return shifted.toISOString().slice(0, 10)
}

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/

export function isValidTime(value: string): boolean {
  return TIME_PATTERN.test(value)
}

/** "19:30:00" atau "19:30" -> "19:30" */
export function toHHMM(value: string | null): string | null {
  return value && isValidTime(value) ? value.slice(0, 5) : null
}

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number)
  return hours * 60 + minutes
}

/** Apakah sekarang jam tidur (mendukung rentang lewat tengah malam, mis. 19:30-06:00). */
export function isBedtime(settings: ParentalSettings, at: Date = new Date()): boolean {
  if (!settings.bedtimeStart || !settings.bedtimeEnd) return false
  const start = timeToMinutes(settings.bedtimeStart)
  const end = timeToMinutes(settings.bedtimeEnd)
  if (start === end) return false
  const now = jakartaMinutes(at)
  return start < end ? now >= start && now < end : now >= start || now < end
}

/** Sisa detik menonton hari ini, atau null bila tidak dibatasi. */
export function remainingSeconds(
  settings: ParentalSettings | null,
  allowance: DayAllowance,
  secondsToday: number
): number | null {
  if (!settings?.dailyLimitMinutes || allowance.unlocked) return null
  const allowed = (settings.dailyLimitMinutes + allowance.bonusMinutes) * 60
  return Math.max(0, allowed - secondsToday)
}

/** Alasan layar dikunci saat ini, atau null. */
export function lockReason(
  settings: ParentalSettings | null,
  allowance: DayAllowance,
  secondsToday: number,
  at: Date = new Date()
): LockReason | null {
  if (!settings || allowance.unlocked) return null
  const overridden = allowance.overrideUntil !== null && new Date(allowance.overrideUntil).getTime() > at.getTime()
  if (!overridden && isBedtime(settings, at)) return "bedtime"
  const remaining = remainingSeconds(settings, allowance, secondsToday)
  if (remaining !== null && remaining <= 0) return "limit"
  return null
}

export function emptyAllowance(date: string): DayAllowance {
  return { date, bonusMinutes: 0, unlocked: false, overrideUntil: null }
}
