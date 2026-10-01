import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { getCategoryById } from "@/lib/data"
import { formatPrice } from "@/lib/format"
import type { Product } from "@/types"
import { ShopButton } from "./shop-button"

/** "Beli di Tokopedia" saat kartu lebar, "Tokopedia" saat sempit. */
function StoreLabel({ store }: { store: string }) {
  return (
    <>
      <span className="@[14rem]:hidden">{store}</span>
      <span className="hidden @[14rem]:inline">Beli di {store}</span>
    </>
  )
}

export function ProductCard({ product, id }: { product: Product; id?: string }) {
  const category = getCategoryById(product.category)

  return (
    <article
      id={id}
      className="@container flex scroll-mt-24 flex-col overflow-hidden rounded-2xl bg-card p-2.5 shadow-soft ring-1 ring-border transition-shadow duration-300 hover:shadow-lift data-[highlight=true]:ring-4 data-[highlight=true]:ring-peach sm:p-3"
    >
      <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-muted">
        <Image
          src={product.imageUrl}
          alt={`Ilustrasi ${product.name}`}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-1 pt-3">
        {category && (
          <Badge variant={category.color} className="mb-0.5 max-w-full">
            <span className="truncate">{category.name}</span>
          </Badge>
        )}
        <h3 className="font-sans text-[0.95rem] leading-snug font-bold @[15rem]:text-base">{product.name}</h3>
        <p className="hidden text-sm text-muted-foreground @[13rem]:line-clamp-2">{product.description}</p>
        <p className="mt-auto pt-2 font-heading text-lg font-bold @[15rem]:text-xl">{formatPrice(product.priceIdr)}</p>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2">
        <ShopButton
          url={product.tokopediaUrl}
          store="tokopedia"
          productName={product.name}
          label={<StoreLabel store="Tokopedia" />}
        />
        <ShopButton
          url={product.shopeeUrl}
          store="shopee"
          productName={product.name}
          label={<StoreLabel store="Shopee" />}
        />
      </div>
    </article>
  )
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 @3xl:grid-cols-3 @6xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
