<div align="center">

<img src="app/icon.svg" width="88" alt="Logo ToddlerTime" />

# ToddlerTime

**Tontonan aman dan ceria untuk anak balita, dengan kontrol orang tua yang lengkap.**

_A YouTube Kids-style video site for toddlers (UI in Bahasa Indonesia), built with Next.js 16, Supabase, and the YouTube IFrame Player API._

[Demo langsung](https://toddlertime.vercel.app) · [Laporkan masalah](https://github.com/frgwnabim/ToddlerTime/issues)

</div>

---

## Screenshot

> Simpan gambar di `docs/screenshots/` dengan nama di bawah ini, maka akan tampil otomatis.

| Beranda | Halaman tonton |
| --- | --- |
| ![Beranda](docs/screenshots/beranda.png) | ![Halaman tonton](docs/screenshots/tonton.png) |

| Kontrol orang tua | Layar istirahat | Mobile |
| --- | --- | --- |
| ![Kontrol orang tua](docs/screenshots/kontrol-orang-tua.png) | ![Layar istirahat](docs/screenshots/layar-kunci.png) | ![Mobile](docs/screenshots/mobile.png) |

## Fitur

**Menonton (bebas tanpa login)**
- Layout ala YouTube: header dengan pencarian, sidebar (bisa diciutkan), drawer + bottom navigation di mobile.
- 48 video anak dari 43 channel YouTube asli dalam 8 kategori (Hewan, Menggambar & Mewarnai, Musik & Lagu, Alam, Kendaraan, Bermain, Masak-masakan, Warna & Bentuk).
- Pencarian dengan padanan kata Indonesia-Inggris ("truk" menemukan "trucks").
- Halaman tonton dengan player YouTube mode privasi (`youtube-nocookie.com`), daftar "Video berikutnya", dan hitung mundur 5 detik ke video berikutnya yang bisa dibatalkan.
- Mode malam yang hangat dan redup.

**Interaksi (akun orang tua)**
- Suka/tidak suka, subscribe channel, Tonton Nanti, Favorit, dan Bagikan (Web Share API).
- Riwayat otomatis dengan posisi terakhir: video dilanjutkan dari menit terakhir, dan thumbnail menampilkan progress bar.
- Komentar dengan filter kata kasar (Bahasa Indonesia & Inggris), dicek di browser, server, dan trigger database.
- Koleksiku: Riwayat, Tonton Nanti, Favorit, dan Langganan.
- Semua aksi memakai optimistic update, dan tamu diajak masuk lewat modal yang ramah.

**Kontrol orang tua**
- PIN 4 angka (di-hash dengan bcrypt di server, salah 5x = jeda 5 menit).
- Batas waktu nonton harian, jam tidur, dan pengingat istirahat.
- Waktu dihitung hanya saat video benar-benar diputar, reset harian mengikuti WIB, disinkronkan ke database.
- Layar penuh "Waktunya istirahat dulu ya!" yang tidak bisa ditutup anak; orang tua bisa menambah 10/15/30 menit atau membuka kunci hari itu dengan PIN.
- Ringkasan menit hari ini dan grafik 7 hari terakhir.

**Marketplace**
- Produk terkait video (krayon, mainan mobil, buku cerita, dll.) muncul sebagai pop up di player dan daftar di bawah video.
- Sebelum membuka Tokopedia/Shopee ada "gerbang orang tua" (soal hitungan) supaya anak tidak asal pencet.

## Tech stack

| Bagian | Teknologi |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components, Server Actions, `proxy.ts`), React 19, TypeScript |
| UI | Tailwind CSS v4, shadcn/ui (Radix), lucide-react, recharts, font Nunito & Baloo 2 |
| Backend | Supabase (Auth, Postgres, Row Level Security, fungsi SQL) |
| Video | YouTube IFrame Player API (`youtube-nocookie.com`), data dari YouTube Data API v3 (sekali, lewat skrip seed) |
| Keamanan | bcryptjs (PIN), cookie sesi orang tua bertanda tangan HMAC, hak akses per kolom di Postgres |
| Deploy | Vercel |

## Struktur folder

```
app/                    Route (App Router)
  (library)/            Koleksiku: /library, /history, /watch-later, /favorites, /subscriptions
  actions/              Server Actions (interaksi & kontrol orang tua)
  api/screen-time/      Endpoint sinkron waktu tonton (juga lewat sendBeacon)
  watch/[slug]/         Halaman tonton
components/
  ui/                   Komponen dasar (shadcn/ui yang disesuaikan)
  layout/               App shell, header, sidebar, maskot, empty state
  video/                Kartu video, player, overlay, komentar, riwayat
  interactions/         Like, subscribe, simpan, bagikan
  marketplace/          Kartu produk, pop up, gerbang orang tua
  parental/             Provider kontrol orang tua, layar kunci & istirahat, grafik
  auth/                 AuthProvider, menu akun, form masuk/daftar
lib/                    Data, format id-ID, aturan waktu (Asia/Jakarta), client Supabase
data/                   Data video, channel, kategori, produk (JSON hasil seed)
scripts/                Skrip seed YouTube Data API & katalog produk
supabase/schema.sql     Skema database + RLS + fungsi
types/                  Tipe konten & tipe database
```

