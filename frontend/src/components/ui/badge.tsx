import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

type Tone = 'gray' | 'green' | 'red' | 'amber' | 'brand'

const tones: Record<Tone, string> = {
  gray: 'bg-slate-100 text-slate-700',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  brand: 'bg-brand-50 text-brand-700 ring-brand-600/20',
}

export function Badge({ tone = 'gray', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-transparent ring-inset', tones[tone], className)}>{children}</span>
}

export function StatusBadge({ active, activeLabel = 'Active', inactiveLabel = 'Inactive' }: { active: boolean; activeLabel?: string; inactiveLabel?: string }) {
  return <Badge tone={active ? 'green' : 'gray'}>{active ? activeLabel : inactiveLabel}</Badge>
}
