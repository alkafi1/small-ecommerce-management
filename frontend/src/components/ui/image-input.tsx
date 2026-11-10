import { useEffect, useMemo, useRef } from 'react'
import { toast } from 'sonner'
import { Button } from './button'
import { Thumbnail } from './thumbnail'

interface ImageInputProps {
  /** Image already saved on the server. */
  currentUrl?: string | null
  file: File | null
  onFileChange: (file: File | null) => void
  removed?: boolean
  onRemove?: () => void
  /** Text under the preview, e.g. "Using the catalog image". */
  fallbackHint?: string
  invalid?: boolean
  id?: string
}

const MAX_BYTES = 2 * 1024 * 1024
const ACCEPT = 'image/jpeg,image/png,image/webp'

export function ImageInput({ currentUrl, file, onFileChange, removed, onRemove, fallbackHint, invalid, id }: ImageInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  useEffect(() => () => void (previewUrl && URL.revokeObjectURL(previewUrl)), [previewUrl])

  const shown = previewUrl ?? (removed ? null : currentUrl)

  return (
    <div className="flex items-start gap-4">
      <Thumbnail src={shown} alt="Image preview" className={`size-24 shrink-0 rounded-lg border ${invalid ? 'border-red-400' : 'border-slate-200'}`} />
      <div className="space-y-2">
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(event) => {
            const picked = event.target.files?.[0] ?? null
            event.target.value = ''
            if (picked && picked.size > MAX_BYTES) {
              onFileChange(null)
              toast.error('This image is larger than 2 MB. Please choose a smaller file.')
              return
            }
            onFileChange(picked)
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
            {shown ? 'Change image' : 'Upload image'}
          </Button>
          {file && (
            <Button variant="ghost" size="sm" onClick={() => onFileChange(null)}>
              Undo
            </Button>
          )}
          {!file && currentUrl && !removed && onRemove && (
            <Button variant="ghost" size="sm" className="text-red-600" onClick={onRemove}>
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-slate-500">JPG, PNG or WEBP, up to 2 MB.</p>
        {!shown && fallbackHint && <p className="text-xs text-brand-700">{fallbackHint}</p>}
      </div>
    </div>
  )
}
