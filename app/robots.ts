import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/auth/",
        "/login",
        "/register",
        "/parental",
        "/library",
        "/history",
        "/watch-later",
        "/favorites",
        "/subscriptions",
        "/search",
        "/design-system",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
