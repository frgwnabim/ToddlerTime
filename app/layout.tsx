import type { Metadata, Viewport } from "next"
import { Baloo_2, Nunito } from "next/font/google"

import { cn } from "@/lib/utils"
import { themeInitScript } from "@/lib/theme"
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
  title: {
    default: "ToddlerTime",
    template: "%s · ToddlerTime",
  },
  description:
    "ToddlerTime: tontonan aman dan ceria untuk anak balita, lengkap dengan kontrol orang tua.",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff9f0" },
    { media: "(prefers-color-scheme: dark)", color: "#1e1a17" },
  ],
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={cn("h-full antialiased", nunito.variable, baloo.variable)}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
