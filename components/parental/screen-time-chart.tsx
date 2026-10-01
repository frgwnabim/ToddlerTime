"use client"

import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export type DayPoint = {
  date: string
  /** Label sumbu X, mis. "Sen" / "Hari ini". */
  label: string
  /** Label panjang untuk tooltip & tabel, mis. "Senin, 28 September". */
  longLabel: string
  minutes: number
}

type TooltipProps = { active?: boolean; payload?: { payload: DayPoint }[] }

function ChartTooltip({ active, payload }: TooltipProps) {
  const point = payload?.[0]?.payload
  if (!active || !point) return null
  return (
    <div className="rounded-xl bg-popover px-3 py-2 text-sm text-popover-foreground shadow-lift ring-1 ring-border">
      <p className="font-semibold">{point.longLabel}</p>
      <p className="text-muted-foreground">
        <span className="font-bold text-foreground tabular-nums">{point.minutes}</span> menit menonton
      </p>
    </div>
  )
}

/** Grafik batang waktu menonton 7 hari terakhir (satu seri: menit per hari). */
export function ScreenTimeChart({ data, limitMinutes }: { data: DayPoint[]; limitMinutes: number | null }) {
  const maxMinutes = Math.max(...data.map((point) => point.minutes), limitMinutes ?? 0, 10)

  return (
    <figure>
      <div className="h-56 w-full" role="img" aria-label="Grafik menit menonton per hari, 7 hari terakhir">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: -12 }} barCategoryGap="30%">
            <CartesianGrid vertical={false} stroke="var(--border)" strokeWidth={1} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <YAxis
              allowDecimals={false}
              domain={[0, Math.ceil(maxMinutes / 10) * 10]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              width={44}
            />
            {limitMinutes !== null && (
              <ReferenceLine
                y={limitMinutes}
                stroke="var(--muted-foreground)"
                strokeWidth={1}
                label={{
                  value: `Batas ${limitMinutes} mnt`,
                  position: "insideTopRight",
                  fill: "var(--muted-foreground)",
                  fontSize: 12,
                }}
              />
            )}
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)", radius: 8 }} />
            <Bar dataKey="minutes" fill="var(--chart-bar)" radius={[4, 4, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <details className="mt-3 text-sm">
        <summary className="w-fit cursor-pointer rounded-lg font-semibold text-sky-ink">Lihat sebagai tabel</summary>
        <table className="mt-2 w-full max-w-sm text-left">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th scope="col" className="py-1.5 font-semibold">
                Hari
              </th>
              <th scope="col" className="py-1.5 text-right font-semibold">
                Menit
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((point) => (
              <tr key={point.date} className="border-b last:border-0">
                <td className="py-1.5">{point.longLabel}</td>
                <td className="py-1.5 text-right tabular-nums">{point.minutes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  )
}
