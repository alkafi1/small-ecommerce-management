import { isRouteErrorResponse, useRouteError } from 'react-router'
import { ApiError } from '@/lib/http/errors'
import { ForbiddenPage, NotFoundPage, StatusPage } from './status-page'

/** Router errorElement: catches render crashes and failed lazy imports anywhere below it. */
export function RouteError() {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />
  if (error instanceof ApiError && error.status === 404) return <NotFoundPage />
  if (error instanceof ApiError && error.status === 403) return <ForbiddenPage />

  if (import.meta.env.DEV) console.error(error)

  return (
    <StatusPage
      code="Error"
      title="Something went wrong"
      message="An unexpected error occurred while showing this page. Please try again."
      action={
        <button type="button" onClick={() => window.location.reload()} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Reload page
        </button>
      }
    />
  )
}
