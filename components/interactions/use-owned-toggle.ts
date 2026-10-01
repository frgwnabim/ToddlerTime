"use client"

import { useEffect, useEffectEvent, useOptimistic, useState, useTransition } from "react"

import type { ActionResult } from "@/app/actions/interactions"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/components/ui/toaster"
import { createClient } from "@/lib/supabase/client"

type SupabaseBrowser = ReturnType<typeof createClient>

/**
 * Status on/off milik user (subscribe, tonton nanti, favorit) dengan
 * optimistic update: UI langsung berubah, lalu dikembalikan bila server gagal.
 *
 * - `key`  : identitas item (mis. id video). Status dimuat ulang saat berubah.
 * - `load` : baca status awal lewat browser client (RLS: hanya data sendiri).
 */
export function useOwnedToggle(key: string, load: (supabase: SupabaseBrowser) => PromiseLike<boolean>) {
  const { status, user } = useAuth()
  const { toast } = useToast()
  const userId = status === "authenticated" ? user?.id : undefined
  const scope = userId ? `${userId}:${key}` : null

  const [confirmed, setConfirmed] = useState<{ scope: string; value: boolean } | null>(null)
  const loadState = useEffectEvent(load)

  useEffect(() => {
    if (!scope) return
    let cancelled = false
    Promise.resolve(loadState(createClient())).then((value) => {
      if (!cancelled) setConfirmed({ scope, value })
    })
    return () => {
      cancelled = true
    }
  }, [scope])

  const value = scope !== null && confirmed?.scope === scope ? confirmed.value : false
  const [optimistic, setOptimistic] = useOptimistic(value)
  const [pending, startTransition] = useTransition()

  /** Balik status; `action(next)` dijalankan di server. */
  function toggle(action: (next: boolean) => Promise<ActionResult>, onSuccess?: (next: boolean) => void) {
    if (!scope) return
    const next = !optimistic
    startTransition(async () => {
      setOptimistic(next)
      const result = await action(next)
      if (result.ok) {
        setConfirmed({ scope, value: next })
        onSuccess?.(next)
      } else {
        toast(result.error, { variant: "error" })
      }
    })
  }

  return { active: optimistic, confirmed: value, pending, toggle }
}
