import type { ReactNode } from 'react'
import { normalizeError } from '@/lib/http/errors'
import { Button } from './button'

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div className="mb-3 grid size-12 place-items-center rounded-full bg-slate-100 text-2xl" aria-hidden="true">
        📦
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ error, onRetry, title = 'Could not load this data' }: { error: unknown; onRetry?: () => void; title?: string }) {
  const apiError = normalizeError(error)

  return (
    <div role="alert" className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center">
      <div className="mb-3 grid size-12 place-items-center rounded-full bg-red-100 text-xl" aria-hidden="true">
        ⚠️
      </div>
      <h3 className="text-base font-semibold text-red-900">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-red-700">{apiError.message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
