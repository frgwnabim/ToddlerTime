"use client"

import { usePathname } from "next/navigation"
import { useState, type ReactNode } from "react"

import { AuthProvider } from "@/components/auth/auth-provider"
import { ParentalGateProvider } from "@/components/marketplace/parental-gate"
import { ParentalControlsProvider } from "@/components/parental/parental-provider"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { ToastProvider } from "@/components/ui/toaster"
import { WatchProgressProvider } from "@/components/video/watch-progress"
import { cn } from "@/lib/utils"
import { BottomNav } from "./bottom-nav"
import { Header } from "./header"
import { Logo } from "./logo"
import type { ShellChannel } from "./nav-items"
import { MiniSidebarNav, SidebarNav } from "./sidebar"
import { ThemeToggle } from "./theme-toggle"

/**
 * Kerangka halaman ala YouTube:
 * - < md   : tanpa sidebar, bottom navigation, hamburger membuka drawer
 * - md-lg  : mini sidebar, hamburger membuka drawer
 * - >= lg  : sidebar penuh, hamburger menciutkannya jadi mini sidebar
 * Halaman tonton (/watch) dan halaman masuk/daftar tanpa sidebar; menu lewat drawer.
 */
export function AppShell({ channels, children }: { channels: ShellChannel[]; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()
  const hideSidebar = pathname.startsWith("/watch/") || pathname === "/login" || pathname === "/register"

  function handleMenuClick() {
    if (!hideSidebar && window.matchMedia("(min-width: 1024px)").matches) {
      setCollapsed((value) => !value)
    } else {
      setDrawerOpen(true)
    }
  }

  const closeDrawer = () => setDrawerOpen(false)

  return (
    <AppProviders>
      <a
        href="#konten"
        className="sr-only z-50 rounded-2xl bg-card px-4 py-2 font-bold shadow-lift focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Langsung ke konten
      </a>
      <Header onMenuClick={handleMenuClick} />

      <div className="flex flex-1">
        {!hideSidebar && (
          <aside
            className={cn(
              "sticky top-16 hidden h-[calc(100dvh-4rem)] shrink-0 overflow-y-auto overscroll-contain pt-1 [scrollbar-width:thin] md:block",
              collapsed ? "w-20" : "w-20 lg:w-60"
            )}
          >
            <div className={cn(!collapsed && "lg:hidden")}>
              <MiniSidebarNav />
            </div>
            {!collapsed && (
              <div className="hidden lg:block">
                <SidebarNav channels={channels} />
              </div>
            )}
          </aside>
        )}

        <main id="konten" className="@container min-w-0 flex-1 pb-24 md:pb-12">
          {children}
        </main>
      </div>

      <BottomNav />

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" aria-describedby={undefined}>
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="flex h-16 shrink-0 items-center px-4">
            <Logo onClick={closeDrawer} />
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <SidebarNav channels={channels} onNavigate={closeDrawer} />
          </div>
          <div className="flex shrink-0 items-center justify-between border-t px-6 py-3">
            <span className="text-sm font-bold">Mode malam</span>
            <ThemeToggle />
          </div>
        </SheetContent>
      </Sheet>
    </AppProviders>
  )
}

/**
 * Context global: toast, status login + modal "Masuk dulu", progress tonton
 * (bar di thumbnail), kontrol orang tua (waktu tonton, kunci, istirahat),
 * dan gerbang orang tua untuk link toko.
 */
function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <WatchProgressProvider>
          <ParentalControlsProvider>
            <ParentalGateProvider>{children}</ParentalGateProvider>
          </ParentalControlsProvider>
        </WatchProgressProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
