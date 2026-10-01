import type { Metadata, Viewport } from "next"
import { Baloo_2, Nunito } from "next/font/google"

import { AppShell } from "@/components/layout/app-shell"
import type { ShellChannel } from "@/components/layout/nav-items"
import { getChannels } from "@/lib/data"
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site"
import { themeInitScript } from "@/lib/theme"
import { cn } from "@/lib/utils"
import "./globals.css"

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
})

const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo",
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ToddlerTime: tontonan ceria untuk balita",
    template: "%s · ToddlerTime",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["video anak", "balita", "lagu anak", "YouTube Kids", "kontrol orang tua", "tontonan edukasi"],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: SITE_NAME,
    title: "ToddlerTime: tontonan ceria untuk balita",
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff9f0" },
    { media: "(prefers-color-scheme: dark)", color: "#1e1a17" },
  ],
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  // Channel di sidebar: paling banyak subscriber lebih dulu.
  const channels: ShellChannel[] = [...getChannels()]
    .sort((a, b) => b.baseSubscribers - a.baseSubscribers)
    .map(({ id, handle, name, avatarUrl }) => ({ id, handle, name, avatarUrl }))

  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={cn("h-full antialiased", nunito.variable, baloo.variable)}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <AppShell channels={channels}>{children}</AppShell>
      </body>
    </html>
  )
}
