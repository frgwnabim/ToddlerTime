import type { Metadata } from "next"
import Link from "next/link"
import { House, Search } from "lucide-react"

import { EmptyState } from "@/components/layout/empty-state"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Halaman tidak ditemukan", robots: { index: false } }

export default function NotFound() {
  return (
    <EmptyState
      mood="curious"
      icon={Search}
      title="Cilukba! Halamannya sembunyi"
      description="Kami sudah cari di balik bantal dan di bawah meja, tapi halaman ini tidak ketemu. Yuk, kembali ke beranda atau cari video lain!"
      action={
        <>
          <Button asChild size="lg">
            <Link href="/">
              <House data-icon="inline-start" />
              Ke Beranda
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/category">Lihat kategori</Link>
          </Button>
        </>
      }
    />
  )
}
