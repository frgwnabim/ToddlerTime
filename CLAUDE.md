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
npm run lint    # ESLint (harus bersih, tanpa warning)
npm run typecheck   # TypeScript
npm run seed    # ambil ulang data video dari YouTube (butuh YOUTUBE_API_KEY)
npm run seed:products   # tulis ulang produk + ilustrasi saja
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
  auth/              AuthProvider (+ useRequireAuth), menu akun, form masuk/daftar.
  interactions/      Like, subscribe, simpan, bagikan, daftar yang bisa dihapus.
lib/                 Utilitas (utils.ts -> cn), theme.ts, format.ts, data.ts, klien Supabase di lib/supabase/.
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
- Secret hanya di env server. Variabel publik berawalan `NEXT_PUBLIC_`. Lihat `.env.example`. `SUPABASE_SERVICE_ROLE_KEY` hanya boleh dipakai lewat `lib/supabase/admin.ts` (server-only).
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
| `destructive` | `#ad4a35` terakota | `#e08b74` | **bukan** merah terang; kontras teks >= 4.5:1 |
| `ring` | `#2a78b5` | `#6fb3e0` | cincin fokus keyboard, kontras >= 3:1; pakai `ring-ring` tanpa opasitas |

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
- `Card`, `Avatar`, `Input`, `Separator`, `Switch`, `Skeleton` (shadcn, sudah disesuaikan), `Sheet` (drawer) dan `Dialog` (modal), keduanya ditulis manual di atas Radix Dialog, `ScrollRow` (baris scroll horizontal dengan tombol panah).

### Mode malam

Class `.dark` di `<html>`. Skrip di `lib/theme.ts` (`themeInitScript`) dipasang di `<head>` agar tidak berkedip; preferensi disimpan di localStorage `toddlertime-theme`. Toggle: `components/layout/theme-toggle.tsx`. Default mode siang.

## Sumber video (YouTube)

- **Pengambilan data (sekali, offline):** skrip seed di `scripts/` memanggil **YouTube Data API v3** untuk mengambil metadata video (id, judul, deskripsi, thumbnail, durasi, statistik) dan channel-nya, lalu menyimpan hasilnya ke `data/` dan/atau Supabase. Website **tidak** memanggil Data API saat runtime.
- **API key:** env `YOUTUBE_API_KEY`, **hanya dipakai di skrip seed**. Jangan pernah diberi prefix `NEXT_PUBLIC_`, jangan diimpor dari kode di `app/`, `components/`, atau `lib/`.
- **Pemutaran:** pakai **YouTube IFrame Player API** dengan embed dari **`https://www.youtube-nocookie.com/embed/{videoId}`** (privacy-enhanced mode). Player dibungkus komponen client di `components/video/`. Event player (play/pause/ended) dipakai untuk pop up marketplace, riwayat, dan penghitung waktu kontrol orang tua.
- **Channel asli:** channel yang tampil adalah channel YouTube asli dari hasil API (nama, `channelId`, avatar). **Jangan membuat channel fiktif.** Subscribe di ToddlerTime menyimpan relasi user -> `channelId` asli di Supabase.
- Thumbnail dari `i.ytimg.com`, avatar channel dari `yt3.ggpht.com`; keduanya sudah terdaftar di `images.remotePatterns` (`next.config.ts`).

## Data konten

```bash
npm run seed            # ambil ulang video + channel dari YouTube, tulis ulang produk
npm run seed:products   # hanya produk + ilustrasi (tanpa API)
```

