import type { Metadata } from "next"
import Link from "next/link"
import { History } from "lucide-react"

import { RemovableVideoList } from "@/components/interactions/removable-video-list"
import { CollectionHeader } from "@/components/layout/collection-header"
import { EmptyState } from "@/components/layout/empty-state"
import { LoginRequired } from "@/components/layout/login-required"
import { PageContainer } from "@/components/layout/page-container"
import { Button } from "@/components/ui/button"
import { VideoCard } from "@/components/video/video-card"
import { getHistory, getSessionUser } from "@/lib/supabase/queries"

export const metadata: Metadata = { title: "Riwayat", robots: { index: false } }

export default async function HistoryPage() {
  const { supabase, user } = await getSessionUser()

  return (
    <PageContainer className="max-w-5xl py-6">
      <CollectionHeader icon={History} title="Riwayat" description="Video yang sudah ditonton si kecil." />
      {!user ? (
        <LoginRequired
          icon={History}
          next="/history"
          description="Lihat lagi video yang sudah ditonton. Masuk dulu supaya riwayat tercatat."
        />
      ) : (
        <RemovableVideoList
          kind="history"
          layout="list"
          items={(await getHistory(supabase)).map(({ video }) => ({
            id: video.id,
            title: video.title,
            node: <VideoCard video={video} layout="row" />,
          }))}
          empty={
            <EmptyState
              mood="sleepy"
              icon={History}
              title="Riwayat masih kosong"
              description="Video yang ditonton akan tercatat di sini, lengkap dengan posisi terakhirnya."
              action={
                <Button asChild size="lg">
                  <Link href="/">Mulai menonton</Link>
                </Button>
              }
            />
          }
        />
      )}
    </PageContainer>
  )
}
