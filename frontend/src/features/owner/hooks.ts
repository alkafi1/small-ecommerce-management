import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ListParams } from '@/types/api'
import { ownerApi, ownerKeys, type ListingPayload } from './api'

export function useOwnerStats() {
  return useQuery({ queryKey: ownerKeys.dashboard(), queryFn: ownerApi.dashboard })
}

export function useCatalog(shopId: number, params: ListParams) {
  return useQuery({ queryKey: ownerKeys.catalog(shopId, params), queryFn: () => ownerApi.catalog(shopId, params), placeholderData: keepPreviousData })
}

export function useListings(shopId: number, params: ListParams) {
  return useQuery({ queryKey: ownerKeys.listings(shopId, params), queryFn: () => ownerApi.listings(shopId, params), placeholderData: keepPreviousData })
}

/** A listing change affects the shop's listings, catalog "already listed" flags and counts. */
function useInvalidateListings() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ownerKeys.all })
    queryClient.invalidateQueries({ queryKey: ['products'] })
  }
}

export function useSaveListing(shopId: number, listingId?: number) {
  const invalidate = useInvalidateListings()
  return useMutation({
    mutationFn: (payload: ListingPayload) => (listingId ? ownerApi.updateListing(shopId, listingId, payload) : ownerApi.createListing(shopId, payload)),
    meta: { handlesErrors: true },
    onSuccess: ({ message }) => {
      invalidate()
      toast.success(message)
    },
  })
}

export function useSetListingVisibility(shopId: number) {
  const invalidate = useInvalidateListings()
  return useMutation({
    mutationFn: ({ id, isVisible }: { id: number; isVisible: boolean }) => ownerApi.setVisibility(shopId, id, isVisible),
    onSuccess: ({ message }) => {
      invalidate()
      toast.success(message)
    },
  })
}

export function useRemoveListing(shopId: number) {
  const invalidate = useInvalidateListings()
  return useMutation({
    mutationFn: (id: number) => ownerApi.removeListing(shopId, id),
    onSuccess: ({ message }) => {
      invalidate()
      toast.success(message)
    },
  })
}