- Tipe: `types/index.ts` (`Category`, `Channel`, `Video`, `Product`).
- `data/categories.ts`: 8 kategori (`hewan`, `menggambar-mewarnai`, `musik-lagu`, `alam`, `kendaraan`, `bermain`, `masak-masakan`, `warna-bentuk`) dengan warna aksen dan nama ikon lucide.
- `data/videos.json` & `data/channels.json`: **hasil generate**, jangan diedit manual. Kueri per kategori ada di `QUERIES` pada `scripts/seed.ts`. Filter: embeddable, publik, bukan live, tidak dibatasi di Indonesia, durasi 1-20 menit, maks 2 video per channel per kategori, judul diblok jika mengandung kata seperti "prank"/"horor". Satu kali seed memakai ~1.600 unit kuota.
- `data/products.json`: dihasilkan dari katalog manual `scripts/products.ts`, beserta ilustrasi `public/products/{id}.svg` (latar pastel + ikon lucide). Link toko memakai URL pencarian Tokopedia/Shopee. Tiap video dapat 2 produk sekategori secara bergiliran.
- Akses data **hanya lewat `lib/data.ts`** dari Server Component: `getVideos`, `getVideoBySlug`, `getVideosByCategory`, `getChannelByHandle`, `getChannelById`, `getVideosByChannel`, `getRelatedVideos`, `getProducts`, `getProductsForVideo`, `searchVideos`, `getCategories`, `getCategoryById`.
- URL: video pakai `slug` (judul + youtubeId), channel pakai `handle` (tanpa "@").

## Layout & halaman

- `components/layout/app-shell.tsx` (client) membungkus semua halaman lewat `app/layout.tsx`: header sticky, sidebar, drawer (`components/ui/sheet.tsx`), bottom navigation.
  - `< md`: tanpa sidebar, bottom nav, hamburger membuka drawer, search jadi ikon yang membuka search full width.
  - `md`–`lg`: mini sidebar (ikon + label), hamburger membuka drawer.
  - `>= lg`: sidebar penuh; hamburger menciutkannya jadi mini sidebar.
- Menu ada di `components/layout/nav-items.ts`. Koleksiku: `/library`, `/history`, `/watch-later`, `/favorites`, `/subscriptions` (route group `app/(library)`, dirender di server per user). `/feed/*` lama di-redirect di `next.config.ts`.
- `<main>` adalah `@container`: grid video/produk memakai **container query** (`@xl:`, `@4xl:`, `@6xl:`), jadi jumlah kolom mengikuti lebar konten, bukan lebar layar.
- Rute: `/` (beranda), `/category`, `/category/[slug]`, `/search?q=`, `/channel/[handle]`, `/marketplace?category=`, `/library`, `/history`, `/watch-later`, `/favorites`, `/subscriptions`, `/parental`, `/login`, `/register`, `/design-system` (referensi komponen). `/watch/[slug]` (halaman tonton).
- Komponen video: `VideoCard` (layout `grid`/`row`), `VideoGrid`, `CategoryChips` (sticky, bisa di-scroll, `hrefFor` untuk mengganti tujuan link), skeleton di `video-skeleton.tsx`.
- `EmptyState` + maskot TV (`components/layout/mascot.tsx`, mood `happy | sleepy | curious`) untuk empty state, not-found, dan halaman wajib login. Logo & favicon (`app/icon.svg`) memakai maskot yang sama.
- Format angka/tanggal hanya lewat `lib/format.ts` (locale `id-ID`): `formatViews` -> "1,2 rb x ditonton", `formatRelativeTime` -> "3 hari lalu", `formatPrice` -> "Rp45.000", `formatDuration` -> "6:34".
- Kelas warna aksen per kategori/channel ada di `lib/accent.ts` (ditulis lengkap agar terdeteksi Tailwind).
- Halaman statis memakai `revalidate = 86400` supaya teks "x hari lalu" diperbarui harian.

## Halaman tonton & player

- `/watch/[slug]` (`app/watch/[slug]/page.tsx`): tanpa sidebar (menu lewat drawer). Kiri: player, judul, channel + Subscribe, aksi (Suka, Favorit, Tonton Nanti, Bagikan), deskripsi (`DescriptionBox`), "Perlengkapan di video ini", komentar. Kanan (`lg+`) / bawah: "Video berikutnya" (`getUpNextVideos`: sekategori dulu, berputar, lalu rekomendasi lain).
- Subscribe, Suka, Favorit, Tonton Nanti, dan form komentar **baru tampilan** (menampilkan toast "Masuk dulu"). Bagikan sudah berfungsi (Web Share / salin link).
- `components/video/video-player.tsx` (`VideoPlayer`): IFrame Player API (`youtube-iframe-api.ts`, skrip loader dari youtube.com, iframe dari `youtube-nocookie.com`), `rel=0`, `modestbranding=1`, `playsinline=1`. Event: `ready`, `play`, `pause`, `timeupdate` (polling `getCurrentTime` tiap 1 detik saat berputar), `ended`, `error`.
  - Lewat callback props (`onPlay`, `onTimeUpdate`, ...) **dan** lewat context `PlayerProvider` (`player-context.tsx`).
  - Kontrol dari luar: `ref` (`PlayerControls`) atau `usePlayer()` -> `play()`, `pause()`, `seekTo()`, `getCurrentTime()`, `getDuration()`, plus `status`, `currentTime`, `duration`.
  - `usePlayerEvent(listener)` untuk berlangganan event (dipakai pop up produk & autoplay; nanti untuk batas waktu nonton dan riwayat).
