import { cleanParams, request, requestPaginated } from '@/lib/http/client'
import type { ListParams } from '@/types/api'
import type { StorefrontProduct, StorefrontShop } from '@/types/models'

export const storefrontApi = {
  shops: (params: ListParams) => requestPaginated<StorefrontShop>({ url: '/storefront/shops', params: cleanParams(params) }),
  shop: (slug: string) => request<StorefrontShop>({ url: `/storefront/shops/${encodeURIComponent(slug)}` }),
  products: (slug: string, params: ListParams) =>
    requestPaginated<StorefrontProduct, { shop: StorefrontShop }>({ url: `/storefront/shops/${encodeURIComponent(slug)}/products`, params: cleanParams(params) }),
  product: (slug: string, id: number) => request<StorefrontProduct>({ url: `/storefront/shops/${encodeURIComponent(slug)}/products/${id}` }),
}

export const storefrontKeys = {
  all: ['storefront'] as const,
  shops: (params: ListParams) => [...storefrontKeys.all, 'shops', params] as const,
  shop: (slug: string) => [...storefrontKeys.all, 'shop', slug] as const,
  products: (slug: string, params: ListParams) => [...storefrontKeys.all, 'products', slug, params] as const,
  product: (slug: string, id: number) => [...storefrontKeys.all, 'product', slug, id] as const,
}
