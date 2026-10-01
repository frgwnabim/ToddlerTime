import type { Metadata } from "next"
import { ShoppingBag } from "lucide-react"

import { EmptyState } from "@/components/layout/empty-state"
import { PageContainer } from "@/components/layout/page-container"
import { ProductGrid } from "@/components/marketplace/product-card"
import { StoreDisclaimer } from "@/components/marketplace/store-disclaimer"
import { CategoryChips } from "@/components/video/category-chips"
import { getCategoryById, getProducts } from "@/lib/data"

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Mainan dan perlengkapan yang cocok dengan video favorit si kecil.",
}

export default async function MarketplacePage({ searchParams }: PageProps<"/marketplace">) {
  const { category: rawCategory } = await searchParams
  const category = getCategoryById(Array.isArray(rawCategory) ? rawCategory[0] : (rawCategory ?? ""))
  const products = getProducts(category?.id)

  return (
    <>
      <PageContainer className="pt-6 pb-0">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <p className="mt-1 max-w-2xl text-muted-foreground">
          Mainan dan perlengkapan yang cocok dengan video favorit si kecil.
        </p>
        <StoreDisclaimer className="mt-2 max-w-2xl" />
      </PageContainer>

      <CategoryChips
        active={category?.id ?? "all"}
        hrefFor={(id) => (id === "all" ? "/marketplace" : `/marketplace?category=${id}`)}
        label="Filter kategori produk"
      />

      <PageContainer className="pt-2">
        <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
          {products.length} produk{category ? ` untuk ${category.name}` : ""}
        </p>
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <EmptyState
            icon={ShoppingBag}
            mood="sleepy"
            title="Belum ada produk"
            description="Produk untuk kategori ini sedang disiapkan."
          />
        )}
      </PageContainer>
    </>
  )
}
