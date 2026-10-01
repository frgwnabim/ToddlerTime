"use client"

import type { ComponentProps } from "react"

import { PIN_LENGTH } from "@/lib/parental"
import { cn } from "@/lib/utils"

/** Input PIN 4 angka (disamarkan). */
export function PinInput({
  value,
  onValueChange,
  className,
  ...props
}: Omit<ComponentProps<"input">, "value" | "onChange" | "type"> & {
  value: string
  onValueChange: (value: string) => void
}) {
  return (
    <input
      type="password"
      inputMode="numeric"
      autoComplete="off"
      pattern={`\\d{${PIN_LENGTH}}`}
      maxLength={PIN_LENGTH}
      value={value}
      onChange={(event) => onValueChange(event.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH))}
      className={cn(
        "h-14 w-44 rounded-2xl border-2 border-input bg-card text-center font-heading text-3xl font-bold tracking-[0.6em] outline-none placeholder:tracking-normal placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}
