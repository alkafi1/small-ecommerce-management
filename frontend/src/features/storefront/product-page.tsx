import { Link, useParams } from 'react-router'
import { NotFoundPage } from '@/components/feedback/status-page'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/states'
import { Thumbnail } from '@/components/ui/thumbnail'
import { formatMoney } from '@/lib/utils/format'
import { useStorefrontProduct } from './hooks'

export function StorefrontProductPage() {
  const { slug = '', productId } = useParams()
  const product = useStorefrontProduct(slug, Number(productId))

  if (!Number.isFinite(Number(productId)) || product.error?.status === 404) return <NotFoundPage />

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <nav className="mb-6 text-sm text-slate-500" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-brand-700">
          Shops
        </Link>{' '}
        /{' '}
        <Link to={`/shops/${slug}`} className="hover:text-brand-700">
          {product.data?.shop?.name ?? '…'}
        </Link>{' '}
        / <span className="text-slate-700">{product.data?.name ?? '…'}</span>
      </nav>

      {product.error ? (
        <ErrorState error={product.error} onRetry={() => product.refetch()} />
      ) : product.isLoading || !product.data ? (
        <div className="grid gap-10 md:grid-cols-2">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      ) : (
        <div className="grid gap-10 md:grid-cols-2">
          <Thumbnail src={product.data.thumbnail_url} alt={product.data.name} className="aspect-square w-full rounded-3xl border border-slate-200" />
          <div>
            <Link to={`/shops/${slug}`} className="text-sm font-medium text-brand-600 hover:underline">
              {product.data.shop?.name}
            </Link>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{product.data.name}</h1>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{formatMoney(product.data.price)}</p>
            {product.data.sku && <p className="mt-1 text-sm text-slate-500">SKU: {product.data.sku}</p>}
            <div className="mt-6 border-t border-slate-200 pt-6">
              <h2 className="text-sm font-semibold text-slate-900">Description</h2>
              <p className="mt-2 whitespace-pre-line text-slate-600">{product.data.description || 'No description available.'}</p>
            </div>
            <Link to={`/shops/${slug}`} className="mt-8 inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              ← More from this shop
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
