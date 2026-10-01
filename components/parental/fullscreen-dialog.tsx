"use client"

import type { ReactNode } from "react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Layar penuh yang tidak bisa ditutup dengan Esc atau klik di luar
 * (fokus tetap terkunci di dalam). Dipakai layar kunci & istirahat.
 */
export function FullscreenDialog({
  title,
  description,
  children,
  className,
}: {
  title: string
  description: string
  children: ReactNode
  className?: string
}) {
  const block = (event: Event) => event.preventDefault()
  return (
    <DialogPrimitive.Root open>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          onEscapeKeyDown={block}
          onPointerDownOutside={block}
          onInteractOutside={block}
          className={cn(
            "fixed inset-0 z-[70] flex flex-col items-center justify-center overflow-y-auto px-6 py-10 text-center outline-none animate-in fade-in-0 duration-500",
            className
          )}
        >
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">{description}</DialogPrimitive.Description>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