## Menjalankan secara lokal

Prasyarat: Node.js 20+ dan project [Supabase](https://supabase.com) (gratis).

```bash
git clone https://github.com/frgwnabim/ToddlerTime.git
cd ToddlerTime
npm install
cp .env.example .env.local   # lalu isi nilainya (lihat di bawah)
npm run dev
```

Buka http://localhost:3000. Menonton bisa langsung tanpa akun; fitur akun butuh Supabase.

Perintah lain:

```bash
npm run build       # build produksi
npm run lint        # ESLint
npm run typecheck   # TypeScript
npm run seed        # ambil ulang data video dari YouTube (butuh YOUTUBE_API_KEY)
```

## Setup Supabase

1. Buat project baru di Supabase.
2. **Project Settings > API**: salin `Project URL`, `anon public key`, dan `service_role key` ke `.env.local`:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
3. **SQL Editor > New query**: tempel seluruh isi [`supabase/schema.sql`](supabase/schema.sql), lalu **Run**. Skrip aman dijalankan ulang.
4. **Authentication > URL Configuration**:
   - Site URL: `http://localhost:3000` (ganti dengan domain Vercel setelah deploy)
   - Redirect URLs: `http://localhost:3000/**`
5. Opsional: **Authentication > Sign In / Providers > Email**, matikan "Confirm email" supaya daftar langsung masuk (server email bawaan Supabase dibatasi beberapa email per jam).

### Keamanan data

- Row Level Security aktif di semua tabel: setiap orang tua hanya bisa membaca dan menulis datanya sendiri.
- Komentar dibaca publik; jumlah suka dan subscriber dibaca lewat fungsi agregat, jadi daftar siapa yang menyukai tetap privat.
- Hash PIN, tambahan waktu, buka kunci, dan pengaturan kontrol orang tua hanya bisa diubah lewat server setelah PIN benar (hak akses per kolom), jadi tidak bisa dilewati lewat API.

## Akun demo

1. **Authentication > Users > Add user > Create new user**: isi email & kata sandi, centang **Auto Confirm User**.
2. Isi di `.env.local` (dan di Vercel):
   ```
   NEXT_PUBLIC_DEMO_EMAIL=demo@contoh.com
   NEXT_PUBLIC_DEMO_PASSWORD=kata-sandi-demo
   ```
3. Tombol **"Coba akun demo"** muncul di halaman masuk. Kredensial dibaca di server, tidak ikut ke bundle browser.

Akun demo dipakai bersama semua pengunjung; jangan pakai kata sandi yang dipakai di tempat lain.

## Deploy ke Vercel

1. Push repository ke GitHub.
2. Di [vercel.com/new](https://vercel.com/new), import repository ini (framework Next.js terdeteksi otomatis).
3. Isi **Environment Variables**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (tandai _Sensitive_), dan opsional `NEXT_PUBLIC_DEMO_EMAIL`, `NEXT_PUBLIC_DEMO_PASSWORD`, `NEXT_PUBLIC_SITE_URL`. `YOUTUBE_API_KEY` tidak diperlukan.
4. **Deploy**.
5. Di Supabase **Authentication > URL Configuration**: ganti Site URL dengan domain Vercel (mis. `https://toddlertime.vercel.app`) dan tambahkan Redirect URLs:
   - `https://toddlertime.vercel.app/**`
   - `https://*-<nama-tim>.vercel.app/**` (preview deployment)
   - `http://localhost:3000/**`

## Konten & hak cipta

- Semua video **diputar lewat embed resmi YouTube** (YouTube IFrame Player API, mode privasi `youtube-nocookie.com`). ToddlerTime tidak mengunduh, menyimpan, atau menyiarkan ulang video.
- **Hak cipta video, judul, thumbnail, dan nama channel sepenuhnya milik masing-masing kreator di YouTube.** Setiap halaman tonton menautkan ke video aslinya di YouTube.
- Data video diambil sekali lewat YouTube Data API v3 dan tunduk pada [Ketentuan Layanan API YouTube](https://developers.google.com/youtube/terms/api-services-terms-of-service).
- Link toko mengarah ke **hasil pencarian** Tokopedia/Shopee (pihak ketiga); ToddlerTime tidak menjual produk dan bukan afiliasi. Gambar produk adalah ilustrasi buatan sendiri.
- Project ini adalah portofolio, bukan layanan resmi YouTube Kids.

## Catatan pengembangan

Konvensi kode, design system (token warna, komponen), dan arsitektur lengkap ada di [CLAUDE.md](CLAUDE.md).
