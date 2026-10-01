import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Chip kategori ala YouTube. Gunakan `selected` untuk chip yang aktif.
const chipVariants = cva(
  "inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full border-2 px-4 text-sm font-bold whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-4 focus-visible:ring-ring active:scale-95 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      color: {
        neutral:
          "border-transparent bg-muted text-foreground hover:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_6%)] data-[selected=true]:bg-foreground data-[selected=true]:text-background",
        sky: "border-transparent bg-sky-soft text-sky-ink hover:border-sky data-[selected=true]:bg-sky data-[selected=true]:text-sky-foreground",
        mint: "border-transparent bg-mint-soft text-mint-ink hover:border-mint data-[selected=true]:bg-mint data-[selected=true]:text-mint-foreground",
        sun: "border-transparent bg-sun-soft text-sun-ink hover:border-sun data-[selected=true]:bg-sun data-[selected=true]:text-sun-foreground",
        peach:
          "border-transparent bg-peach-soft text-peach-ink hover:border-peach data-[selected=true]:bg-peach data-[selected=true]:text-peach-foreground",
        lavender:
          "border-transparent bg-lavender-soft text-lavender-ink hover:border-lavender data-[selected=true]:bg-lavender data-[selected=true]:text-lavender-foreground",
      },
    },
    defaultVariants: {
      color: "neutral",
    },
  }
)

function Chip({
  className,
  color,
  selected = false,
  type = "button",
  ...props
}: Omit<React.ComponentProps<"button">, "color"> &
  VariantProps<typeof chipVariants> & { selected?: boolean }) {
  return (
    <button
      type={type}
      data-slot="chip"
      data-selected={selected}
      aria-pressed={selected}
      className={cn(chipVariants({ color }), className)}
      {...props}
    />
  )
}

export { Chip, chipVariants }
