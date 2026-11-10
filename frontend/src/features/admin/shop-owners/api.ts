import { cleanParams, request, requestPaginated, requestWithMessage } from '@/lib/http/client'
import type { ListParams } from '@/types/api'
import type { OwnerOption, User } from '@/types/models'

export interface ShopOwnerPayload {
  name: string
  email: string
  phone?: string | null
  password?: string
  password_confirmation?: string
  is_active: boolean
}

const base = '/admin/shop-owners'

export const shopOwnersApi = {
  list: (params: ListParams) => requestPaginated<User>({ url: base, params: cleanParams(params) }),
  options: () => request<OwnerOption[]>({ url: `${base}/options` }),
  create: (payload: ShopOwnerPayload) => requestWithMessage<User>({ method: 'POST', url: base, data: payload }),
  update: (id: number, payload: ShopOwnerPayload) => requestWithMessage<User>({ method: 'PUT', url: `${base}/${id}`, data: payload }),
  setStatus: (id: number, isActive: boolean) => requestWithMessage<User>({ method: 'PATCH', url: `${base}/${id}/status`, data: { is_active: isActive } }),
  remove: (id: number) => requestWithMessage<null>({ method: 'DELETE', url: `${base}/${id}` }),
}

export const shopOwnerKeys = {
  all: ['admin', 'shop-owners'] as const,
  list: (params: ListParams) => [...shopOwnerKeys.all, 'list', params] as const,
  options: () => [...shopOwnerKeys.all, 'options'] as const,
}
