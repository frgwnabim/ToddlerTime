"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { User } from "@supabase/supabase-js"

import { Mascot } from "@/components/layout/mascot"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { loginHref } from "@/lib/auth-redirect"
import { createClient } from "@/lib/supabase/client"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import type { Profile } from "@/types/database"

export type AuthStatus = "loading" | "authenticated" | "guest"

type AuthContextValue = {
  status: AuthStatus
  user: User | null
  profile: Pick<Profile, "display_name" | "avatar_url"> | null
  /** Nama untuk ditampilkan (profile -> metadata -> email). */
  displayName: string
  signOut(): Promise<void>
  /**
   * Jalankan `action` kalau sudah masuk; kalau belum, tampilkan modal
   * "Masuk dulu ya, Ayah/Bunda". Mengembalikan true bila action dijalankan.
   */
  requireAuth(action?: () => void, reason?: string): boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

const DEFAULT_REASON = "Fitur ini khusus untuk akun orang tua. Menonton video tetap bisa tanpa masuk."

function nameFromUser(user: User | null): string {
  if (!user) return ""
  const fromMetadata = typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : ""
  return fromMetadata.trim() || user.email?.split("@")[0] || "Ayah/Bunda"
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [status, setStatus] = useState<AuthStatus>(hasSupabaseEnv() ? "loading" : "guest")
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AuthContextValue["profile"]>(null)
  const [prompt, setPrompt] = useState<{ reason: string; next: string } | null>(null)

  // Ikuti status login dari Supabase (INITIAL_SESSION, SIGNED_IN, SIGNED_OUT, ...).
  useEffect(() => {
    if (!hasSupabaseEnv()) return
    const supabase = createClient()
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setStatus(session?.user ? "authenticated" : "guest")
    })
    return () => data.subscription.unsubscribe()
  }, [])

  // Ambil profile setiap kali user berganti.
  const userId = user?.id
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    createClient()
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setProfile(data)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  const signOut = useCallback(async () => {
    await createClient().auth.signOut()
    setProfile(null)
  }, [])

  const requireAuth = useCallback(
    (action?: () => void, reason?: string) => {
      if (status === "authenticated") {
        action?.()
        return true
      }
      setPrompt({ reason: reason ?? DEFAULT_REASON, next: `${window.location.pathname}${window.location.search}` })
      return false
    },
    [status]
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      profile: user ? profile : null,
      displayName: (user && profile?.display_name) || nameFromUser(user),
      signOut,
      requireAuth,
    }),
    [status, user, profile, signOut, requireAuth]
  )

  const next = prompt?.next ?? pathname

  return (
    <AuthContext.Provider value={value}>
      {children}
      <Dialog open={prompt !== null} onOpenChange={(open) => !open && setPrompt(null)}>
        <DialogContent className="text-center">
          <div className="mx-auto grid size-28 place-items-center rounded-full bg-sky-soft">
            <Mascot mood="happy" className="size-20" />
          </div>
          <DialogTitle className="mt-4">Masuk dulu ya, Ayah/Bunda</DialogTitle>
          <DialogDescription className="mt-2 text-base">{prompt?.reason}</DialogDescription>
          <div className="mt-6 flex flex-col gap-2">
            <Button asChild size="lg">
              <Link href={loginHref(next)} onClick={() => setPrompt(null)}>
                Masuk
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={loginHref(next, "/register")} onClick={() => setPrompt(null)}>
                Buat akun orang tua
              </Link>
            </Button>
            <DialogClose asChild>
              <Button variant="ghost">Nanti saja</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth harus dipakai di dalam <AuthProvider>")
  return context
}

/** Hook ringkas: `const requireAuth = useRequireAuth(); requireAuth(() => like())`. */
export function useRequireAuth() {
  return useAuth().requireAuth
}
