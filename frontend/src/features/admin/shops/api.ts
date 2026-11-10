import { cleanParams, request, requestPaginated, requestWithMessage } from '@/lib/http/client'
import { toFormData } from '@/lib/http/form-data'
import type { ListParams } from '@/types/api'
import type { Listing, Shop } from '@/types/models'

export interface ShopPayload {
  owner_id: number
  name: string
  description: string | null
  is_active: boolean
  logo: File | null
  remove_logo: boolean
}

const base = '/admin/shops'

export const adminShopsApi = {
  list: (params: ListParams) => requestPaginated<Shop>({ url: base, params: cleanParams(params) }),
  get: (id: number) => request<Shop>({ url: `${base}/${id}` }),
  create: (payload: ShopPayload) => requestWithMessage<Shop>({ method: 'POST', url: base, data: toFormData({ ...payload }) }),
  update: (id: number, payload: ShopPayload) => requestWithMessage<Shop>({ method: 'POST', url: `${base}/${id}`, data: toFormData({ ...payload }, 'PUT') }),
  remove: (id: number) => requestWithMessage<null>({ method: 'DELETE', url: `${base}/${id}` }),
  listings: (id: number, params: ListParams) => requestPaginated<Listing>({ url: `${base}/${id}/listings`, params: cleanParams(params) }),
}

export const adminShopKeys = {
  all: ['admin', 'shops'] as const,
  list: (params: ListParams) => [...adminShopKeys.all, 'list', params] as const,
  listings: (id: number, params: ListParams) => [...adminShopKeys.all, id, 'listings', params] as const,
}
