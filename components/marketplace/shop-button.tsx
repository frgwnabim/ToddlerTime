"use client"

import { ExternalLink } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { STORE_NAMES, useParentalGate, type Store } from "./parental-gate"

/** Tombol "Beli di ..." yang selalu melewati gerbang orang tua. */
export function ShopButton({
  url,
  store,
  productName,
  label,
  size = "sm",
  className,
}: {
  url: string
  store: Store
  productName: string
  /** Default: "Beli di Tokopedia" / "Beli di Shopee". */
  label?: ReactNode
  size?: ComponentProps<typeof Button>["size"]
  className?: string
}) {
  const { requestOpen } = useParentalGate()
  const storeName = STORE_NAMES[store]

  return (
    <Button
      type="button"
      size={size}
      variant={store === "tokopedia" ? "mint" : "peach"}
      className={className}
      onClick={() => requestOpen({ url, store, productName })}
      aria-label={`Beli ${productName} di ${storeName} (perlu jawaban orang tua)`}
      aria-haspopup="dialog"
    >
      {label ?? `Beli di ${storeName}`}
      <ExternalLink data-icon="inline-end" />
    </Button>
  )
}
