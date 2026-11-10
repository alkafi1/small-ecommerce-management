import { useState } from 'react'
import { StatusBadge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Pagination } from '@/components/ui/pagination'
import { Thumbnail } from '@/components/ui/thumbnail'
import { formatMoney } from '@/lib/utils/format'
import type { Shop } from '@/types/models'
import { useAdminShopListings } from './hooks'

/** Read-only view of everything a shop sells. */
export function ShopListingsModal({ shop, onClose }: { shop: Shop; onClose: () => void }) {
  const [page, setPage] = useState(1)
  const listings = useAdminShopListings(shop.id, { page, per_page: 8 })

  return (
    <Modal open onClose={onClose} title={`${shop.name}: listings`} description="Products this shop sells, with the shop's own price." size="lg">
      <DataTable
        rows={listings.data?.data}
        rowKey={(listing) => listing.id}
        isLoading={listings.isLoading}
        error={listings.error}
        onRetry={() => listings.refetch()}
        empty={{ title: 'This shop has no listings yet', description: 'The shop owner adds products from the shared catalog.' }}
        columns={[
          {
            key: 'product',
            header: 'Product',
            cell: (listing) => (
              <div className="flex items-center gap-3">
                <Thumbnail src={listing.thumbnail_url} alt={listing.name} className="size-10 rounded-md" />
                <span className="font-medium text-slate-900">{listing.name}</span>
              </div>
            ),
          },
          { key: 'price', header: 'Shop price', cell: (listing) => formatMoney(listing.price) },
          { key: 'base', header: 'Catalog price', cell: (listing) => <span className="text-slate-500">{formatMoney(listing.product.base_price)}</span> },
          { key: 'visible', header: 'Visible', cell: (listing) => <StatusBadge active={listing.is_visible} activeLabel="Shown" inactiveLabel="Hidden" /> },
        ]}
      />
      <Pagination meta={listings.data?.meta} onPageChange={setPage} />
    </Modal>
  )
}