- `UpNextOverlay`: saat `ended`, hitung mundur 5 detik ke video berikutnya; bisa dibatalkan.
- `ProductPopup`: setelah 10 detik waktu putar, kartu produk pertama video muncul di pojok kiri bawah player. "Lihat" = pause + scroll & sorot kartu di section produk. Tombol tutup menyimpan `youtubeId` di localStorage `toddlertime-dismissed-product-popups`.

## Gerbang orang tua (marketplace)

- `ParentalGateProvider` (dipasang di `AppShell`) + `useParentalGate().requestOpen({ url, store, productName })`: modal soal penjumlahan acak (mis. 7 + 5). Jawaban benar membuka link di tab baru dengan `rel="noopener noreferrer"`; hanya host Tokopedia/Shopee yang diizinkan.
- **Semua link toko wajib lewat `ShopButton`** (`components/marketplace/shop-button.tsx`), jangan pakai `<a>` langsung. `ProductCard` sudah memakainya.
- Sertakan `StoreDisclaimer` di mana pun produk ditampilkan (link = hasil pencarian di toko pihak ketiga).

## Auth & database (Supabase)

- Prinsip: **menonton bebas tanpa login**; interaksi (suka, komentar, subscribe, tonton nanti, favorit, riwayat, kontrol orang tua) wajib login. Akun = akun orang tua.
- Client: `lib/supabase/client.ts` (browser, singleton), `lib/supabase/server.ts` (Server Component/Action/Route Handler; membuat halaman dinamis), `lib/supabase/proxy.ts` + `proxy.ts` di root (Next 16: pengganti `middleware.ts`) untuk refresh session dan mengalihkan user yang sudah masuk dari `/login` & `/register`.
- **Status login dibaca di client** lewat `AuthProvider` (`components/auth/auth-provider.tsx`, dipasang di `AppShell`) supaya halaman video tetap statis. Jangan membaca cookie/session di `app/layout.tsx`.
  - `useAuth()` -> `status` (`loading | authenticated | guest`), `user`, `profile`, `displayName`, `signOut()`.
  - `useRequireAuth()` / `requireAuth(action, reason)`: jalankan action kalau sudah masuk; kalau tamu, tampilkan modal "Masuk dulu ya, Ayah/Bunda" dengan link `/login?next=<halaman sekarang>`.
- Halaman: `/login` (+ tombol "Coba akun demo" bila `NEXT_PUBLIC_DEMO_EMAIL`/`NEXT_PUBLIC_DEMO_PASSWORD` diisi; dibaca di Server Action `app/login/actions.ts`, tidak masuk bundle client), `/register` (nama tampilan, email, kata sandi), `/auth/callback` (link konfirmasi email: `?code=` atau `?token_hash=&type=`), `/parental` (kontrol orang tua).
- `?next=` selalu divalidasi dengan `safeNextPath()` (`lib/auth-redirect.ts`) agar tidak bisa redirect ke situs lain. Buat link masuk dengan `loginHref(path)`.
- Pesan error auth: `authErrorMessage()` (`lib/supabase/auth-errors.ts`).
- Skema: `supabase/schema.sql` (idempotent). Tabel: `profiles` (dibuat otomatis oleh trigger saat daftar), `subscriptions`, `video_reactions`, `comments`, `watch_later`, `favorites`, `watch_history`, `parental_settings`, `screen_time`. Primary key gabungan `(user_id, video_id|channel_id|date)`.
  - `video_id` = `Video.id` (mis. `yt_EWZDDYbbvAM`), `channel_id` = Channel ID YouTube. Video/channel/produk tetap dari JSON.
  - RLS di semua tabel: hanya pemilik. Pengecualian: `comments` boleh dibaca publik; jumlah reaction/subscriber & komentar + nama penulis lewat fungsi `get_video_reaction_counts`, `get_channel_subscriber_count`, `get_video_comments` (security definer, data per user tetap privat).
