import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ]
  },
  // Rute lama Koleksiku.
  async redirects() {
    return [
      { source: "/feed", destination: "/library", permanent: true },
      {
        source: "/feed/:section(watch-later|favorites|history|subscriptions)",
        destination: "/:section",
        permanent: true,
      },
    ]
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Thumbnail video YouTube
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/**" },
      // Avatar channel YouTube
      { protocol: "https", hostname: "yt3.ggpht.com", pathname: "/**" },
    ],
  },
}

export default nextConfig
