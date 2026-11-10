type FormValue = string | number | boolean | File | null | undefined

/**
 * Builds multipart data for endpoints that accept file uploads.
 * - booleans become "1"/"0" (what Laravel's boolean rule expects)
 * - null/undefined/empty-file values are skipped, except null strings which are
 *   sent as "" so a cleared optional field reaches the server as empty
 * - PUT is sent as POST + _method=PUT, because PHP only parses multipart on POST
 */
export function toFormData(values: Record<string, FormValue>, method: 'POST' | 'PUT' = 'POST'): FormData {
  const data = new FormData()

  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) continue
    if (value instanceof File) data.append(key, value)
    else if (typeof value === 'boolean') data.append(key, value ? '1' : '0')
    else if (value === null) data.append(key, '')
    else data.append(key, String(value))
  }

  if (method === 'PUT') data.append('_method', 'PUT')

  return data
}
