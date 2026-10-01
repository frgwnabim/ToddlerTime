"use server"

// Server Actions kontrol orang tua. PIN di-hash dengan bcryptjs di server dan
// hanya dibaca/ditulis lewat service role; PIN mentah & hash-nya tidak pernah
// dikirim ke client.

import bcrypt from "bcryptjs"

import { endParentSession, hasParentSession, startParentSession } from "@/lib/parental-session"
import {
  BREAK_RANGE,
  EXTRA_TIME_OPTIONS,
  isValidTime,
  jakartaDate,
  LIMIT_RANGE,
  MAX_PIN_ATTEMPTS,
  PIN_LENGTH,
  PIN_LOCK_MINUTES,
  type DayAllowance,
} from "@/lib/parental"
import { createAdminClient, hasAdminEnv } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export type ParentalResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string; code?: "auth" | "pin" | "config" }

const BCRYPT_ROUNDS = 10
const PIN_PATTERN = new RegExp(`^\\d{${PIN_LENGTH}}$`)

const AUTH_ERROR = { ok: false, error: "Sesi sudah berakhir. Silakan masuk lagi.", code: "auth" } as const
const CONFIG_ERROR = {
  ok: false,
  error: "Kontrol orang tua belum dikonfigurasi di server (SUPABASE_SERVICE_ROLE_KEY).",
  code: "config",
} as const
const PIN_REQUIRED = { ok: false, error: "Masukkan PIN orang tua dulu.", code: "pin" } as const
const GENERIC_ERROR = { ok: false, error: "Gagal menyimpan. Coba lagi, ya." } as const

async function getUser() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  return data.user
}

/** User yang sudah masuk + sesi orang tua (PIN sudah dimasukkan) yang masih berlaku. */
async function requireParent() {
  const user = await getUser()
  if (!user) return { error: AUTH_ERROR }
  if (!hasAdminEnv()) return { error: CONFIG_ERROR }
  if (!(await hasParentSession(user.id))) return { error: PIN_REQUIRED }
  return { user }
}

function checkNewPin(pin: string, confirm: string) {
  if (!PIN_PATTERN.test(pin)) return `PIN harus ${PIN_LENGTH} angka.`
  if (pin !== confirm) return "Kedua PIN belum sama. Coba ketik ulang."
  if (/^(\d)\1+$/.test(pin) || ["1234", "4321", "0123", "9876"].includes(pin)) {
    return "PIN terlalu mudah ditebak. Pilih kombinasi lain."
  }
  return null
}

// ---------------------------------------------------------------------------
// PIN

export async function setupPin(pin: string, confirm: string): Promise<ParentalResult> {
  const user = await getUser()
  if (!user) return AUTH_ERROR
  if (!hasAdminEnv()) return CONFIG_ERROR
  const problem = checkNewPin(pin, confirm)
  if (problem) return { ok: false, error: problem }

  const admin = createAdminClient()
  const { data: existing } = await admin
    .from("parental_settings")
    .select("pin_hash")
    .eq("user_id", user.id)
    .maybeSingle()
  if (existing?.pin_hash) return { ok: false, error: "PIN sudah dibuat. Masukkan PIN untuk membuka pengaturan." }

  const { error } = await admin.from("parental_settings").upsert({
    user_id: user.id,
    pin_hash: await bcrypt.hash(pin, BCRYPT_ROUNDS),
    pin_failed_attempts: 0,
    pin_locked_until: null,
  })
  if (error) return GENERIC_ERROR
  await startParentSession(user.id)
  return { ok: true }
}

export async function verifyPin(pin: string): Promise<ParentalResult> {
  const user = await getUser()
  if (!user) return AUTH_ERROR
  if (!hasAdminEnv()) return CONFIG_ERROR

  const admin = createAdminClient()
  const { data: settings } = await admin
    .from("parental_settings")
    .select("pin_hash, pin_failed_attempts, pin_locked_until")
    .eq("user_id", user.id)
    .maybeSingle()
  if (!settings?.pin_hash) return { ok: false, error: "PIN belum dibuat. Buat PIN di halaman Kontrol Orang Tua." }

  const lockedUntil = settings.pin_locked_until ? new Date(settings.pin_locked_until).getTime() : 0
  if (lockedUntil > Date.now()) {
    const minutes = Math.ceil((lockedUntil - Date.now()) / 60_000)
    return { ok: false, error: `Terlalu banyak percobaan. Coba lagi dalam ${minutes} menit.` }
  }

  const valid = PIN_PATTERN.test(pin) && (await bcrypt.compare(pin, settings.pin_hash))
  if (!valid) {
    const attempts = settings.pin_failed_attempts + 1
    const locked = attempts >= MAX_PIN_ATTEMPTS
    await admin
      .from("parental_settings")
      .update({
        pin_failed_attempts: locked ? 0 : attempts,
        pin_locked_until: locked ? new Date(Date.now() + PIN_LOCK_MINUTES * 60_000).toISOString() : null,
      })
      .eq("user_id", user.id)
    return {
      ok: false,
      error: locked
        ? `PIN salah ${MAX_PIN_ATTEMPTS} kali. Coba lagi dalam ${PIN_LOCK_MINUTES} menit.`
        : `PIN salah. Sisa ${MAX_PIN_ATTEMPTS - attempts} percobaan.`,
    }
  }

  if (settings.pin_failed_attempts > 0 || settings.pin_locked_until) {
    await admin
      .from("parental_settings")
      .update({ pin_failed_attempts: 0, pin_locked_until: null })
      .eq("user_id", user.id)
  }
  await startParentSession(user.id)
  return { ok: true }
}

