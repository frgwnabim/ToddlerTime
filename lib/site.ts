// URL publik situs untuk metadata absolut (Open Graph, sitemap).
// Urutan: NEXT_PUBLIC_SITE_URL -> domain produksi Vercel -> localhost.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "")

export const SITE_NAME = "ToddlerTime"
export const SITE_DESCRIPTION =
  "Tontonan aman dan ceria untuk anak balita: lagu, hewan, menggambar, dan kendaraan, lengkap dengan kontrol orang tua."
