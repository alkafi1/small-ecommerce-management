import { useQuery } from '@tanstack/react-query'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { ownerApi, ownerKeys } from './api'

interface SelectedShopState {
  shopId: number | null
  setShopId: (id: number) => void
}

/** The shop the owner is working on, remembered between visits. */
export const useSelectedShopStore = create<SelectedShopState>()(
  persist((set) => ({ shopId: null, setShopId: (shopId) => set({ shopId }) }), {
    name: 'shophub-owner-shop',
    storage: createJSONStorage(() => localStorage),
  }),
)

export function useOwnerShops() {
  return useQuery({ queryKey: ownerKeys.shops(), queryFn: ownerApi.shops })
}

/** Current shop = the remembered one if the owner still owns it, else their first shop. */
export function useCurrentShop() {
  const shops = useOwnerShops()
  const shopId = useSelectedShopStore((state) => state.shopId)
  const list = shops.data?.data ?? []
  const shop = list.find((item) => item.id === shopId) ?? list[0] ?? null

  return { shop, shops: list, isLoading: shops.isLoading, error: shops.error, refetch: shops.refetch }
}
