import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

export const alt = "ToddlerTime: tontonan ceria untuk balita"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// Gambar Open Graph default (beranda & halaman tanpa gambar sendiri).
export default async function OpenGraphImage() {
  const svg = await readFile(join(process.cwd(), "app/icon.svg"), "utf8")
  const mascot = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`
  const chips = [
    { label: "Lagu Anak", bg: "#e3f3fd", fg: "#1d5a85" },
    { label: "Hewan", bg: "#e2f7ef", fg: "#1e6b52" },
    { label: "Menggambar", bg: "#ffe9de", fg: "#94472a" },
    { label: "Kendaraan", bg: "#efeafd", fg: "#5a45a8" },
  ]

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 56,
          padding: "0 88px",
          background: "linear-gradient(135deg, #fff9f0 0%, #e3f3fd 60%, #efeafd 100%)",
          color: "#2b2d42",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse (satori) butuh <img> biasa */}
        <img src={mascot} width={300} height={300} alt="" />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 800, letterSpacing: -2 }}>
            Toddler<span style={{ color: "#94472a" }}>Time</span>
          </div>
          <div style={{ fontSize: 36, color: "#6b6577", maxWidth: 640 }}>
            Tontonan aman dan ceria untuk si kecil, dengan kontrol orang tua.
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 12 }}>
            {chips.map((chip) => (
              <div
                key={chip.label}
                style={{
                  display: "flex",
                  padding: "10px 22px",
                  borderRadius: 999,
                  background: chip.bg,
                  color: chip.fg,
                  fontSize: 26,
                  fontWeight: 700,
                }}
              >
                {chip.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size
  )
}
