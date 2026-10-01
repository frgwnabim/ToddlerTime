import {
  Blocks,
  Car,
  CookingPot,
  type LucideIcon,
  type LucideProps,
  Music,
  Palette,
  PawPrint,
  Shapes,
  TreePine,
} from "lucide-react"

import type { Category } from "@/types"

const ICONS: Record<Category["icon"], LucideIcon> = {
  Blocks,
  Car,
  CookingPot,
  Music,
  Palette,
  PawPrint,
  Shapes,
  TreePine,
}

export function CategoryIcon({ icon, ...props }: { icon: Category["icon"] } & LucideProps) {
  const Icon = ICONS[icon]
  return <Icon aria-hidden="true" {...props} />
}
