"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Library, LogIn, LogOut, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { loginHref } from "@/lib/auth-redirect"
import { useAuth } from "./auth-provider"
import { UserAvatar } from "./user-avatar"

/** Bagian kanan header: tombol "Masuk" untuk tamu, avatar + menu untuk orang tua. */
export function UserMenu() {
  const { status, user, profile, displayName, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  if (status === "loading") {
    return <Skeleton className="size-10 rounded-full" aria-label="Memuat akun" />
  }

  if (status === "guest" || !user) {
    return (
      <Button asChild className="max-sm:h-10 max-sm:px-3.5">
        <Link href={loginHref(pathname)}>
          <LogIn data-icon="inline-start" className="max-sm:hidden" />
          Masuk
        </Link>
      </Button>
    )
  }

  async function handleSignOut() {
    await signOut()
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full outline-none focus-visible:ring-4 focus-visible:ring-ring"
        aria-label={`Menu akun ${displayName}`}
      >
        <UserAvatar name={displayName} avatarUrl={profile?.avatar_url} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="flex items-center gap-3">
          <UserAvatar name={displayName} avatarUrl={profile?.avatar_url} />
          <span className="min-w-0">
            <span className="block truncate font-bold">{displayName}</span>
            <span className="block truncate text-xs font-normal text-muted-foreground">{user.email}</span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/library">
            <Library />
            Koleksiku
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/parental">
            <ShieldCheck />
            Kontrol Orang Tua
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={handleSignOut}>
          <LogOut />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