- Tipe: `types/database.ts` (ditulis manual mengikuti schema; bisa diganti hasil `supabase gen types`). Ubah keduanya bersamaan.
- Halaman koleksi membaca data lewat `lib/supabase/queries.ts` (server-only): `getSessionUser`, `getHistory`, `getSavedVideos`, `getSubscribedChannels`, `latestVideosFrom`.

## Interaksi (tersambung ke Supabase)

- **Tulis** lewat Server Actions di `app/actions/interactions.ts`: `setReaction`, `setSubscription`, `setSaved` (`watch_later`/`favorites`), `saveWatchProgress`, `removeHistory` (satu / `null` = semua), `addComment`, `deleteComment`. Semua memvalidasi id terhadap data JSON, mengecek user (`getUser()`), dan mengembalikan `{ ok: true } | { ok: false, error, code? }`.
- **Baca** status per user di halaman statis (halaman tonton/channel) lewat browser client (RLS) di komponen client, supaya halaman tetap statis.
- **Optimistic update** dengan `useOptimistic` + `useTransition`; gagal = kembali ke status semula + toast error. Hook bersama: `useOwnedToggle` (`components/interactions/use-owned-toggle.ts`).
- Komponen (`components/interactions/`): `ReactionButtons` (like = `baseLikes(views)` + DB), `SaveToggle`, `SubscriptionProvider` + `SubscribeButton` + `SubscriberCount` (= `baseSubscribers` + DB), `ShareButton` (Web Share API, fallback salin link), `RemovableVideoList` (hapus satu / hapus semua riwayat). Komentar: `components/video/comments-section.tsx`.
- Tamu: setiap aksi memanggil `requireAuth(action, reason)` -> modal "Masuk dulu ya, Ayah/Bunda".
- **Riwayat**: `HistoryTracker` (di halaman tonton, dalam `PlayerProvider`) menyimpan posisi saat play, tiap 15 detik, saat pause/ended/tab disembunyikan/keluar halaman; melanjutkan dari posisi terakhir (`shouldResume` di `lib/engagement.ts`). `WatchProgressProvider` memuat posisi semua video user sekali, dipakai `WatchProgressBar` (bar tipis di thumbnail).
- **Komentar**: maks 300 karakter, terbaru dulu (`get_video_comments`), hapus milik sendiri. Filter kata kasar `lib/profanity.ts` dicek di client, server action, **dan** trigger DB `comments_block_profanity` (daftar kata harus sinkron).
- Toast global: `useToast()` dari `components/ui/toaster.tsx` (dipasang di `AppShell`).

## SEO, error, & kualitas

- Metadata: `metadataBase` dari `lib/site.ts` (`NEXT_PUBLIC_SITE_URL` -> `VERCEL_PROJECT_PRODUCTION_URL` -> localhost). Setiap halaman punya `metadata`/`generateMetadata`; halaman tonton punya Open Graph `video.other` + Twitter card, channel punya OG `profile`. Halaman privat `robots: { index: false }`.
- File metadata: `app/icon.svg` (favicon), `app/apple-icon.tsx`, `app/opengraph-image.tsx` (OG default), `app/robots.ts`, `app/sitemap.ts`, `app/manifest.ts`.
- `app/not-found.tsx` ("Cilukba! Halamannya sembunyi"), `app/error.tsx` & `app/global-error.tsx` (maskot mood `dizzy`).
- Header keamanan dasar & format gambar AVIF/WebP di `next.config.ts`.
- Aksesibilitas: tombol ikon wajib `aria-label`; gambar dekoratif `alt=""` (judul sudah ada di teks); fokus keyboard memakai `focus-visible:ring-4 focus-visible:ring-ring` (tanpa opasitas).
- Tidak ada elemen `<video>`: semua video lewat iframe YouTube.

