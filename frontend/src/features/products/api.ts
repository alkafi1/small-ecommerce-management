import { cleanParams, requestPaginated, requestWithMessage } from '@/lib/http/client'
import { toFormData } from '@/lib/http/form-data'
import type { ListParams } from '@/types/api'
import type { Product } from '@/types/models'

/** Admins manage the whole catalog; owners manage the products they created. Same contract. */
export type ProductScope = 'admin' | 'owner'

export interface ProductPayload {
  name: string
  sku: string | null
  description: string | null
  base_price: string
  is_active: boolean
  thumbnail: File | null
  remove_thumbnail: boolean
}

const base = (scope: ProductScope) => `/${scope}/products`

export const productsApi = {
  list: (scope: ProductScope, params: ListParams) => requestPaginated<Product>({ url: base(scope), params: cleanParams(params) }),
  create: (scope: ProductScope, payload: ProductPayload) => requestWithMessage<Product>({ method: 'POST', url: base(scope), data: toFormData({ ...payload }) }),
  update: (scope: ProductScope, id: number, payload: ProductPayload) =>
    requestWithMessage<Product>({ method: 'POST', url: `${base(scope)}/${id}`, data: toFormData({ ...payload }, 'PUT') }),
  remove: (scope: ProductScope, id: number) => requestWithMessage<null>({ method: 'DELETE', url: `${base(scope)}/${id}` }),
}

export const productKeys = {
  all: ['products'] as const,
  list: (scope: ProductScope, params: ListParams) => [...productKeys.all, scope, 'list', params] as const,
}
