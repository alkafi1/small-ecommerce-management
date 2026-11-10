import axios, { type AxiosRequestConfig } from 'axios'
import { env } from '@/config/env'
import { useAuthStore } from '@/stores/auth.store'
import type { ApiResponse, Paginated, PaginationMeta } from '@/types/api'
import { normalizeError } from './errors'

export const http = axios.create({
  baseURL: env.apiUrl,
  timeout: 20_000,
  headers: { Accept: 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = normalizeError(error)

    // A token that the server no longer accepts: end the session; guards redirect to /login.
    if (apiError.status === 401 && useAuthStore.getState().token) {
      useAuthStore.getState().clearSession('Your session has expired. Please log in again.')
    }

    return Promise.reject(apiError)
  },
)

/** GET/POST/... and return only `data` from the envelope. */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await http.request<ApiResponse<T>>(config)
  return response.data.data
}

/** Same as request() but also returns the server's success message. */
export async function requestWithMessage<T>(config: AxiosRequestConfig): Promise<{ data: T; message: string }> {
  const response = await http.request<ApiResponse<T>>(config)
  return { data: response.data.data, message: response.data.message }
}

export async function requestPaginated<T, M = object>(config: AxiosRequestConfig): Promise<Paginated<T, M>> {
  const response = await http.request<ApiResponse<T[]>>(config)
  return { data: response.data.data, meta: response.data.meta as PaginationMeta & M }
}

/** Drops empty values so URLs stay clean (`?search=` is never sent). */
export function cleanParams(params: object = {}): Record<string, unknown> {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''))
}
