import { Mascot } from "@/components/layout/mascot"
import { cn } from "@/lib/utils"

function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("absolute fill-sun", className)} aria-hidden="true">
      <path d="M12 2.5c.6 4.6 2.9 6.9 7.5 7.5-4.6.6-6.9 2.9-7.5 7.5-.6-4.6-2.9-6.9-7.5-7.5 4.6-.6 6.9-2.9 7.5-7.5Z" />
    </svg>
  )
}

/** Bulan, bintang berkelip, dan maskot yang tertidur di atas awan. */
export function NightIllustration({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto h-56 w-72", className)} aria-hidden="true">
      {/* Bulan sabit */}
      <svg viewBox="0 0 100 100" className="absolute top-0 right-6 size-24">
        <defs>
          <mask id="crescent">
            <rect width="100" height="100" fill="white" />
            <circle cx="66" cy="38" r="34" fill="black" />
          </mask>
        </defs>
        <circle cx="50" cy="50" r="40" className="fill-sun" mask="url(#crescent)" />
      </svg>
      <Star className="top-4 left-8 size-6 animate-pulse" />
      <Star className="top-20 left-2 size-4 animate-pulse [animation-delay:700ms]" />
      <Star className="top-2 left-32 size-3 animate-pulse [animation-delay:1400ms]" />
      <Star className="top-28 right-2 size-4 animate-pulse [animation-delay:300ms]" />

      {/* Awan & maskot tidur */}
      <div className="absolute inset-x-6 bottom-0 h-16 rounded-full bg-card shadow-soft" />
      <div className="absolute bottom-8 left-12 size-20 rounded-full bg-card" />
      <div className="absolute right-14 bottom-10 size-16 rounded-full bg-card" />
      <Mascot mood="sleepy" className="absolute bottom-7 left-1/2 size-24 -translate-x-1/2" />
      <span className="absolute bottom-[7.5rem] left-[18%] font-heading text-xl font-bold text-lavender-ink">
        z<span className="text-base">z</span>
        <span className="text-sm">z</span>
      </span>
    </div>
  )
}
