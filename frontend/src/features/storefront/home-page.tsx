import { Link } from 'react-router'
import { Pagination } from '@/components/ui/pagination'
import { SearchInput } from '@/components/ui/search-input'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState } from '@/components/ui/states'
import { Thumbnail } from '@/components/ui/thumbnail'
import { useUrlFilters } from '@/hooks/use-url-filters'
import { useStorefrontShops } from './hooks'

const FILTER_KEYS = ['search'] as const

export function StorefrontHomePage() {
  const { filters, page, setFilter } = useUrlFilters(FILTER_KEYS)
  const shops = useStorefrontShops({ ...filters, page })

  return (
    <>
      <section className="bg-linear-to-br from-brand-600 via-brand-700 to-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-sm font-semibold tracking-wider text-brand-100 uppercase">Shop local, shop smart</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">Discover shops and their best products</h1>
          <p className="mt-4 max-w-xl text-brand-100">Every shop sets its own prices and picks its own range. Pick a shop to start browsing.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Shops</h2>
          <SearchInput value={filters.search} onChange={(value) => setFilter('search', value)} placeholder="Find a shop" />
        </div>

        {shops.error ? (
          <ErrorState error={shops.error} onRetry={() => shops.refetch()} />
        ) : shops.data?.data.length === 0 ? (
          <EmptyState title={filters.search ? 'No shops match your search' : 'No shops are open yet'} description="Please check back soon." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shops.isLoading
              ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
              : shops.data?.data.map((shop) => (
                  <Link key={shop.slug} to={`/shops/${shop.slug}`} className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-lg">
                    <Thumbnail src={shop.logo_url} alt={shop.name} className="size-16 shrink-0 rounded-xl" />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 group-hover:text-brand-700">{shop.name}</h3>
                      <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{shop.description}</p>
                      <p className="mt-2 text-xs font-medium text-brand-600">
                        {shop.products_count} product{shop.products_count === 1 ? '' : 's'} →
                      </p>
                    </div>
                  </Link>
                ))}
          </div>
        )}
        <Pagination meta={shops.data?.meta} onPageChange={(next) => setFilter('page', next)} />
      </section>
    </>
  )
}
