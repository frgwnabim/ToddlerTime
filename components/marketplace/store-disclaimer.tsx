import { ShieldCheck } from "lucide-react"

import { cn } from "@/lib/utils"

export function StoreDisclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-start gap-2 text-xs text-muted-foreground", className)}>
      <ShieldCheck className="mt-px size-4 shrink-0 text-lavender-ink" aria-hidden="true" />
      <span>
        Link mengarah ke hasil pencarian di Tokopedia dan Shopee (toko pihak ketiga), dibuka di tab baru setelah
        orang tua menjawab soal hitungan. ToddlerTime tidak menjual produk ini.
      </span>
    </p>
  )
}
