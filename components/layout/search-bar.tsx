"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useRef, useState, type FormEvent } from "react"
import { Search, X } from "lucide-react"

import { cn } from "@/lib/utils"

type SearchBarProps = {
  autoFocus?: boolean
  /** Dipanggil setelah pencarian dikirim (mis. menutup search mobile). */
  onSearch?: () => void
  className?: string
}

/** Search bar yang membaca ?q= saat berada di /search. Bungkus dengan <Suspense>. */
export function SearchBar(props: SearchBarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = pathname === "/search" ? (searchParams.get("q") ?? "") : ""
  return <SearchForm key={current} defaultValue={current} {...props} />
}

/** Versi tanpa useSearchParams, untuk fallback Suspense. */
export function SearchBarFallback(props: SearchBarProps) {
  return <SearchForm defaultValue="" {...props} />
}

function SearchForm({ defaultValue, autoFocus, onSearch, className }: SearchBarProps & { defaultValue: string }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(defaultValue)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = value.trim()
    if (!query) {
      inputRef.current?.focus()
      return
    }
    inputRef.current?.blur()
    router.push(`/search?q=${encodeURIComponent(query)}`)
    onSearch?.()
  }

  return (
    <form role="search" onSubmit={handleSubmit} className={cn("flex w-full items-center", className)}>
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          name="q"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoFocus={autoFocus}
          placeholder="Cari video seru..."
          aria-label="Cari video"
          enterKeyHint="search"
          autoComplete="off"
          className="h-11 w-full rounded-l-full border-2 border-r-0 border-input bg-card pr-11 pl-11 text-base outline-none placeholder:text-muted-foreground focus-visible:border-sky [&::-webkit-search-cancel-button]:hidden"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              setValue("")
              inputRef.current?.focus()
            }}
            aria-label="Hapus teks pencarian"
            className="absolute top-1/2 right-1.5 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <button
        type="submit"
        aria-label="Cari"
        className="grid h-11 w-16 shrink-0 place-items-center rounded-r-full border-2 border-input bg-muted text-foreground transition-colors outline-none hover:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_6%)] focus-visible:ring-4 focus-visible:ring-ring"
      >
        <Search className="size-5" />
      </button>
    </form>
  )
}
