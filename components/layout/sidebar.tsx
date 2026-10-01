"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, type ReactNode } from "react"
import { ChevronDown, ChevronUp, LogIn, ShieldCheck } from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { loginHref } from "@/lib/auth-redirect"
import { cn } from "@/lib/utils"
import {
  compactNav,
  isActivePath,
  libraryNav,
  mainNav,
  type NavItem,
  type ShellChannel,
} from "./nav-items"

const VISIBLE_CHANNELS = 7

const linkBase =
  "flex h-11 items-center rounded-2xl px-3 transition-colors outline-none focus-visible:ring-4 focus-visible:ring-ring"

function SidebarLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem
  active: boolean
  onNavigate?: () => void
}) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        linkBase,
        "gap-4 text-[0.95rem] font-semibold",
        active ? "bg-sky-soft font-bold text-sky-ink" : "text-foreground hover:bg-muted"
      )}
    >
      <Icon className={cn("size-5 shrink-0", active && "stroke-[2.5]")} aria-hidden="true" />
      <span className="truncate">{item.label}</span>
    </Link>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="px-3 pt-1 pb-1 font-sans text-sm font-bold text-muted-foreground">{children}</h2>
}

/** Isi sidebar penuh, dipakai di desktop dan di drawer mobile. */
export function SidebarNav({
  channels,
  onNavigate,
}: {
  channels: ShellChannel[]
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const { status } = useAuth()
  const [showAll, setShowAll] = useState(false)
  const visibleChannels = showAll ? channels : channels.slice(0, VISIBLE_CHANNELS)
  const hiddenCount = channels.length - VISIBLE_CHANNELS

  return (
    <nav aria-label="Navigasi utama" className="flex flex-col gap-1 px-3 pb-6">
      {mainNav.map((item) => (
        <SidebarLink
          key={item.href}
          item={item}
          active={isActivePath(pathname, item.href)}
          onNavigate={onNavigate}
        />
      ))}

      <hr className="mx-3 my-3 border-border" />
      <SectionTitle>Koleksiku</SectionTitle>
      {status === "authenticated" ? (
        libraryNav.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            active={isActivePath(pathname, item.href)}
            onNavigate={onNavigate}
          />
        ))
      ) : status === "guest" ? (
        <div className="mx-1 rounded-2xl bg-sky-soft p-4 text-sky-ink">
          <p className="text-sm leading-snug font-semibold">
            Masuk untuk menyimpan Tonton Nanti, Favorit, Riwayat, dan Langganan si kecil.
          </p>
          <Button asChild size="sm" className="mt-3 w-full">
            <Link href={loginHref(pathname)} onClick={onNavigate}>
              <LogIn data-icon="inline-start" />
              Masuk
            </Link>
          </Button>
          <p className="mt-3 flex gap-1.5 text-xs leading-snug">
            <ShieldCheck className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            Kontrol orang tua (batas waktu, jam tidur, pengingat istirahat) tersedia setelah masuk.
          </p>
        </div>
      ) : (
        <Skeleton className="mx-1 h-28 rounded-2xl" aria-hidden="true" />
      )}

      <hr className="mx-3 my-3 border-border" />
      <SectionTitle>Channel</SectionTitle>
      <ul className="flex flex-col gap-0.5">
        {visibleChannels.map((channel) => {
          const href = `/channel/${channel.handle}`
          const active = pathname === href
          return (
            <li key={channel.id}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  linkBase,
                  "gap-3 text-sm font-semibold",
                  active ? "bg-sky-soft text-sky-ink" : "hover:bg-muted"
                )}
              >
                <Image
                  src={channel.avatarUrl}
                  alt=""
                  width={28}
                  height={28}
                  className="size-7 shrink-0 rounded-full bg-muted object-cover"
                />
                <span className="truncate">{channel.name}</span>
              </Link>
            </li>
          )
        })}
      </ul>
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          aria-expanded={showAll}
          className={cn(
            linkBase,
            "gap-4 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {showAll ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
          {showAll ? "Tampilkan lebih sedikit" : `Tampilkan ${hiddenCount} lainnya`}
        </button>
      )}

      <p className="mt-6 px-3 text-xs leading-relaxed text-muted-foreground">
        Video dari YouTube. Produk mengarah ke pencarian Tokopedia &amp; Shopee.
      </p>
    </nav>
  )
}

/** Sidebar mini: ikon + label kecil. */
export function MiniSidebarNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Navigasi utama" className="flex flex-col gap-1 px-1.5">
      {compactNav.map((item) => {
        const Icon = item.icon
        const active = isActivePath(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-1 rounded-2xl px-0.5 py-3.5 text-[0.65rem] font-bold transition-colors outline-none focus-visible:ring-4 focus-visible:ring-ring",
              active ? "bg-sky-soft text-sky-ink" : "text-foreground hover:bg-muted"
            )}
          >
            <Icon className={cn("size-6", active && "stroke-[2.5]")} aria-hidden="true" />
            <span className="w-full truncate text-center">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
