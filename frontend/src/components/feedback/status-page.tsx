import type { ReactNode } from 'react'
import { Link } from 'react-router'

interface StatusPageProps {
  code: string
  title: string
  message: string
  action?: ReactNode
}

export function StatusPage({ code, title, message, action }: StatusPageProps) {
  return (
    <div className="grid min-h-[70vh] place-items-center px-4">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold tracking-widest text-brand-600">{code}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-3 text-slate-500">{message}</p>
        <div className="mt-8 flex justify-center gap-3">
          {action ?? (
            <Link to="/" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
              Go to home page
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export function NotFoundPage() {
  return <StatusPage code="404" title="Page not found" message="The page you are looking for does not exist or has been moved." />
}

export function ForbiddenPage() {
  return <StatusPage code="403" title="Access denied" message="Your account does not have permission to open this page." />
}
