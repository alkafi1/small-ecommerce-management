import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ListParams } from '@/types/api'
import { shopOwnerKeys, shopOwnersApi, type ShopOwnerPayload } from './api'

export function useShopOwners(params: ListParams) {
  return useQuery({ queryKey: shopOwnerKeys.list(params), queryFn: () => shopOwnersApi.list(params), placeholderData: keepPreviousData })
}

export function useShopOwnerOptions() {
  return useQuery({ queryKey: shopOwnerKeys.options(), queryFn: shopOwnersApi.options })
}

function useInvalidateOwners() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: shopOwnerKeys.all })
    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
  }
}

export function useSaveShopOwner(id?: number) {
  const invalidate = useInvalidateOwners()
  return useMutation({
    mutationFn: (payload: ShopOwnerPayload) => (id ? shopOwnersApi.update(id, payload) : shopOwnersApi.create(payload)),
    meta: { handlesErrors: true },
    onSuccess: ({ message }) => {
      invalidate()
      toast.success(message)
    },
  })
}

export function useSetShopOwnerStatus() {
  const invalidate = useInvalidateOwners()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => shopOwnersApi.setStatus(id, isActive),
    onSuccess: ({ message }) => {
      invalidate()
      toast.success(message)
    },
  })
}

export function useDeleteShopOwner() {
  const invalidate = useInvalidateOwners()
  return useMutation({
    mutationFn: shopOwnersApi.remove,
    onSuccess: ({ message }) => {
      invalidate()
      toast.success(message)
    },
  })
}
