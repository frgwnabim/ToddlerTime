"use client"

import { useState } from "react"
import {
  BookOpen,
  Car,
  Music,
  Palette,
  PawPrint,
  Shapes,
  Sparkles,
} from "lucide-react"

import { Chip } from "@/components/ui/chip"

const categories = [
  { label: "Semua", icon: Sparkles, color: "neutral" },
  { label: "Lagu Anak", icon: Music, color: "sky" },
  { label: "Menggambar", icon: Palette, color: "peach" },
  { label: "Hewan", icon: PawPrint, color: "mint" },
  { label: "Angka & Bentuk", icon: Shapes, color: "sun" },
  { label: "Dongeng", icon: BookOpen, color: "lavender" },
  { label: "Kendaraan", icon: Car, color: "sky" },
] as const

export function ChipDemo() {
  const [active, setActive] = useState<string>("Semua")

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
      {categories.map(({ label, icon: Icon, color }) => (
        <Chip
          key={label}
          color={color}
          selected={active === label}
          onClick={() => setActive(label)}
        >
          <Icon />
          {label}
        </Chip>
      ))}
    </div>
  )
}
