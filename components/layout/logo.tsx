import Link from "next/link"

import { cn } from "@/lib/utils"
import { Mascot } from "./mascot"

export function Logo({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="ToddlerTime, ke beranda"
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-2xl px-1 outline-none focus-visible:ring-4 focus-visible:ring-ring",
        className
      )}
    >
      <Mascot className="size-8 sm:size-9" />
      <span className="font-heading text-xl leading-none sm:text-[1.4rem] font-extrabold tracking-tight">
        Toddler<span className="text-peach-ink">Time</span>
      </span>
    </Link>
  )
}
