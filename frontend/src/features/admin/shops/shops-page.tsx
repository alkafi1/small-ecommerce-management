import { useState } from 'react'
import { Link } from 'react-router'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Select } from '@/components/ui/form-controls'
import { PageHeader, Toolbar } from '@/components/ui/page-header'
import { Pagination } from '@/components/ui/pagination'
import { SearchInput } from '@/components/ui/search-input'
import { Thumbnail } from '@/components/ui/thumbnail'
import { useUrlFilters } from '@/hooks/use-url-filters'
import type { Shop } from '@/types/models'
import { useShopOwnerOptions } from '../shop-owners/hooks'
import { useAdminShops, useDeleteShop } from './hooks'
import { ShopFormModal } from './shop-form-modal'
import { ShopListingsModal } from './shop-listings-modal'

const FILTER_KEYS = ['search', 'owner_id', 'is_active'] as const

export function ShopsPage() {
  const { filters, page, setFilter } = useUrlFilters(FILTER_KEYS)
  const shops = useAdminShops({ ...filters, page })
  const owners = useShopOwnerOptions()
  const remove = useDeleteShop()

  const [form, setForm] = useState<{ shop: Shop | null } | null>(null)
  const [viewing, setViewing] = useState<Shop | null>(null)
  const [deleting, setDeleting] = useState<Shop | null>(null)

  const columns: Column<Shop>[] = [
    {
      key: 'name',
      header: 'Shop',
      cell: (shop) => (
        <div className="flex items-center gap-3">
          <Thumbnail src={shop.logo_url} alt={shop.name} className="size-10 rounded-lg" />
          <div>
            <p className="font-medium text-slate-900">{shop.name}</p>
            <Link to={`/shops/${shop.slug}`} target="_blank" className="text-xs text-brand-600 hover:underline">
              /shops/{shop.slug} ↗
            </Link>
          </div>
        </div>
      ),
    },
    { key: 'owner', header: 'Owner', cell: (shop) => shop.owner?.name ?? '—' },
    {
      key: 'listings',
      header: 'Listings',
      cell: (shop) => (
        <button type="button" className="font-medium text-brand-600 hover:underline" onClick={() => setViewing(shop)}>
          {shop.listings_count ?? 0} products
        </button>
      ),
    },
    { key: 'status', header: 'Status', cell: (shop) => <StatusBadge active={shop.is_active} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (shop) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => setForm({ shop })}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => setDeleting(shop)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Shops" description="Each shop belongs to one owner, who decides what it sells." actions={<Button onClick={() => setForm({ shop: null })}>+ New shop</Button>} />

      <Toolbar>
        <SearchInput value={filters.search} onChange={(value) => setFilter('search', value)} placeholder="Search shops" />
        <Select className="sm:w-56" value={filters.owner_id ?? ''} onChange={(event) => setFilter('owner_id', event.target.value)} aria-label="Filter by owner">
          <option value="">All owners</option>
          {owners.data?.map((owner) => (
            <option key={owner.id} value={owner.id}>
              {owner.name}
            </option>
          ))}
        </Select>
        <Select className="sm:w-40" value={filters.is_active ?? ''} onChange={(event) => setFilter('is_active', event.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </Select>
      </Toolbar>

      <DataTable
        columns={columns}
        rows={shops.data?.data}
        rowKey={(shop) => shop.id}
        isLoading={shops.isLoading}
        error={shops.error}
        onRetry={() => shops.refetch()}
        empty={{
          title: filters.search || filters.owner_id || filters.is_active ? 'No shops match your filters' : 'No shops yet',
          description: 'Create a shop and assign it to a shop owner.',
          action: <Button onClick={() => setForm({ shop: null })}>+ New shop</Button>,
        }}
      />
      <Pagination meta={shops.data?.meta} onPageChange={(next) => setFilter('page', next)} />

      {form && <ShopFormModal shop={form.shop} onClose={() => setForm(null)} />}
      {viewing && <ShopListingsModal shop={viewing} onClose={() => setViewing(null)} />}
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete shop?"
        message={
          <>
            <strong>{deleting?.name}</strong> and all of its listings will disappear from the storefront. Catalog products are not affected.
          </>
        }
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSettled: () => setDeleting(null) })}
      />
    </>
  )
}
