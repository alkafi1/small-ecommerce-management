import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'

/**
 * List filters kept in the URL query string, so a filtered page can be
 * refreshed, bookmarked or shared. Changing any filter resets to page 1.
 */
export function useUrlFilters<K extends string>(keys: readonly K[]) {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(() => {
    const values = {} as Record<K | 'page', string | undefined>
    for (const key of keys) values[key] = searchParams.get(key) ?? undefined
    values.page = searchParams.get('page') ?? undefined
    return values
  }, [searchParams, keys])

  const setFilter = useCallback(
    (key: K | 'page', value: string | number | undefined | null) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (value === undefined || value === null || value === '') next.delete(key)
          else next.set(key, String(value))
          if (key !== 'page') next.delete('page')
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const page = Number(filters.page ?? 1) || 1

  return { filters, page, setFilter }
}
