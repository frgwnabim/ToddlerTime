import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { Mascot, type MascotMood } from "./mascot"

export function EmptyState({
  title,
  description,
  icon: Icon,
  mood = "curious",
  action,
  className,
}: {
  title: string
  description?: ReactNode
  icon?: LucideIcon
  mood?: MascotMood
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("mx-auto flex max-w-md flex-col items-center px-4 py-14 text-center", className)}>
      <div className="relative mb-6">
        <div className="absolute inset-x-2 -bottom-1 h-4 rounded-full bg-foreground/5 blur-sm" aria-hidden="true" />
        <div className="grid size-36 place-items-center rounded-full bg-sky-soft/70">
          <Mascot mood={mood} className="size-24" />
        </div>
        {Icon && (
          <span className="absolute -top-1 -right-2 grid size-12 place-items-center rounded-2xl bg-card text-peach-ink shadow-soft">
            <Icon className="size-6" aria-hidden="true" />
          </span>
        )}
      </div>
      <h2 className="text-2xl font-bold">{title}</h2>
      {description && <p className="mt-2 text-muted-foreground">{description}</p>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  )
}
