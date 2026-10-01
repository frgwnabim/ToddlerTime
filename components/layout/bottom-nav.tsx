"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { compactNav, isActivePath } from "./nav-items"

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Navigasi bawah"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-4">
        {compactNav.map((item) => {
          const Icon = item.icon
          const active = isActivePath(pathname, item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-[0.7rem] font-bold transition-colors outline-none focus-visible:bg-muted",
                  active ? "text-sky-ink" : "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "grid h-8 w-14 place-items-center rounded-full transition-colors",
                    active && "bg-sky-soft"
                  )}
                >
                  <Icon className={cn("size-5", active && "stroke-[2.5]")} aria-hidden="true" />
                </span>
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
