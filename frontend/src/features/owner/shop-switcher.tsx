import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentShop, useSelectedShopStore } from './current-shop'

export function ShopSwitcher() {
  const { shop, shops, isLoading } = useCurrentShop()
  const setShopId = useSelectedShopStore((state) => state.setShopId)

  if (isLoading) return <Skeleton className="h-10 w-full bg-slate-800" />
  if (!shop) return <p className="text-xs text-slate-400">No shop assigned yet.</p>

  return (
    <div>
      <label htmlFor="shop-switcher" className="mb-1.5 block text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
        Working on shop
      </label>
      <select
        id="shop-switcher"
        value={shop.id}
        onChange={(event) => setShopId(Number(event.target.value))}
        className="block h-10 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-white focus:border-brand-500 focus:outline-none"
      >
        {shops.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
            {item.is_active ? '' : ' (inactive)'}
          </option>
        ))}
      </select>
    </div>
  )
}
