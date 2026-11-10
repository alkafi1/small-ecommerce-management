import type { PaginationMeta } from '@/types/api'
import { Button } from './button'

export function Pagination({ meta, onPageChange }: { meta?: PaginationMeta; onPageChange: (page: number) => void }) {
  if (!meta || meta.last_page <= 1) return null

  return (
    <nav className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row" aria-label="Pagination">
      <p className="text-sm text-slate-500">
        Showing <span className="font-medium text-slate-700">{meta.from}</span>–<span className="font-medium text-slate-700">{meta.to}</span> of{' '}
        <span className="font-medium text-slate-700">{meta.total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" disabled={meta.current_page <= 1} onClick={() => onPageChange(meta.current_page - 1)}>
          ← Previous
        </Button>
        <span className="text-sm text-slate-600">
          Page {meta.current_page} of {meta.last_page}
        </span>
        <Button variant="secondary" size="sm" disabled={meta.current_page >= meta.last_page} onClick={() => onPageChange(meta.current_page + 1)}>
          Next →
        </Button>
      </div>
    </nav>
  )
}
