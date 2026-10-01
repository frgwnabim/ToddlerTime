import type { MetadataRoute } from "next"

import { getCategories, getChannels, getVideos } from "@/lib/data"
import { SITE_URL } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/category", "/marketplace"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : 0.8,
  }))

  return [
    ...staticPages,
    ...getCategories().map((category) => ({
      url: `${SITE_URL}/category/${category.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...getVideos().map((video) => ({
      url: `${SITE_URL}/watch/${video.slug}`,
      lastModified: video.publishedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...getChannels().map((channel) => ({
      url: `${SITE_URL}/channel/${channel.handle}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ]
}
