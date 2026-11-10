import { useEffect, useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { Input } from './form-controls'

/** Search box that reports its value after the user stops typing. */
export function SearchInput({ value, onChange, placeholder = 'Search…' }: { value?: string; onChange: (value: string) => void; placeholder?: string }) {
  const [text, setText] = useState(value ?? '')
  const debounced = useDebouncedValue(text)

  useEffect(() => {
    if (debounced !== (value ?? '')) onChange(debounced)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  return (
    <div className="relative w-full sm:max-w-xs">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400" aria-hidden="true">
        ⌕
      </span>
      <Input type="search" value={text} onChange={(event) => setText(event.target.value)} placeholder={placeholder} className="pl-8" aria-label={placeholder} />
    </div>
  )
}
