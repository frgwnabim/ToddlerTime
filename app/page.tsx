import type { ReactNode } from "react"
import {
  BedDouble,
  Bell,
  Bookmark,
  Clock,
  ExternalLink,
  Heart,
  Hourglass,
  Lock,
  LogIn,
  Play,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  ThumbsUp,
} from "lucide-react"

import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { ChipDemo } from "./_components/chip-demo"

// Halaman sementara untuk mengecek design system. Akan diganti beranda asli.

const accents = [
  { name: "Biru Langit", token: "sky", fill: "bg-sky text-sky-foreground", soft: "bg-sky-soft text-sky-ink" },
  { name: "Hijau Mint", token: "mint", fill: "bg-mint text-mint-foreground", soft: "bg-mint-soft text-mint-ink" },
  { name: "Kuning Lembut", token: "sun", fill: "bg-sun text-sun-foreground", soft: "bg-sun-soft text-sun-ink" },
  { name: "Peach", token: "peach", fill: "bg-peach text-peach-foreground", soft: "bg-peach-soft text-peach-ink" },
  { name: "Lavender", token: "lavender", fill: "bg-lavender text-lavender-foreground", soft: "bg-lavender-soft text-lavender-ink" },
]

const surfaces = [
  { name: "Latar", token: "background", className: "bg-background text-foreground" },
  { name: "Kartu", token: "card", className: "bg-card text-card-foreground" },
  { name: "Redup", token: "muted", className: "bg-muted text-muted-foreground" },
  { name: "Teks", token: "foreground", className: "bg-foreground text-background" },
]

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  )
}

