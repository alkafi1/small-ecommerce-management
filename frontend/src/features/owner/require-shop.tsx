import type { ReactNode } from 'react'
import { FullPageLoader } from '@/components/feedback/full-page-loader'
import { EmptyState, ErrorState } from '@/components/ui/states'
import type { Shop } from '@/types/models'
import { useCurrentShop } from './current-shop'

/** Renders children with the owner's current shop, or a friendly state when there is none. */
export function RequireShop({ children }: { children: (shop: Shop) => ReactNode }) {
  const { shop, isLoading, error, refetch } = useCurrentShop()

  if (isLoading) return <FullPageLoader label="Loading your shops…" />
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />
  if (!shop) return <EmptyState title="You do not have a shop yet" description="An administrator needs to create a shop and assign it to your account." />

  return <>{children(shop)}</>
}
