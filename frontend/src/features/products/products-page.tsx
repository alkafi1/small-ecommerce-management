import { useState } from 'react'
import { Badge, StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Select } from '@/components/ui/form-controls'
import { PageHeader, Toolbar } from '@/components/ui/page-header'
import { Pagination } from '@/components/ui/pagination'
import { SearchInput } from '@/components/ui/search-input'
import { Thumbnail } from '@/components/ui/thumbnail'
import { useUrlFilters } from '@/hooks/use-url-filters'
import { formatMoney } from '@/lib/utils/format'
import type { Product } from '@/types/models'
import type { ProductScope } from './api'
import { useDeleteProduct, useProducts } from './hooks'
import { ProductFormModal } from './product-form-modal'

const FILTER_KEYS = ['search', 'is_active', 'sort'] as const

const COPY: Record<ProductScope, { title: string; description: string; deleteNote: string }> = {
  admin: {
    title: 'Products',
    description: 'The shared catalog. Every active product here can be listed by any shop.',
    deleteNote: 'It will be removed from the catalog and from every shop that sells it.',
  },
  owner: {
    title: 'My products',
    description: 'Products you created. They are shared to the catalog so other shops can sell them too.',
    deleteNote: 'It will be removed from your shops. You cannot delete it while other shops sell it.',
  },
}

export function ProductsPage({ scope }: { scope: ProductScope }) {
  const copy = COPY[scope]
  const { filters, page, setFilter } = useUrlFilters(FILTER_KEYS)
  const products = useProducts(scope, { ...filters, page })
  const remove = useDeleteProduct(scope)

  const [form, setForm] = useState<{ product: Product | null } | null>(null)
  const [deleting, setDeleting] = useState<Product | null>(null)

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Product',
      cell: (product) => (
        <div className="flex items-center gap-3">
          <Thumbnail src={product.thumbnail_url} alt={product.name} className="size-11 rounded-lg" />
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{product.name}</p>
            <p className="text-xs text-slate-500">{product.sku ?? 'No SKU'}</p>
          </div>
        </div>
      ),
    },
    { key: 'price', header: 'Base price', cell: (product) => formatMoney(product.base_price) },
    ...(scope === 'admin'
      ? [
          {
            key: 'creator',
            header: 'Created by',
            cell: (product: Product) => (
              <div className="flex items-center gap-2">
                <span>{product.created_by?.name}</span>
                <Badge tone={product.created_by?.role === 'admin' ? 'brand' : 'amber'}>{product.created_by?.role === 'admin' ? 'Admin' : 'Owner'}</Badge>
              </div>
            ),
          },
        ]
      : []),
    { key: 'listings', header: 'In shops', cell: (product) => product.listings_count ?? 0 },
    { key: 'status', header: 'Status', cell: (product) => <StatusBadge active={product.is_active} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (product) => (
        <div className="flex justify-end gap-1">
          {product.can.update && (
            <Button variant="ghost" size="sm" onClick={() => setForm({ product })}>
              Edit
            </Button>
          )}
          {product.can.delete && (
            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => setDeleting(product)}>
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ]

  const filtered = Boolean(filters.search || filters.is_active)

  return (
    <>
      <PageHeader title={copy.title} description={copy.description} actions={<Button onClick={() => setForm({ product: null })}>+ New product</Button>} />

      <Toolbar>
        <SearchInput value={filters.search} onChange={(value) => setFilter('search', value)} placeholder="Search name or SKU" />
        <Select className="sm:w-40" value={filters.is_active ?? ''} onChange={(event) => setFilter('is_active', event.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </Select>
        <Select className="sm:w-48" value={filters.sort ?? ''} onChange={(event) => setFilter('sort', event.target.value)} aria-label="Sort">
          <option value="">Newest first</option>
          <option value="name">Name A–Z</option>
          <option value="price">Price: low to high</option>
          <option value="-price">Price: high to low</option>
        </Select>
      </Toolbar>

      <DataTable
        columns={columns}
        rows={products.data?.data}
        rowKey={(product) => product.id}
        isLoading={products.isLoading}
        error={products.error}
        onRetry={() => products.refetch()}
        empty={{
          title: filtered ? 'No products match your filters' : 'No products yet',
          description: scope === 'owner' ? 'Create a product to sell it in your shop and share it with other shops.' : 'Add the first product to the shared catalog.',
          action: <Button onClick={() => setForm({ product: null })}>+ New product</Button>,
        }}
      />
      <Pagination meta={products.data?.meta} onPageChange={(next) => setFilter('page', next)} />

      {form && <ProductFormModal scope={scope} product={form.product} onClose={() => setForm(null)} />}
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete product?"
        message={
          <>
            <strong>{deleting?.name}</strong>: {copy.deleteNote}
          </>
        }
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSettled: () => setDeleting(null) })}
      />
    </>
  )
}
