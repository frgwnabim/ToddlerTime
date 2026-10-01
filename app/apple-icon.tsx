import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

// Ikon iOS dari maskot yang sama dengan app/icon.svg.
export default async function AppleIcon() {
  const svg = await readFile(join(process.cwd(), "app/icon.svg"), "utf8")
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff9f0",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse (satori) butuh <img> biasa */}
        <img src={src} width={132} height={132} alt="" />
      </div>
    ),
    size
  )
}
