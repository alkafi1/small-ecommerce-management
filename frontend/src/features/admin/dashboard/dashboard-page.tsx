import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { ErrorState } from '@/components/ui/states'
import { request } from '@/lib/http/client'

interface AdminStats {
  shops: number
  active_shops: number
  shop_owners: number
  products: number
  unlisted_products: number
  listings: number
}

export function AdminDashboardPage() {
  const stats = useQuery({ queryKey: ['admin', 'dashboard'], queryFn: () => request<AdminStats>({ url: '/admin/dashboard' }) })

  return (
    <>
      <PageHeader title="Dashboard" description="An overview of shops, owners and the shared product catalog." />
      {stats.error ? (
        <ErrorState error={stats.error} onRetry={() => stats.refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Shops" value={stats.data?.shops} hint={`${stats.data?.active_shops ?? 0} active`} loading={stats.isLoading} />
          <StatCard label="Shop owners" value={stats.data?.shop_owners} loading={stats.isLoading} />
          <StatCard label="Catalog products" value={stats.data?.products} hint={`${stats.data?.unlisted_products ?? 0} not listed in any shop`} loading={stats.isLoading} />
          <StatCard label="Shop listings" value={stats.data?.listings} hint="Products assigned to shops" loading={stats.isLoading} />
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { to: '/admin/shop-owners', title: 'Manage shop owners', text: 'Create accounts and activate or deactivate them.' },
          { to: '/admin/shops', title: 'Manage shops', text: 'Create shops and assign them to an owner.' },
          { to: '/admin/products', title: 'Manage the catalog', text: 'Products here can be listed by any shop.' },
        ].map((card) => (
          <Link key={card.to} to={card.to} className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow">
            <h3 className="font-semibold text-slate-900 group-hover:text-brand-700">{card.title} →</h3>
            <p className="mt-1 text-sm text-slate-500">{card.text}</p>
          </Link>
        ))}
      </div>
    </>
  )
}
