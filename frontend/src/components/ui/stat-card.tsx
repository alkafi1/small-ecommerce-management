import { Skeleton } from './skeleton'

export function StatCard({ label, value, hint, loading }: { label: string; value?: number; hint?: string; loading?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      {loading ? <Skeleton className="mt-2 h-8 w-16" /> : <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{value ?? 0}</p>}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}
