import { useState } from 'react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Select } from '@/components/ui/form-controls'
import { PageHeader, Toolbar } from '@/components/ui/page-header'
import { Pagination } from '@/components/ui/pagination'
import { SearchInput } from '@/components/ui/search-input'
import { Switch } from '@/components/ui/switch'
import { Thumbnail } from '@/components/ui/thumbnail'
import { useUrlFilters } from '@/hooks/use-url-filters'
import { formatMoney } from '@/lib/utils/format'
import type { Listing, Shop } from '@/types/models'
import { useListings, useRemoveListing, useSetListingVisibility } from './hooks'
import { ListingFormModal } from './listing-form-modal'
import { RequireShop } from './require-shop'

const FILTER_KEYS = ['search', 'is_visible', 'sort'] as const

export function ListingsPage() {
  return <RequireShop>{(shop) => <ListingsView shop={shop} />}</RequireShop>
}

function ListingsView({ shop }: { shop: Shop }) {
  const { filters, page, setFilter } = useUrlFilters(FILTER_KEYS)
  const listings = useListings(shop.id, { ...filters, page })
  const visibility = useSetListingVisibility(shop.id)
  const remove = useRemoveListing(shop.id)

  const [editing, setEditing] = useState<Listing | null>(null)
  const [removing, setRemoving] = useState<Listing | null>(null)

  const columns: Column<Listing>[] = [
    {
      key: 'product',
      header: 'Product',
      cell: (listing) => (
        <div className="flex items-center gap-3">
          <Thumbnail src={listing.thumbnail_url} alt={listing.name} className="size-11 rounded-lg" />
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{listing.name}</p>
            <div className="mt-0.5 flex flex-wrap gap-1">
              {listing.overrides.name && <Badge tone="brand">Custom name</Badge>}
              {listing.overrides.description && <Badge tone="brand">Custom details</Badge>}
              {listing.overrides.thumbnail_url && <Badge tone="brand">Custom image</Badge>}
              {!listing.product.is_active && <Badge tone="red">Inactive in catalog</Badge>}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Your price',
      cell: (listing) => (
        <div>
          <p className="font-medium text-slate-900">{formatMoney(listing.price)}</p>
          <p className="text-xs text-slate-500">Catalog {formatMoney(listing.product.base_price)}</p>
        </div>
      ),
    },
    {
      key: 'visible',
      header: 'Visible',
      cell: (listing) => (
        <Switch
          checked={listing.is_visible}
          label={`Show ${listing.name} to customers`}
          disabled={visibility.isPending && visibility.variables?.id === listing.id}
          onChange={(isVisible) => visibility.mutate({ id: listing.id, isVisible })}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (listing) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => setEditing(listing)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => setRemoving(listing)}>
            Remove
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="My shop products"
        description={
          <>
            What <strong className="text-slate-700">{shop.name}</strong> sells. Set your own price, name, details and image per product.
          </>
        }
        actions={
          <Link to="/owner/catalog" className="inline-flex h-10 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700">
            + Add from catalog
          </Link>
        }
      />

      <Toolbar>
        <SearchInput value={filters.search} onChange={(value) => setFilter('search', value)} placeholder="Search your products" />
        <Select className="sm:w-40" value={filters.is_visible ?? ''} onChange={(event) => setFilter('is_visible', event.target.value)} aria-label="Filter by visibility">
          <option value="">All</option>
          <option value="1">Visible</option>
          <option value="0">Hidden</option>
        </Select>
        <Select className="sm:w-48" value={filters.sort ?? ''} onChange={(event) => setFilter('sort', event.target.value)} aria-label="Sort">
          <option value="">Recently added</option>
          <option value="name">Name A–Z</option>
          <option value="price">Price: low to high</option>
          <option value="-price">Price: high to low</option>
        </Select>
      </Toolbar>

      <DataTable
        columns={columns}
        rows={listings.data?.data}
        rowKey={(listing) => listing.id}
        isLoading={listings.isLoading}
        error={listings.error}
        onRetry={() => listings.refetch()}
        empty={{
          title: filters.search || filters.is_visible ? 'No products match your filters' : 'Your shop has no products yet',
          description: 'Pick products from the shared catalog and set your own price.',
          action: (
            <Link to="/owner/catalog" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
              Browse catalog
            </Link>
          ),
        }}
      />
      <Pagination meta={listings.data?.meta} onPageChange={(next) => setFilter('page', next)} />

      {editing && <ListingFormModal mode="edit" shop={shop} listing={editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog
        open={Boolean(removing)}
        title="Remove from your shop?"
        message={
          <>
            Customers will no longer see <strong>{removing?.name}</strong> in {shop.name}. The product stays in the shared catalog, so you can add it again later.
          </>
        }
        confirmLabel="Remove"
        loading={remove.isPending}
        onClose={() => setRemoving(null)}
        onConfirm={() => removing && remove.mutate(removing.id, { onSettled: () => setRemoving(null) })}
      />
    </>
  )
}
