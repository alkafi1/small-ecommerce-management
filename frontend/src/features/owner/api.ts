import { cleanParams, request, requestPaginated, requestWithMessage } from '@/lib/http/client'
import { toFormData } from '@/lib/http/form-data'
import type { ListParams } from '@/types/api'
import type { Listing, Product, Shop } from '@/types/models'

export interface ListingPayload {
  product_id?: number
  price: string
  name: string | null
  description: string | null
  is_visible: boolean
  thumbnail: File | null
  remove_thumbnail: boolean
}

export interface OwnerStats {
  shops: number
  listings: number
  my_products: number
}

const listingsUrl = (shopId: number) => `/owner/shops/${shopId}/listings`

export const ownerApi = {
  dashboard: () => request<OwnerStats>({ url: '/owner/dashboard' }),
  shops: () => requestPaginated<Shop>({ url: '/owner/shops', params: { per_page: 100 } }),
  catalog: (shopId: number, params: ListParams) => requestPaginated<Product>({ url: '/owner/catalog', params: cleanParams({ ...params, shop_id: shopId }) }),

  listings: (shopId: number, params: ListParams) => requestPaginated<Listing>({ url: listingsUrl(shopId), params: cleanParams(params) }),
  createListing: (shopId: number, payload: ListingPayload) => requestWithMessage<Listing>({ method: 'POST', url: listingsUrl(shopId), data: toFormData({ ...payload }) }),
  updateListing: (shopId: number, id: number, payload: ListingPayload) =>
    requestWithMessage<Listing>({ method: 'POST', url: `${listingsUrl(shopId)}/${id}`, data: toFormData({ ...payload }, 'PUT') }),
  setVisibility: (shopId: number, id: number, isVisible: boolean) =>
    requestWithMessage<Listing>({ method: 'PATCH', url: `${listingsUrl(shopId)}/${id}/visibility`, data: { is_visible: isVisible } }),
  removeListing: (shopId: number, id: number) => requestWithMessage<null>({ method: 'DELETE', url: `${listingsUrl(shopId)}/${id}` }),
}

export const ownerKeys = {
  all: ['owner'] as const,
  dashboard: () => [...ownerKeys.all, 'dashboard'] as const,
  shops: () => [...ownerKeys.all, 'shops'] as const,
  catalog: (shopId: number, params: ListParams) => [...ownerKeys.all, 'catalog', shopId, params] as const,
  listings: (shopId: number, params?: ListParams) => [...ownerKeys.all, 'listings', shopId, ...(params ? [params] : [])] as const,
}
