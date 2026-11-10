import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

/** Image with a neutral placeholder when there is no URL or it fails to load. */
export function Thumbnail({ src, alt, className }: { src: string | null | undefined; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className={cn('grid place-items-center bg-linear-to-br from-slate-100 to-slate-200 text-slate-400', className)} role="img" aria-label={alt}>
        <svg viewBox="0 0 24 24" className="size-1/3 max-w-10" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      </div>
    )
  }

  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={cn('object-cover', className)} />
}
