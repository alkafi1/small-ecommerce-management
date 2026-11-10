import { Link, useParams } from 'react-router'
import { NotFoundPage } from '@/components/feedback/status-page'
import { Select } from '@/components/ui/form-controls'
import { Pagination } from '@/components/ui/pagination'
import { SearchInput } from '@/components/ui/search-input'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState } from '@/components/ui/states'
import { Thumbnail } from '@/components/ui/thumbnail'
import { useUrlFilters } from '@/hooks/use-url-filters'
import { useStorefrontProducts, useStorefrontShop } from './hooks'
import { ProductCard } from './product-card'

const FILTER_KEYS = ['search', 'sort'] as const

export function StorefrontShopPage() {
  const { slug = '' } = useParams()
  const { filters, page, setFilter } = useUrlFilters(FILTER_KEYS)
  const shop = useStorefrontShop(slug)
  const products = useStorefrontProducts(slug, { ...filters, page, per_page: 12 })

  if (shop.error?.status === 404) return <NotFoundPage />

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="mb-6 text-sm text-slate-500" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-brand-700">
          Shops
        </Link>{' '}
        / <span className="text-slate-700">{shop.data?.name ?? '…'}</span>
      </nav>

      {shop.error ? (
        <ErrorState error={shop.error} onRetry={() => shop.refetch()} />
      ) : (
        <header className="mb-8 flex flex-col gap-5 rounded-2xl bg-slate-50 p-6 sm:flex-row sm:items-center">
          {shop.isLoading ? <Skeleton className="size-20 rounded-2xl" /> : <Thumbnail src={shop.data?.logo_url} alt={shop.data?.name ?? 'Shop'} className="size-20 rounded-2xl" />}
          <div>
            {shop.isLoading ? <Skeleton className="h-8 w-56" /> : <h1 className="text-3xl font-bold tracking-tight text-slate-900">{shop.data?.name}</h1>}
            <p className="mt-1 text-slate-500">{shop.data?.description}</p>
          </div>
        </header>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={filters.search} onChange={(value) => setFilter('search', value)} placeholder="Search this shop" />
        <Select className="sm:ml-auto sm:w-52" value={filters.sort ?? ''} onChange={(event) => setFilter('sort', event.target.value)} aria-label="Sort products">
          <option value="">Newest</option>
          <option value="price">Price: low to high</option>
          <option value="-price">Price: high to low</option>
          <option value="name">Name A–Z</option>
        </Select>
      </div>

      {products.error ? (
        products.error.status === 404 ? null : <ErrorState error={products.error} onRetry={() => products.refetch()} />
      ) : products.data?.data.length === 0 ? (
        <EmptyState title={filters.search ? 'No products match your search' : 'This shop has no products yet'} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.isLoading
            ? Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)
            : products.data?.data.map((product) => <ProductCard key={product.id} product={product} shopSlug={slug} />)}
        </div>
      )}
      <Pagination meta={products.data?.meta} onPageChange={(next) => setFilter('page', next)} />
    </div>
  )
}
