import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ListParams } from '@/types/api'
import { productKeys, productsApi, type ProductPayload, type ProductScope } from './api'

export function useProducts(scope: ProductScope, params: ListParams) {
  return useQuery({ queryKey: productKeys.list(scope, params), queryFn: () => productsApi.list(scope, params), placeholderData: keepPreviousData })
}

/** Catalog changes affect product lists, the owner catalog and listings everywhere. */
function useInvalidateCatalog() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: productKeys.all })
    queryClient.invalidateQueries({ queryKey: ['owner'] })
    queryClient.invalidateQueries({ queryKey: ['admin'] })
  }
}

export function useSaveProduct(scope: ProductScope, id?: number) {
  const invalidate = useInvalidateCatalog()
  return useMutation({
    mutationFn: (payload: ProductPayload) => (id ? productsApi.update(scope, id, payload) : productsApi.create(scope, payload)),
    meta: { handlesErrors: true },
    onSuccess: ({ message }) => {
      invalidate()
      toast.success(message)
    },
  })
}

export function useDeleteProduct(scope: ProductScope) {
  const invalidate = useInvalidateCatalog()
  return useMutation({
    mutationFn: (id: number) => productsApi.remove(scope, id),
    onSuccess: ({ message }) => {
      invalidate()
      toast.success(message)
    },
  })
}
