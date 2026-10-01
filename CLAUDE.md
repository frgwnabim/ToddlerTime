@AGENTS.md

# ToddlerTime

Website tontonan untuk anak balita, mirip YouTube Kids, dengan layout yang familiar seperti YouTube. Project portofolio, di-deploy ke **Vercel**.

**Bahasa UI: Bahasa Indonesia.** Semua teks yang dilihat pengguna (label, tombol, pesan error, metadata) ditulis dalam Bahasa Indonesia. Kode, nama variabel, dan nama file tetap bahasa Inggris.

## Stack

- **Next.js 16** (App Router) + **TypeScript** (strict). Versi ini punya perubahan besar; cek `node_modules/next/dist/docs/` sebelum memakai API yang belum pasti.
- **Tailwind CSS v4** (konfigurasi lewat CSS, tidak ada `tailwind.config`) + **shadcn/ui** (style `radix-maia`, primitive dari paket `radix-ui`).
- **lucide-react** untuk semua ikon.
- **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`) untuk auth dan database.
- Font via `next/font/google`: **Baloo 2** (judul) dan **Nunito** (teks).
- ESLint 9 (flat config, `eslint-config-next`).

## Perintah

```bash
npm run dev     # server pengembangan
npm run build   # build produksi (harus selalu sukses)
npm run lint    # ESLint
```

## Struktur folder

```
app/                 Route App Router. Folder berawalan _ (mis. app/_components) = privat, bukan route.
components/
  ui/                Komponen dasar shadcn/ui + tambahan (chip.tsx). Boleh diedit.
  layout/            Header, sidebar, theme toggle, shell halaman.
  video/             Kartu video, grid, player, rekomendasi, komentar.
  marketplace/       Kartu produk, pop up produk di player, daftar produk.
  parental/          Batas waktu, jam tidur, pengingat istirahat, PIN.
lib/                 Utilitas (utils.ts -> cn), theme.ts, klien Supabase nanti di lib/supabase/.
data/                Data seed statis (video, kategori, produk).
types/               Tipe TypeScript bersama.
scripts/             Skrip Node (mis. ambil data video dari YouTube Data API v3, seed Supabase).
supabase/            Migrasi SQL dan konfigurasi Supabase.
```

## Konvensi kode

- Import pakai alias `@/` (mis. `@/components/ui/button`).
- Server Component secara default; tambahkan `"use client"` hanya untuk komponen yang butuh state/efek/event.
- Nama file kebab-case (`video-card.tsx`), komponen PascalCase, export bernama (bukan default) kecuali `page.tsx`/`layout.tsx`.
- Gabungkan class dengan `cn()` dari `@/lib/utils`. Varian komponen pakai `class-variance-authority`.
- **Jangan hardcode warna** (hex, `bg-blue-500`, dll.). Selalu pakai token di bawah.
- Ikon dari `lucide-react` saja. Tombol ikon wajib punya `aria-label` berbahasa Indonesia.
- Target sentuh minimal 44px (`h-11`/`size-11`); untuk area yang dipencet balita, pakai `lg`/`xl`.
- Secret hanya di env server. Variabel publik berawalan `NEXT_PUBLIC_`. Lihat `.env.example`.
- **Catatan shadcn:** setelah `npx shadcn@latest add ...`, CLI ini kadang menulis `import { cn } from "cn"` dan menambah paket `cn` ke package.json. Ganti import jadi `@/lib/utils` lalu `npm uninstall cn`.

## Design system

Semua token ada di `app/globals.css` sebagai CSS variables (`:root` = mode siang, `.dark` = mode malam) dan didaftarkan ke Tailwind lewat `@theme inline`.

### Palet warna aksen

Setiap aksen punya 4 token: isian solid, teks di atas isian, latar lembut, dan "ink" (teks berwarna di atas latar halaman/soft).

| Aksen | Utility | Siang (fill / soft / ink) | Malam (fill / soft / ink) |
|---|---|---|---|
| Biru langit | `sky` | `#7cc6f2` / `#e3f3fd` / `#1d5a85` | `#5e9cc2` / `#22313a` / `#a9d4ee` |
| Hijau mint | `mint` | `#8fdcc2` / `#e2f7ef` / `#1e6b52` | `#6db59c` / `#213129` / `#a6e3cd` |
| Kuning lembut | `sun` | `#ffd873` / `#fff4cf` / `#7a5a00` | `#d4b159` / `#352d1d` / `#f2db9a` |
| Peach | `peach` | `#ffb89a` / `#ffe9de` / `#94472a` | `#d4977d` / `#3a2a22` / `#f5c6b1` |
| Lavender | `lavender` | `#bba8f0` / `#efeafd` / `#5a45a8` | `#9a89cc` / `#2c2839` / `#cfc3f5` |

Pola pemakaian:
- Isian solid: `bg-sky text-sky-foreground`
- Latar lembut: `bg-sky-soft text-sky-ink`
- Teks/ikon berwarna di halaman: `text-sky-ink`

