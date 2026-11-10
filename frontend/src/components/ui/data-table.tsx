import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { Skeleton } from './skeleton'
import { EmptyState, ErrorState } from './states'

export interface Column<T> {
  key: string
  header: string
  cell: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[] | undefined
  rowKey: (row: T) => string | number
  isLoading: boolean
  error?: unknown
  onRetry?: () => void
  empty: { title: string; description?: string; action?: ReactNode }
}

/** Table with built-in loading, error and empty states. Scrolls sideways on small screens. */
export function DataTable<T>({ columns, rows, rowKey, isLoading, error, onRetry, empty }: DataTableProps<T>) {
  if (error) return <ErrorState error={error} onRetry={onRetry} />
  if (!isLoading && rows?.length === 0) return <EmptyState {...empty} />

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className={cn('px-4 py-3 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-slate-500 uppercase', column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading
              ? Array.from({ length: 5 }, (_, i) => (
                  <tr key={i}>
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-3">
                        <Skeleton className="h-5 w-full max-w-40" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows?.map((row) => (
                  <tr key={rowKey(row)} className="hover:bg-slate-50/60">
                    {columns.map((column) => (
                      <td key={column.key} className={cn('px-4 py-3 align-middle text-slate-700', column.className)}>
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
