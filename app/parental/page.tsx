import type { Metadata } from "next"
import type { ReactNode } from "react"
import { KeyRound, ShieldCheck, TriangleAlert } from "lucide-react"

import { CollectionHeader } from "@/components/layout/collection-header"
import { EmptyState } from "@/components/layout/empty-state"
import { LoginRequired } from "@/components/layout/login-required"
import { PageContainer } from "@/components/layout/page-container"
import { ChangePinForm, PinSetupForm, PinUnlockForm } from "@/components/parental/pin-forms"
import { ScreenTimeChart, type DayPoint } from "@/components/parental/screen-time-chart"
import { LockSettingsButton, ParentalSettingsForm } from "@/components/parental/settings-form"
import { TodaySummary } from "@/components/parental/today-summary"
import { jakartaDate, shiftDate, toHHMM } from "@/lib/parental"
import { hasParentSession } from "@/lib/parental-session"
import { hasAdminEnv } from "@/lib/supabase/admin"
import { getSessionUser } from "@/lib/supabase/queries"

export const metadata: Metadata = { title: "Kontrol Orang Tua", robots: { index: false } }

const weekdayShort = new Intl.DateTimeFormat("id-ID", { weekday: "short", timeZone: "UTC" })
const longDate = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })

function GateCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="mx-auto mt-4 max-w-md rounded-3xl bg-card p-6 text-center shadow-soft ring-1 ring-border sm:p-8">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-lavender-soft text-lavender-ink">
        <KeyRound className="size-7" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-2xl font-bold">{title}</h2>
      <p className="mt-1 mb-6 text-muted-foreground">{description}</p>
      {children}
    </div>
  )
}

export default async function ParentalPage() {
  const { supabase, user } = await getSessionUser()

  const header = (
    <CollectionHeader
      icon={ShieldCheck}
      title="Kontrol Orang Tua"
      description="Atur waktu menonton si kecil dengan tenang."
    />
  )

  if (!user) {
    return (
      <PageContainer className="max-w-3xl py-6">
        {header}
        <LoginRequired
          icon={ShieldCheck}
          next="/parental"
          description="Atur batas waktu, jam tidur, pengingat istirahat, dan PIN orang tua setelah masuk."
        />
      </PageContainer>
    )
  }

  if (!hasAdminEnv()) {
    return (
      <PageContainer className="max-w-3xl py-6">
        {header}
        <EmptyState
          mood="curious"
          icon={TriangleAlert}
          title="Belum dikonfigurasi"
          description="Isi SUPABASE_SERVICE_ROLE_KEY di environment server untuk mengaktifkan PIN dan kontrol orang tua."
        />
      </PageContainer>
    )
  }

  const { data: settings } = await supabase
    .from("parental_settings")
    .select("daily_limit_minutes, bedtime_start, bedtime_end, break_reminder_minutes, has_pin")
    .maybeSingle()

  if (!settings?.has_pin) {
    return (
      <PageContainer className="max-w-3xl py-6">
        {header}
        <GateCard
          title="Buat PIN orang tua"
          description="PIN dipakai untuk membuka pengaturan dan menambah waktu menonton."
        >
          <PinSetupForm />
        </GateCard>
      </PageContainer>
    )
  }

  if (!(await hasParentSession(user.id))) {
    return (
      <PageContainer className="max-w-3xl py-6">
        {header}
        <GateCard title="Khusus orang tua" description="Masukkan PIN untuk mengubah pengaturan.">
          <PinUnlockForm />
        </GateCard>
      </PageContainer>
    )
  }

  // Ringkasan 7 hari terakhir (Asia/Jakarta).
  const today = jakartaDate()
  const from = shiftDate(today, -6)
  const { data: rows } = await supabase
    .from("screen_time")
    .select("date, seconds_watched")
    .gte("date", from)
    .lte("date", today)
  const secondsByDate = new Map((rows ?? []).map((row) => [row.date, row.seconds_watched]))
  const days: DayPoint[] = Array.from({ length: 7 }, (_, index) => {
    const date = shiftDate(from, index)
    const asUtc = new Date(`${date}T00:00:00Z`)
    return {
      date,
      label: date === today ? "Hari ini" : weekdayShort.format(asUtc),
      longLabel: longDate.format(asUtc),
      minutes: Math.floor((secondsByDate.get(date) ?? 0) / 60),
    }
  })

  return (
    <PageContainer className="max-w-4xl py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        {header}
        <LockSettingsButton />
      </div>

      <section aria-label="Ringkasan waktu menonton" className="grid gap-6 rounded-3xl bg-card p-6 shadow-soft ring-1 ring-border md:grid-cols-[14rem_1fr]">
        <TodaySummary initialSeconds={secondsByDate.get(today) ?? 0} />
        <div>
          <h2 className="mb-2 font-sans text-base font-bold">Waktu menonton 7 hari terakhir (menit)</h2>
          <ScreenTimeChart data={days} limitMinutes={settings.daily_limit_minutes} />
        </div>
      </section>

      <section aria-labelledby="pengaturan-title" className="mt-8">
        <h2 id="pengaturan-title" className="mb-4 text-xl font-bold">
          Pengaturan
        </h2>
        <ParentalSettingsForm
          initial={{
            dailyLimitMinutes: settings.daily_limit_minutes,
            bedtimeStart: toHHMM(settings.bedtime_start),
            bedtimeEnd: toHHMM(settings.bedtime_end),
            breakReminderMinutes: settings.break_reminder_minutes,
          }}
        />
      </section>

      <section aria-labelledby="pin-title" className="mt-8 rounded-2xl bg-card p-5 shadow-soft ring-1 ring-border">
        <h2 id="pin-title" className="mb-4 font-heading text-lg font-bold">
          Ganti PIN
        </h2>
        <ChangePinForm />
      </section>
    </PageContainer>
  )
}
