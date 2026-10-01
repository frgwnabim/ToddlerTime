"use client"

import { useSyncExternalStore } from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { applyTheme } from "@/lib/theme"

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  })
  return () => observer.disconnect()
}

function getIsNight() {
  return document.documentElement.classList.contains("dark")
}

export function ThemeToggle({ className }: { className?: string }) {
  const isNight = useSyncExternalStore(subscribe, getIsNight, () => false)

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={() => applyTheme(isNight ? "light" : "dark")}
      aria-label={isNight ? "Ganti ke mode siang" : "Ganti ke mode malam"}
      title={isNight ? "Mode siang" : "Mode malam"}
    >
      {isNight ? <Sun /> : <Moon />}
    </Button>
  )
}
