import { Link } from 'react-router'
import { StatusBadge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { Thumbnail } from '@/components/ui/thumbnail'
import { useAuthStore } from '@/stores/auth.store'
import { useCurrentShop } from './current-shop'
import { useOwnerStats } from './hooks'

export function OwnerDashboardPage() {
  const user = useAuthStore((state) => state.user)
  const stats = useOwnerStats()
  const { shop } = useCurrentShop()

  return (
    <>
      <PageHeader title={`Welcome, ${user?.name.split(' ')[0] ?? ''}`} description="Manage what your shops sell, at your own prices." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="My shops" value={stats.data?.shops} loading={stats.isLoading} />
        <StatCard label="Products listed" value={stats.data?.listings} hint="Across all your shops" loading={stats.isLoading} />
        <StatCard label="Products I created" value={stats.data?.my_products} hint="Shared to the catalog" loading={stats.isLoading} />
      </div>

      {shop && (
        <div className="mt-8 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
          <Thumbnail src={shop.logo_url} alt={shop.name} className="size-16 rounded-xl" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">{shop.name}</h2>
              <StatusBadge active={shop.is_active} />
            </div>
            <p className="text-sm text-slate-500">{shop.description ?? 'No description'}</p>
            {!shop.is_active && <p className="mt-1 text-sm text-amber-700">This shop is inactive, so customers cannot see it. Contact the administrator.</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/owner/catalog" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
              Browse catalog
            </Link>
            <Link to={`/shops/${shop.slug}`} target="_blank" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              View shop ↗
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
