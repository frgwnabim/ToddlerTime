import {
  Clock,
  Heart,
  History,
  House,
  LayoutGrid,
  Library,
  type LucideIcon,
  ShoppingBag,
  Tv,
} from "lucide-react"

export type NavItem = { label: string; href: string; icon: LucideIcon }

/** Channel ringkas untuk sidebar (dikirim dari server ke client). */
export type ShellChannel = { id: string; handle: string; name: string; avatarUrl: string }

export const mainNav: NavItem[] = [
  { label: "Beranda", href: "/", icon: House },
  { label: "Kategori", href: "/category", icon: LayoutGrid },
  { label: "Marketplace", href: "/marketplace", icon: ShoppingBag },
]

export const libraryNav: NavItem[] = [
  { label: "Tonton Nanti", href: "/watch-later", icon: Clock },
  { label: "Favorit", href: "/favorites", icon: Heart },
  { label: "Riwayat", href: "/history", icon: History },
  { label: "Langganan", href: "/subscriptions", icon: Tv },
]

/** Navigasi ringkas: mini sidebar & bottom navigation. */
export const compactNav: NavItem[] = [
  ...mainNav,
  { label: "Koleksiku", href: "/library", icon: Library },
]

export function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}