export default function DesignSystemPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <div className="flex items-center gap-2">
            <span className="grid size-10 place-items-center rounded-2xl bg-sky text-sky-foreground shadow-soft">
              <Play className="size-5 fill-current" />
            </span>
            <span className="font-heading text-2xl font-extrabold tracking-tight">
              Toddler<span className="text-peach-ink">Time</span>
            </span>
          </div>
          <div className="relative mx-auto hidden w-full max-w-md md:block">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Cari video seru..." className="pl-11" />
          </div>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <ThemeToggle />
            <Button size="default">
              <LogIn data-icon="inline-start" />
              Masuk
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-12 px-4 py-10">
        <div className="space-y-3 rounded-3xl bg-sky-soft p-8 text-sky-ink">
          <Badge variant="sun">
            <Star data-icon="inline-start" />
            Design System
          </Badge>
          <h1 className="text-4xl font-extrabold text-foreground md:text-5xl">
            Halo, selamat datang di ToddlerTime!
          </h1>
          <p className="max-w-2xl text-lg">
            Halaman ini memamerkan warna, huruf, tombol, chip, dan kartu yang
            akan dipakai di seluruh aplikasi. Coba tombol bulan di pojok kanan
            atas untuk mode malam.
          </p>
        </div>

        <Section
          title="Palet Warna"
          description="Pastel lembut dengan teks yang tetap kontras."
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {accents.map((accent) => (
              <div
                key={accent.token}
                className="overflow-hidden rounded-2xl bg-card shadow-soft ring-1 ring-border"
              >
                <div className={`flex h-20 items-end p-3 font-bold ${accent.fill}`}>
                  {accent.name}
                </div>
                <div className={`p-3 text-sm font-semibold ${accent.soft}`}>
                  {accent.token}-soft
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {surfaces.map((surface) => (
              <div
                key={surface.token}
                className={`flex h-20 flex-col justify-end rounded-2xl p-3 ring-1 ring-border ${surface.className}`}
              >
                <span className="font-bold">{surface.name}</span>
                <span className="text-xs opacity-80">{surface.token}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Tipografi" description="Baloo 2 untuk judul, Nunito untuk teks.">
          <div className="space-y-2 rounded-2xl bg-card p-6 shadow-soft ring-1 ring-border">
            <p className="font-heading text-5xl font-extrabold">Ayo Bernyanyi!</p>
            <p className="font-heading text-3xl font-bold">Judul Video Seru</p>
            <p className="text-lg">
              Teks isi memakai Nunito yang bulat dan mudah dibaca oleh orang tua
              maupun si kecil.
            </p>
            <p className="text-sm text-muted-foreground">
              Teks kecil untuk keterangan: 12 rb x ditonton · 2 hari lalu
            </p>
          </div>
        </Section>

        <Section title="Tombol" description="Besar, membulat, dan gampang dipencet.">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Tonton</Button>
            <Button variant="mint">Subscribe</Button>
            <Button variant="sun">Favorit</Button>
            <Button variant="peach">Beli Sekarang</Button>
            <Button variant="lavender">Tonton Nanti</Button>
            <Button variant="secondary">Sekunder</Button>
            <Button variant="outline">Garis</Button>
            <Button variant="ghost">Hantu</Button>
            <Button variant="destructive">Hapus</Button>
            <Button variant="link">Tautan</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Kecil</Button>
            <Button>Biasa</Button>
            <Button size="lg">
              <Play data-icon="inline-start" className="fill-current" />
              Besar
            </Button>
            <Button size="xl" variant="mint">
              <Play data-icon="inline-start" className="fill-current" />
              Ekstra Besar
            </Button>
            <Button size="icon-sm" variant="outline" aria-label="Suka">
              <ThumbsUp />
            </Button>
            <Button size="icon" variant="peach" aria-label="Favorit">
              <Heart />
            </Button>
            <Button size="icon-lg" variant="sun" aria-label="Pengingat">
              <Bell />
            </Button>
            <Button disabled>Nonaktif</Button>
          </div>
        </Section>

        <Section title="Chip Kategori" description="Ketuk untuk memilih kategori.">
          <ChipDemo />
        </Section>

        <Section title="Badge">
          <div className="flex flex-wrap gap-2">
            <Badge>Baru</Badge>
            <Badge variant="sky">Lagu</Badge>
            <Badge variant="mint">Edukasi</Badge>
            <Badge variant="sun">Populer</Badge>
            <Badge variant="peach">Produk</Badge>
            <Badge variant="lavender">Dongeng</Badge>
            <Badge variant="outline">Garis</Badge>
          </div>
        </Section>

        <Section title="Kartu" description="Contoh kartu video, produk, dan kontrol orang tua.">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Kartu video */}
            <article className="group space-y-3">
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-linear-to-br from-sky via-mint to-sun shadow-soft transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lift">
                <div className="absolute inset-0 grid place-items-center">
                  <span className="grid size-16 place-items-center rounded-full bg-card/90 text-sky-ink shadow-soft transition-transform group-hover:scale-110">
                    <Play className="size-7 fill-current" />
                  </span>
                </div>
                <span className="absolute right-2 bottom-2 rounded-lg bg-foreground/80 px-2 py-0.5 text-xs font-bold text-background">
                  3:45
                </span>
              </div>
              <div className="flex gap-3">
                <Avatar size="lg">
                  <AvatarFallback className="bg-peach-soft font-bold text-peach-ink">
                    LB
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-lg leading-snug font-bold">
                    Belajar Warna Pelangi Bersama Teman Hewan
                  </h3>
                  <p className="text-sm text-muted-foreground">Lagu Balita Ceria</p>
                  <p className="text-sm text-muted-foreground">
                    12 rb x ditonton · 2 hari lalu
                  </p>
                </div>
              </div>
            </article>

            {/* Kartu produk marketplace */}
            <Card>
              <div className="mx-(--card-spacing) grid aspect-4/3 place-items-center rounded-2xl bg-peach-soft text-peach-ink">
                <ShoppingBag className="size-14" />
              </div>
              <CardHeader>
                <Badge variant="peach">Terkait video</Badge>
                <CardTitle>Krayon Jumbo 24 Warna</CardTitle>
                <CardDescription>Aman untuk balita, mudah digenggam.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-2xl font-bold">Rp45.000</p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="mint" className="flex-1">
                  Tokopedia
                  <ExternalLink data-icon="inline-end" />
                </Button>
                <Button variant="peach" className="flex-1">
                  Shopee
                  <ExternalLink data-icon="inline-end" />
                </Button>
              </CardFooter>
            </Card>

            {/* Kartu kontrol orang tua */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-lavender-ink">
                  <ShieldCheck className="size-6" />
                  <span className="text-sm font-bold">Kontrol Orang Tua</span>
                </div>
                <CardTitle>Atur waktu nonton si kecil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 font-semibold">
                    <Hourglass className="size-5 text-sky-ink" />
                    Batas harian 60 menit
                  </span>
                  <Switch defaultChecked />
                </label>
                <Separator />
                <label className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 font-semibold">
                    <BedDouble className="size-5 text-lavender-ink" />
                    Jam tidur 19.30
                  </span>
                  <Switch defaultChecked />
                </label>
                <Separator />
                <label className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 font-semibold">
                    <Clock className="size-5 text-mint-ink" />
                    Pengingat istirahat
                  </span>
                  <Switch />
                </label>
              </CardContent>
              <CardFooter>
                <Button variant="lavender" className="w-full">
                  <Lock data-icon="inline-start" />
                  Masukkan PIN
                </Button>
              </CardFooter>
            </Card>
          </div>
        </Section>

        <Section title="Formulir">
          <div className="grid max-w-xl gap-3">
            <Input placeholder="Nama si kecil" />
            <div className="flex gap-2">
              <Input placeholder="Cari video seru..." />
              <Button size="icon" aria-label="Cari">
                <Search />
              </Button>
            </div>
            <Button variant="outline" className="w-fit">
              <Bookmark data-icon="inline-start" />
              Simpan ke Tonton Nanti
            </Button>
          </div>
        </Section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        ToddlerTime · Tontonan aman dan ceria untuk si kecil
      </footer>
    </div>
  )
}
