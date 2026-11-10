import { Link, Outlet } from 'react-router'
import { env } from '@/config/env'
import { HOME_BY_ROLE, useAuthStore } from '@/stores/auth.store'

const YEAR = new Date().getFullYear()

export function StorefrontLayout() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <span className="grid size-8 place-items-center rounded-lg bg-brand-600 text-sm text-white">S</span>
            {env.appName}
          </Link>
          <nav className="ml-auto flex items-center gap-2 text-sm">
            <Link to="/" className="rounded-lg px-3 py-2 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
              Shops
            </Link>
            {user ? (
              <Link to={HOME_BY_ROLE[user.role]} className="rounded-lg bg-slate-900 px-3 py-2 font-medium text-white hover:bg-slate-700">
                Dashboard
              </Link>
            ) : (
              <Link to="/login" className="rounded-lg border border-slate-300 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">
                Seller login
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
        © {YEAR} {env.appName}. A multi-shop e-commerce demo.
      </footer>
    </div>
  )
}
