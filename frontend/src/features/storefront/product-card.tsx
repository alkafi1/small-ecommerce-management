import { Link } from 'react-router'
import { Thumbnail } from '@/components/ui/thumbnail'
import { formatMoney } from '@/lib/utils/format'
import type { StorefrontProduct } from '@/types/models'

export function ProductCard({ product, shopSlug }: { product: StorefrontProduct; shopSlug: string }) {
  return (
    <Link to={`/shops/${shopSlug}/products/${product.id}`} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="overflow-hidden bg-slate-100">
        <Thumbnail src={product.thumbnail_url} alt={product.name} className="aspect-square w-full transition duration-300 group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-medium text-slate-900 group-hover:text-brand-700">{product.name}</h3>
        <p className="mt-auto pt-2 text-lg font-semibold text-slate-900">{formatMoney(product.price)}</p>
      </div>
    </Link>
  )
}
