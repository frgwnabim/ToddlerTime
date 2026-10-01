import { NextResponse, type NextRequest } from "next/server"

import { jakartaDate, shiftDate } from "@/lib/parental"
import { createClient } from "@/lib/supabase/server"

const MAX_DELTA_SECONDS = 900

/**
 * Tambah detik menonton (delta) ke screen_time. Dipanggil setiap 30 detik
 * dan lewat navigator.sendBeacon saat tab disembunyikan/ditutup.
 */
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 })
  }

  const { date, seconds } = (body ?? {}) as { date?: unknown; seconds?: unknown }
  const today = jakartaDate()
  if (typeof date !== "string" || (date !== today && date !== shiftDate(today, -1))) {
    return NextResponse.json({ error: "Tanggal tidak valid" }, { status: 400 })
  }
  if (typeof seconds !== "number" || !Number.isInteger(seconds) || seconds < 1 || seconds > MAX_DELTA_SECONDS) {
    return NextResponse.json({ error: "Detik tidak valid" }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return NextResponse.json({ error: "Belum masuk" }, { status: 401 })

  const { data, error } = await supabase.rpc("add_screen_time", { p_date: date, p_seconds: seconds })
  if (error) return NextResponse.json({ error: "Gagal menyimpan" }, { status: 500 })
  return NextResponse.json({ total: data })
}
