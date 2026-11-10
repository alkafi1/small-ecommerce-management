import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/form-controls'
import { PageHeader, Toolbar } from '@/components/ui/page-header'
import { Pagination } from '@/components/ui/pagination'
import { SearchInput } from '@/components/ui/search-input'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState } from '@/components/ui/states'
import { Thumbnail } from '@/components/ui/thumbnail'
import { useUrlFilters } from '@/hooks/use-url-filters'
import { formatMoney } from '@/lib/utils/format'
import type { Product, Shop } from '@/types/models'
import { useCatalog } from './hooks'
import { ListingFormModal } from './listing-form-modal'
import { RequireShop } from './require-shop'

const FILTER_KEYS = ['search', 'sort'] as const

export function CatalogPage() {
  return <RequireShop>{(shop) => <CatalogView shop={shop} />}</RequireShop>
}

function CatalogView({ shop }: { shop: Shop }) {
  const { filters, page, setFilter } = useUrlFilters(FILTER_KEYS)
  const catalog = useCatalog(shop.id, { ...filters, page, per_page: 12 })
  const [adding, setAdding] = useState<Product | null>(null)

  return (
    <>
      <PageHeader
        title="Shared catalog"
        description={
          <>
            Products from the admin and all shop owners. Add any of them to <strong className="text-slate-700">{shop.name}</strong> and set your own price.
          </>
        }
      />

      <Toolbar>
        <SearchInput value={filters.search} onChange={(value) => setFilter('search', value)} placeholder="Search catalog" />
        <Select className="sm:w-48" value={filters.sort ?? ''} onChange={(event) => setFilter('sort', event.target.value)} aria-label="Sort">
          <option value="">Newest first</option>
          <option value="name">Name A–Z</option>
          <option value="price">Price: low to high</option>
          <option value="-price">Price: high to low</option>
        </Select>
      </Toolbar>

      {catalog.error ? (
        <ErrorState error={catalog.error} onRetry={() => catalog.refetch()} />
      ) : catalog.data?.data.length === 0 ? (
        <EmptyState title={filters.search ? 'No products match your search' : 'The catalog is empty'} description="Products created by the admin or other owners will appear here." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {catalog.isLoading
            ? Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)
            : catalog.data?.data.map((product) => (
                <article key={product.id} className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="relative">
                    <Thumbnail src={product.thumbnail_url} alt={product.name} className="aspect-square w-full" />
                    {product.already_listed && <Badge tone="green" className="absolute top-2 left-2 shadow-sm">✓ In your shop</Badge>}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="line-clamp-2 font-medium text-slate-900">{product.name}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      by {product.is_mine ? 'you' : product.created_by?.name} · in {product.listings_count ?? 0} shop{product.listings_count === 1 ? '' : 's'}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">Catalog price {formatMoney(product.base_price)}</p>
                    <div className="mt-auto pt-4">
                      <Button className="w-full" size="sm" variant={product.already_listed ? 'secondary' : 'primary'} disabled={product.already_listed} onClick={() => setAdding(product)}>
                        {product.already_listed ? 'Already in shop' : '+ Add to shop'}
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
        </div>
      )}

      <Pagination meta={catalog.data?.meta} onPageChange={(next) => setFilter('page', next)} />

      {adding && <ListingFormModal mode="create" shop={shop} product={adding} onClose={() => setAdding(null)} />}
    </>
  )
}
