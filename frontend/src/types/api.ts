/** Success envelope returned by every API endpoint. */
export interface ApiResponse<T> {
  success: true
  message: string
  data: T
  meta?: Record<string, unknown>
}

export interface PaginationMeta {
  current_page: number
  per_page: number
  total: number
  last_page: number
  from: number | null
  to: number | null
}

export interface Paginated<T, M = object> {
  data: T[]
  meta: PaginationMeta & M
}

/** Error envelope returned by the Laravel exception renderer. */
export interface ApiErrorBody {
  success: false
  message: string
  error_code: string
  errors?: Record<string, string[]>
}

/** Common list query parameters. */
export interface ListParams {
  page?: number
  per_page?: number
  search?: string
  sort?: string
  [key: string]: string | number | boolean | undefined
}
