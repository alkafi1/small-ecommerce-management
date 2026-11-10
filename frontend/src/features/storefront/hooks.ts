import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { ListParams } from '@/types/api'
import { storefrontApi, storefrontKeys } from './api'

export const useStorefrontShops = (params: ListParams) =>
  useQuery({ queryKey: storefrontKeys.shops(params), queryFn: () => storefrontApi.shops(params), placeholderData: keepPreviousData })

export const useStorefrontShop = (slug: string) => useQuery({ queryKey: storefrontKeys.shop(slug), queryFn: () => storefrontApi.shop(slug) })

export const useStorefrontProducts = (slug: string, params: ListParams) =>
  useQuery({ queryKey: storefrontKeys.products(slug, params), queryFn: () => storefrontApi.products(slug, params), placeholderData: keepPreviousData })

export const useStorefrontProduct = (slug: string, id: number) =>
  useQuery({ queryKey: storefrontKeys.product(slug, id), queryFn: () => storefrontApi.product(slug, id), enabled: Number.isFinite(id) })
