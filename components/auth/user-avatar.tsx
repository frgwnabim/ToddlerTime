import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : (parts[0] ?? "?").slice(0, 2)).toUpperCase()
}

export function UserAvatar({
  name,
  avatarUrl,
  className,
}: {
  name: string
  avatarUrl?: string | null
  className?: string
}) {
  return (
    <Avatar className={cn("size-10", className)}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt="" loading="lazy" referrerPolicy="no-referrer" />}
      <AvatarFallback className="bg-peach-soft font-bold text-peach-ink">{initials(name)}</AvatarFallback>
    </Avatar>
  )
}