export async function changePin(pin: string, confirm: string): Promise<ParentalResult> {
  const parent = await requireParent()
  if (parent.error) return parent.error
  const problem = checkNewPin(pin, confirm)
  if (problem) return { ok: false, error: problem }

  const { error } = await createAdminClient()
    .from("parental_settings")
    .update({ pin_hash: await bcrypt.hash(pin, BCRYPT_ROUNDS), pin_failed_attempts: 0, pin_locked_until: null })
    .eq("user_id", parent.user.id)
  return error ? GENERIC_ERROR : { ok: true }
}

/** Tutup sesi orang tua (kunci kembali halaman pengaturan). */
export async function lockParentSettings(): Promise<ParentalResult> {
  await endParentSession()
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Pengaturan

export type SettingsInput = {
  dailyLimitMinutes: number | null
  bedtimeStart: string | null
  bedtimeEnd: string | null
  breakReminderMinutes: number | null
}

function inRange(value: number | null, range: { min: number; max: number }) {
  return value === null || (Number.isInteger(value) && value >= range.min && value <= range.max)
}

export async function updateParentalSettings(input: SettingsInput): Promise<ParentalResult> {
  const parent = await requireParent()
  if (parent.error) return parent.error

  if (!inRange(input.dailyLimitMinutes, LIMIT_RANGE)) {
    return { ok: false, error: `Batas harian harus ${LIMIT_RANGE.min}-${LIMIT_RANGE.max} menit.` }
  }
  if (!inRange(input.breakReminderMinutes, BREAK_RANGE)) {
    return { ok: false, error: `Pengingat istirahat harus ${BREAK_RANGE.min}-${BREAK_RANGE.max} menit.` }
  }
  const hasBedtime = input.bedtimeStart !== null || input.bedtimeEnd !== null
  if (hasBedtime) {
    if (!input.bedtimeStart || !input.bedtimeEnd || !isValidTime(input.bedtimeStart) || !isValidTime(input.bedtimeEnd)) {
      return { ok: false, error: "Isi jam mulai dan selesai jam tidur." }
    }
    if (input.bedtimeStart === input.bedtimeEnd) return { ok: false, error: "Jam mulai dan selesai tidak boleh sama." }
  }

  const { error } = await createAdminClient()
    .from("parental_settings")
    .upsert({
      user_id: parent.user.id,
      daily_limit_minutes: input.dailyLimitMinutes,
      bedtime_start: hasBedtime ? input.bedtimeStart : null,
      bedtime_end: hasBedtime ? input.bedtimeEnd : null,
      break_reminder_minutes: input.breakReminderMinutes,
    })
  return error ? GENERIC_ERROR : { ok: true }
}

// ---------------------------------------------------------------------------
// Kelonggaran dari layar kunci

export type ExtraTimeOption = (typeof EXTRA_TIME_OPTIONS)[number] | "unlock"

/** Tambah waktu atau buka kunci untuk hari ini. Butuh PIN; sesi ditutup sesudahnya. */
export async function grantExtraTime(option: ExtraTimeOption): Promise<ParentalResult<DayAllowance>> {
  const parent = await requireParent()
  if (parent.error) return parent.error
  if (option !== "unlock" && !EXTRA_TIME_OPTIONS.includes(option)) return GENERIC_ERROR

  const admin = createAdminClient()
  const date = jakartaDate()
  const { data: current } = await admin
    .from("screen_time")
    .select("bonus_minutes, unlocked, override_until")
    .eq("user_id", parent.user.id)
    .eq("date", date)
    .maybeSingle()

  const update =
    option === "unlock"
      ? { unlocked: true }
      : {
          bonus_minutes: Math.min(600, (current?.bonus_minutes ?? 0) + option),
          override_until: new Date(Date.now() + option * 60_000).toISOString(),
        }

  const { data, error } = await admin
    .from("screen_time")
    .upsert({ user_id: parent.user.id, date, ...update })
    .select("date, bonus_minutes, unlocked, override_until")
    .single()
  await endParentSession()
  if (error || !data) return GENERIC_ERROR

  return {
    ok: true,
    data: {
      date: data.date,
      bonusMinutes: data.bonus_minutes,
      unlocked: data.unlocked,
      overrideUntil: data.override_until,
    },
  }
}