### Permukaan & peran

| Token | Siang | Malam | Keterangan |
|---|---|---|---|
| `background` | `#fff9f0` krem | `#1e1a17` cokelat hangat | latar halaman |
| `foreground` | `#2b2d42` | `#f1e6d6` | teks utama |
| `card` / `popover` | `#ffffff` | `#2a2420` | |
| `muted` / `muted-foreground` | `#f6eee2` / `#6b6577` | `#322a25` / `#bfaf9c` | |
| `border` / `input` | `#ede3d3` / `#e6daca` | `#3d342d` / `#463c34` | |
| `primary` | = `sky` | = `sky` | tombol utama |
| `secondary` | = `sun-soft` | = `sun-soft` | |
| `accent` | = `lavender-soft` | = `lavender-soft` | |
| `destructive` | `#c65a44` terakota | `#e08b74` | **bukan** merah terang |

Hindari warna neon dan merah terang. Pastikan teks tetap kontras (minimal WCAG AA).

### Bentuk, bayangan, tipografi

- Radius dasar `--radius: 0.75rem`. Kartu & tombol `rounded-2xl`, chip `rounded-full`, blok hero `rounded-3xl`.
- Bayangan: `shadow-soft` (default kartu/tombol) dan `shadow-lift` (hover). Warna bayangan mengikuti mode.
- Judul (`h1`-`h4`) otomatis `font-heading` (Baloo 2); teks `font-sans` (Nunito).
- Interaksi: tombol sedikit naik saat hover, `active:scale-95` saat ditekan. `prefers-reduced-motion` dihormati.

### Komponen yang sudah ada (`components/ui`)

- `Button`: variant `default | mint | sun | peach | lavender | secondary | outline | ghost | destructive | link`; size `sm | default | lg | xl | icon-sm | icon | icon-lg`.
- `Chip`: chip kategori ala YouTube; prop `color` (`neutral | sky | mint | sun | peach | lavender`) dan `selected`.
- `Badge`: variant shadcn + `sky | mint | sun | peach | lavender`.
- `Card`, `Avatar`, `Input`, `Separator`, `Switch` (shadcn, sudah disesuaikan ukurannya).

### Mode malam

Class `.dark` di `<html>`. Skrip di `lib/theme.ts` (`themeInitScript`) dipasang di `<head>` agar tidak berkedip; preferensi disimpan di localStorage `toddlertime-theme`. Toggle: `components/layout/theme-toggle.tsx`. Default mode siang.

## Sumber video (YouTube)

- **Pengambilan data (sekali, offline):** skrip seed di `scripts/` memanggil **YouTube Data API v3** untuk mengambil metadata video (id, judul, deskripsi, thumbnail, durasi, statistik) dan channel-nya, lalu menyimpan hasilnya ke `data/` dan/atau Supabase. Website **tidak** memanggil Data API saat runtime.
- **API key:** env `YOUTUBE_API_KEY`, **hanya dipakai di skrip seed**. Jangan pernah diberi prefix `NEXT_PUBLIC_`, jangan diimpor dari kode di `app/`, `components/`, atau `lib/`.
- **Pemutaran:** pakai **YouTube IFrame Player API** dengan embed dari **`https://www.youtube-nocookie.com/embed/{videoId}`** (privacy-enhanced mode). Player dibungkus komponen client di `components/video/`. Event player (play/pause/ended) dipakai untuk pop up marketplace, riwayat, dan penghitung waktu kontrol orang tua.
- **Channel asli:** channel yang tampil adalah channel YouTube asli dari hasil API (nama, `channelId`, avatar). **Jangan membuat channel fiktif.** Subscribe di ToddlerTime menyimpan relasi user -> `channelId` asli di Supabase.
- Thumbnail diambil dari URL `i.ytimg.com` hasil API; daftarkan host-nya di `images.remotePatterns` pada `next.config.ts` saat mulai memakai `next/image`.

## Daftar fitur (roadmap)

Status: **langkah 1 selesai (setup + design system).** `app/page.tsx` saat ini hanya halaman showcase design system dan akan diganti beranda asli.

1. **Layout seperti YouTube**: header (logo, search, tombol login/avatar), sidebar (bisa diciutkan, drawer di mobile), chip kategori, grid video, halaman tonton dengan rekomendasi di kanan (di bawah player pada mobile).
2. **Akses**: nonton bebas tanpa login. Like, komentar, subscribe, tonton nanti, favorit, riwayat, dan kontrol orang tua **wajib login** (Supabase Auth).
3. **Konten**: minimal **36 video anak** dari YouTube, lewat data seed (lihat bagian "Sumber video" di atas).
4. **Marketplace**: produk terkait video (mis. video menggambar -> krayon). Muncul sebagai **pop up di player** dan **daftar di bawah video**, dengan link ke **Tokopedia/Shopee**.
5. **Kontrol orang tua**: batas waktu nonton harian, jam tidur, pengingat istirahat, PIN orang tua.
6. **Bahasa UI**: Bahasa Indonesia.
