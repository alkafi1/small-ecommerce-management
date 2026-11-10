import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Select } from '@/components/ui/form-controls'
import { PageHeader, Toolbar } from '@/components/ui/page-header'
import { Pagination } from '@/components/ui/pagination'
import { SearchInput } from '@/components/ui/search-input'
import { Switch } from '@/components/ui/switch'
import { useUrlFilters } from '@/hooks/use-url-filters'
import { formatDate } from '@/lib/utils/format'
import type { User } from '@/types/models'
import { useDeleteShopOwner, useSetShopOwnerStatus, useShopOwners } from './hooks'
import { ShopOwnerFormModal } from './shop-owner-form-modal'

const FILTER_KEYS = ['search', 'is_active'] as const

export function ShopOwnersPage() {
  const { filters, page, setFilter } = useUrlFilters(FILTER_KEYS)
  const owners = useShopOwners({ ...filters, page })
  const setStatus = useSetShopOwnerStatus()
  const remove = useDeleteShopOwner()

  const [editing, setEditing] = useState<User | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<User | null>(null)

  const openForm = (owner: User | null) => {
    setEditing(owner)
    setFormOpen(true)
  }

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Owner',
      cell: (owner) => (
        <div>
          <p className="font-medium text-slate-900">{owner.name}</p>
          <p className="text-xs text-slate-500">{owner.email}</p>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone', cell: (owner) => owner.phone ?? '—' },
    { key: 'shops', header: 'Shops', cell: (owner) => owner.shops_count ?? 0 },
    {
      key: 'status',
      header: 'Active',
      cell: (owner) => (
        <Switch
          checked={owner.is_active}
          label={`${owner.name} active`}
          disabled={setStatus.isPending && setStatus.variables?.id === owner.id}
          onChange={(isActive) => setStatus.mutate({ id: owner.id, isActive })}
        />
      ),
    },
    { key: 'created', header: 'Joined', cell: (owner) => formatDate(owner.created_at) },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (owner) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => openForm(owner)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => setDeleting(owner)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Shop owners" description="Accounts that manage shops and their product listings." actions={<Button onClick={() => openForm(null)}>+ New owner</Button>} />

      <Toolbar>
        <SearchInput value={filters.search} onChange={(value) => setFilter('search', value)} placeholder="Search name or email" />
        <Select className="sm:w-44" value={filters.is_active ?? ''} onChange={(event) => setFilter('is_active', event.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </Select>
      </Toolbar>

      <DataTable
        columns={columns}
        rows={owners.data?.data}
        rowKey={(owner) => owner.id}
        isLoading={owners.isLoading}
        error={owners.error}
        onRetry={() => owners.refetch()}
        empty={{
          title: filters.search || filters.is_active ? 'No owners match your filters' : 'No shop owners yet',
          description: 'Create an owner account, then assign a shop to it.',
          action: <Button onClick={() => openForm(null)}>+ New owner</Button>,
        }}
      />
      <Pagination meta={owners.data?.meta} onPageChange={(next) => setFilter('page', next)} />

      {formOpen && <ShopOwnerFormModal open owner={editing} onClose={() => setFormOpen(false)} />}
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete shop owner?"
        message={
          <>
            <strong>{deleting?.name}</strong> will no longer be able to sign in. Owners who still own shops cannot be deleted. Reassign or delete their shops first.
          </>
        }
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSettled: () => setDeleting(null) })}
      />
    </>
  )
}
