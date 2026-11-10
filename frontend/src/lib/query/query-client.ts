import { MutationCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError } from '@/lib/http/errors'

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError
    mutationMeta: {
      /** Set by forms that show errors themselves (field errors + their own toast). */
      handlesErrors?: boolean
    }
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Client errors (4xx) will not fix themselves; retry only network/5xx failures.
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false
        return failureCount < 2
      },
    },
  },
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      if (mutation.meta?.handlesErrors) return
      if (error.status === 401) return // handled by the session redirect
      toast.error(error.message)
    },
  }),
})
