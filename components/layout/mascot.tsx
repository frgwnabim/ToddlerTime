import { cn } from "@/lib/utils"

export type MascotMood = "happy" | "sleepy" | "curious" | "dizzy"

/**
 * Maskot ToddlerTime: TV kecil berwajah ceria dengan antena.
 * Dipakai sebagai logo dan ilustrasi empty state. Warna dari token tema.
 */
export function Mascot({
  mood = "happy",
  className,
  title,
}: {
  mood?: MascotMood
  className?: string
  /** Isi jika maskot bermakna; tanpa title dianggap dekoratif. */
  title?: string
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      {/* Antena */}
      <path d="M19 11 13.5 4.5M29 11l5.5-6.5" className="stroke-sky" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <circle cx="13" cy="4" r="3" className="fill-peach" />
      <circle cx="35" cy="4" r="3" className="fill-sun" />
      {/* Badan & layar */}
      <rect x="3" y="10" width="42" height="34" rx="12" className="fill-sky" />
      <rect x="8.5" y="15" width="31" height="24" rx="8" className="fill-sky-soft" />
      {/* Pipi */}
      <circle cx="15" cy="30.5" r="2.4" className="fill-peach" opacity="0.85" />
      <circle cx="33" cy="30.5" r="2.4" className="fill-peach" opacity="0.85" />
      {/* Mata */}
      {mood === "dizzy" ? (
        <path
          d="M17 23l4 4M21 23l-4 4M27 23l4 4M31 23l-4 4"
          className="stroke-foreground"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : mood === "sleepy" ? (
        <path d="M16.5 25.5q2.5 2 5 0M26.5 25.5q2.5 2 5 0" className="stroke-foreground" strokeWidth="2" strokeLinecap="round" fill="none" />
      ) : (
        <>
          <circle cx="19" cy="25" r={mood === "curious" ? 2.8 : 2.4} className="fill-foreground" />
          <circle cx="29" cy="25" r={mood === "curious" ? 2.8 : 2.4} className="fill-foreground" />
        </>
      )}
      {/* Mulut */}
      {mood === "dizzy" ? (
        <path d="M19.5 32.5q1.5-1.6 3 0t3 0 3 0" className="stroke-foreground" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      ) : mood === "curious" ? (
        <circle cx="24" cy="32" r="1.8" className="fill-foreground" />
      ) : (
        <path d="M20.5 31q3.5 3.2 7 0" className="stroke-foreground" strokeWidth="2" strokeLinecap="round" fill="none" />
      )}
      {/* Kaki */}
      <rect x="12" y="43" width="6" height="3.5" rx="1.75" className="fill-sky" />
      <rect x="30" y="43" width="6" height="3.5" rx="1.75" className="fill-sky" />
    </svg>
  )
}
