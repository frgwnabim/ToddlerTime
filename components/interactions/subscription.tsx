"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { Bell, BellRing } from "lucide-react"

import { setSubscription } from "@/app/actions/interactions"
import { useRequireAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toaster"
import { formatSubscribers } from "@/lib/format"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { useOwnedToggle } from "./use-owned-toggle"

type SubscriptionContextValue = {
  subscribed: boolean
  pending: boolean
  /** baseSubscribers (YouTube) + subscriber ToddlerTime dari Supabase. */
  count: number
  toggle(): void
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null)

/** Status subscribe satu channel, dipakai bersama oleh tombol & jumlah subscriber. */
export function SubscriptionProvider({
  channelId,
  channelName,
  baseSubscribers,
  children,
}: {
  channelId: string
  channelName: string
  baseSubscribers: number
  children: ReactNode
}) {
  const requireAuth = useRequireAuth()
  const { toast } = useToast()
  const [dbCount, setDbCount] = useState(0)
  const { active, confirmed, pending, toggle } = useOwnedToggle(`subscription:${channelId}`, async (supabase) => {
    const { data } = await supabase.from("subscriptions").select("channel_id").eq("channel_id", channelId).maybeSingle()
    return data !== null
  })

  useEffect(() => {
    let cancelled = false
    createClient()
      .rpc("get_channel_subscriber_count", { p_channel_id: channelId })
      .then(({ data }) => {
        if (!cancelled) setDbCount(Number(data ?? 0))
      })
    return () => {
      cancelled = true
    }
  }, [channelId])

  // Jumlah dari DB sudah termasuk status yang terkonfirmasi; tambahkan selisih optimistik.
  const count = baseSubscribers + Math.max(0, dbCount + Number(active) - Number(confirmed))

  const value: SubscriptionContextValue = {
    subscribed: active,
    pending,
    count,
    toggle: () =>
      requireAuth(
        () =>
          toggle(
            (next) => setSubscription(channelId, next),
            (next) => {
              setDbCount((current) => Math.max(0, current + (next ? 1 : -1)))
              toast(next ? `Berhasil subscribe ${channelName}` : `Berhenti subscribe ${channelName}`, {
                action: next ? { label: "Lihat", href: "/subscriptions" } : undefined,
              })
            }
          ),
        "Masuk untuk subscribe channel kesukaan si kecil."
      ),
  }

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
}

function useSubscription(): SubscriptionContextValue {
  const context = useContext(SubscriptionContext)
  if (!context) throw new Error("Harus di dalam <SubscriptionProvider>")
  return context
}

export function SubscribeButton({ className }: { className?: string }) {
  const { subscribed, pending, toggle } = useSubscription()
  return (
    <Button
      type="button"
      variant={subscribed ? "secondary" : "default"}
      onClick={toggle}
      disabled={pending}
      aria-pressed={subscribed}
      className={cn(subscribed && "bg-muted text-foreground", className)}
    >
      {subscribed ? <BellRing data-icon="inline-start" /> : <Bell data-icon="inline-start" />}
      {subscribed ? "Disubscribe" : "Subscribe"}
    </Button>
  )
}

export function SubscriberCount() {
  const { count } = useSubscription()
  return <>{formatSubscribers(count)}</>
}
