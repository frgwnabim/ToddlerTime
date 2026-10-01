"use client"

import { Suspense, useState } from "react"
import { ArrowLeft, Menu, Search } from "lucide-react"

import { UserMenu } from "@/components/auth/user-menu"
import { ScreenTimeIndicator } from "@/components/parental/screen-time-indicator"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Logo } from "./logo"
import { SearchBar, SearchBarFallback } from "./search-bar"
import { ThemeToggle } from "./theme-toggle"

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 h-16 bg-background/95 backdrop-blur">
      {/* Search layar penuh di mobile */}
      {mobileSearchOpen && (
        <div className="flex h-full items-center gap-2 px-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileSearchOpen(false)}
            aria-label="Tutup pencarian"
          >
            <ArrowLeft />
          </Button>
          <Suspense fallback={<SearchBarFallback autoFocus />}>
            <SearchBar autoFocus onSearch={() => setMobileSearchOpen(false)} />
          </Suspense>
        </div>
      )}

      <div
        className={cn(
          "flex h-full items-center gap-2 px-2 sm:px-4",
          mobileSearchOpen && "hidden md:flex"
        )}
      >
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onMenuClick} aria-label="Buka atau tutup menu">
            <Menu />
          </Button>
          <Logo />
        </div>

        <div className="mx-auto hidden w-full max-w-xl px-4 md:block">
          <Suspense fallback={<SearchBarFallback />}>
            <SearchBar />
          </Suspense>
        </div>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileSearchOpen(true)}
            aria-label="Cari video"
          >
            <Search />
          </Button>
          <ScreenTimeIndicator />
          <ThemeToggle className="hidden sm:inline-flex" />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
