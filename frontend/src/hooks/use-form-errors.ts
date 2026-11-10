import { useCallback } from 'react'
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import { normalizeError } from '@/lib/http/errors'

/**
 * Maps a server error onto a react-hook-form instance:
 * - 422 field errors appear under their inputs (fields the form does not
 *   render are shown in a toast instead, so no message is ever lost)
 * - anything else becomes a toast with the server's friendly message
 */
export function useFormErrors<T extends FieldValues>(form: UseFormReturn<T>, fieldMap: Record<string, Path<T>> = {}) {
  return useCallback(
    (error: unknown) => {
      const apiError = normalizeError(error)

      if (!apiError.isValidation) {
        if (apiError.status !== 401) toast.error(apiError.message)
        return
      }

      const known = new Set(Object.keys(form.getValues()))
      const unmatched: string[] = []
      let focused = false

      for (const [serverField, message] of Object.entries(apiError.fieldErrors)) {
        const field = (fieldMap[serverField] ?? serverField) as Path<T>
        if (known.has(field)) {
          form.setError(field, { type: 'server', message }, { shouldFocus: !focused })
          focused = true
        } else {
          unmatched.push(message)
        }
      }

      if (unmatched.length) toast.error(unmatched.join(' '))
    },
    [form, fieldMap],
  )
}
