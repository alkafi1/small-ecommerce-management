import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ListParams } from '@/types/api'
import { adminShopKeys, adminShopsApi, type ShopPayload } from './api'

export function useAdminShops(params: ListParams) {
  return useQuery({ queryKey: adminShopKeys.list(params), queryFn: () => adminShopsApi.list(params), placeholderData: keepPreviousData })
}

export function useAdminShopListings(id: number, params: ListParams) {
  return useQuery({ queryKey: adminShopKeys.listings(id, params), queryFn: () => adminShopsApi.listings(id, params), placeholderData: keepPreviousData })
}

function useInvalidateShops() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: adminShopKeys.all })
    queryClient.invalidateQueries({ queryKey: ['admin', 'shop-owners'] })
    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
  }
}

export function useSaveShop(id?: number) {
  const invalidate = useInvalidateShops()
  return useMutation({
    mutationFn: (payload: ShopPayload) => (id ? adminShopsApi.update(id, payload) : adminShopsApi.create(payload)),
    meta: { handlesErrors: true },
    onSuccess: ({ message }) => {
      invalidate()
      toast.success(message)
    },
  })
}

export function useDeleteShop() {
  const invalidate = useInvalidateShops()
  return useMutation({
    mutationFn: adminShopsApi.remove,
    onSuccess: ({ message }) => {
      invalidate()
      toast.success(message)
    },
  })
}