## Kontrol orang tua

- **Halaman `/parental`** (dinamis, wajib login):
  - Belum ada PIN: buat PIN 4 angka (ketik 2x).
  - Sudah ada: minta PIN dulu.
  - Setelah PIN benar: ringkasan hari ini, grafik 7 hari (recharts, `components/parental/screen-time-chart.tsx`), pengaturan, ganti PIN, tombol "Kunci pengaturan".
- **PIN**:
  - Di-hash dengan **bcryptjs** di Server Action (`app/actions/parental.ts`), dibaca/ditulis hanya lewat **service role** (`lib/supabase/admin.ts`). PIN mentah & hash tidak pernah dikirim ke client.
  - Salah 5x = jeda 5 menit (`pin_failed_attempts`, `pin_locked_until`).
  - PIN benar memberi cookie httpOnly bertanda tangan `tt_parent` (10 menit, `lib/parental-session.ts`) untuk mengubah pengaturan.
- **Hak akses kolom** (schema.sql): dari browser, `parental_settings` hanya bisa DIBACA (tanpa `pin_hash`; `has_pin` = kolom generated). `screen_time` hanya bisa menambah detik lewat `add_screen_time()`. Pengaturan, `bonus_minutes`, `unlocked`, dan `override_until` hanya diubah server setelah PIN, jadi tidak bisa dilewati lewat API.
- **Aturan waktu** (`lib/parental.ts`, dipakai client & server): hari = Asia/Jakarta (`jakartaDate`), `isBedtime` (mendukung lewat tengah malam), `remainingSeconds`, `lockReason` (`"bedtime" | "limit"`).
- **`ParentalControlsProvider`** (global di `AppShell`, tetap jalan saat pindah halaman):
  - Menghitung detik putar yang dilaporkan `ParentalPlayerBridge` (di halaman tonton; hanya status `playing`, bukan buffering).
  - Menyimpan delta di client, lalu sinkron ke `POST /api/screen-time` tiap 30 detik + `sendBeacon` saat tab disembunyikan/ditutup.
  - Peringatan 5 menit sebelum habis (toast).
  - `LockScreen` layar penuh (Radix Dialog yang tidak bisa ditutup; "Untuk orang tua" -> PIN -> +10/+15/+30 menit atau buka kunci hari ini).
  - `BreakScreen` tiap X menit (tombol "Lanjut nonton").
  - Halaman `/parental` tidak ditutupi layar kunci.
- `ParentalPlayerBridge` mem-pause video saat `blocked` dan melanjutkannya setelah dibuka.
- Header: `ScreenTimeIndicator` (sisa menit) untuk orang tua dengan batas harian. Tamu tidak dibatasi; sidebar menampilkan info bahwa fitur ini tersedia setelah masuk.
- Warna bar grafik: token `--chart-bar` (lebih jenuh dari `--sky`, kontras >= 3:1, sudah divalidasi).

## Daftar fitur (roadmap)

Status: **langkah 1-7 selesai** (setup, data, layout, halaman tonton + marketplace, auth, interaksi, kontrol orang tua).

1. **Layout seperti YouTube**: header (logo, search, tombol login/avatar), sidebar (bisa diciutkan, drawer di mobile), chip kategori, grid video, halaman tonton dengan rekomendasi di kanan (di bawah player pada mobile).
2. **Akses**: nonton bebas tanpa login. Like, komentar, subscribe, tonton nanti, favorit, riwayat, dan kontrol orang tua **wajib login** (Supabase Auth).
3. **Konten**: minimal **36 video anak** dari YouTube, lewat data seed (lihat bagian "Sumber video" di atas).
4. **Marketplace**: produk terkait video (mis. video menggambar -> krayon). Muncul sebagai **pop up di player** dan **daftar di bawah video**, dengan link ke **Tokopedia/Shopee**.
5. **Kontrol orang tua**: batas waktu nonton harian, jam tidur, pengingat istirahat, PIN orang tua.
6. **Bahasa UI**: Bahasa Indonesia.
