import axios from 'axios'
import type { ApiErrorBody } from '@/types/api'

export type FieldErrors = Record<string, string>

/**
 * The one error shape the UI ever deals with. Every failure (network, timeout,
 * 4xx, 5xx, unexpected) is turned into an ApiError by normalizeError().
 */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fieldErrors: FieldErrors

  constructor(message: string, status: number, code: string, fieldErrors: FieldErrors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }

  get isValidation() {
    return this.status === 422 && Object.keys(this.fieldErrors).length > 0
  }

  get isNetwork() {
    return this.status === 0
  }
}

const FALLBACK_MESSAGES: Record<number, string> = {
  400: 'The request was not valid.',
  401: 'Please log in to continue.',
  403: 'You do not have permission to do this.',
  404: 'We could not find what you were looking for.',
  409: 'This action conflicts with the current data.',
  413: 'The uploaded file is too large.',
  419: 'Your session has expired. Please refresh the page.',
  422: 'Please check the form and try again.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our side. Please try again.',
  503: 'The service is temporarily unavailable. Please try again soon.',
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === 'object' && value !== null && 'message' in value
}

/** Flattens Laravel's { field: [messages] } into { field: firstMessage }. */
function flattenFieldErrors(errors?: Record<string, string[]>): FieldErrors {
  if (!errors) return {}
  return Object.fromEntries(Object.entries(errors).map(([field, messages]) => [field, messages[0] ?? 'Invalid value.']))
}

export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return new ApiError('The server took too long to respond. Please try again.', 0, 'TIMEOUT')
    }

    if (!error.response) {
      return new ApiError('Cannot reach the server. Check your connection and try again.', 0, 'NETWORK_ERROR')
    }

    const { status, data } = error.response

    if (isApiErrorBody(data)) {
      return new ApiError(
        data.message || FALLBACK_MESSAGES[status] || 'Request failed.',
        status,
        data.error_code ?? `HTTP_${status}`,
        flattenFieldErrors(data.errors),
      )
    }

    return new ApiError(FALLBACK_MESSAGES[status] ?? 'Request failed.', status, `HTTP_${status}`)
  }

  return new ApiError('An unexpected error occurred.', -1, 'UNKNOWN')
}
