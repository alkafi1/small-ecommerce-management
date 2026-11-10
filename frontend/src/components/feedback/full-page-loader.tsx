import { Spinner } from '@/components/ui/spinner'

export function FullPageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="grid min-h-[50vh] place-items-center" role="status">
      <div className="flex items-center gap-3 text-slate-500">
        <Spinner className="size-5" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  )
}
