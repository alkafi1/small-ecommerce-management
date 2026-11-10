import { useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { Button } from '@/components/ui/button'
import { env } from '@/config/env'
import { useLogout, useSyncCurrentUser } from '@/features/auth/hooks'
import { cn } from '@/lib/utils/cn'
import { useAuthStore } from '@/stores/auth.store'

export interface NavItem {
  to: string
  label: string
  icon: string
  end?: boolean
}

interface DashboardLayoutProps {
  nav: NavItem[]
  area: string
  /** Extra content at the top of the sidebar (e.g. the owner's shop switcher). */
  sidebarTop?: ReactNode
}

/** Shared shell for the admin and shop owner panels: sidebar + top bar, mobile drawer. */
export function DashboardLayout({ nav, area, sidebarTop }: DashboardLayoutProps) {
  const user = useAuthStore((state) => state.user)
  const logout = useLogout()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const [lastPath, setLastPath] = useState(location.pathname)

  useSyncCurrentUser()

  // Close the mobile drawer after navigating.
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname)
    setMenuOpen(false)
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link to="/" className="flex h-16 items-center gap-2 border-b border-slate-800 px-5 text-lg font-bold text-white">
        <span className="grid size-8 place-items-center rounded-lg bg-brand-500 text-sm">S</span>
        {env.appName}
        <span className="ml-auto rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-slate-300 uppercase">{area}</span>
      </Link>
      {sidebarTop && <div className="border-b border-slate-800 p-4">{sidebarTop}</div>}
      <nav className="flex-1 space-y-1 p-3" aria-label={`${area} navigation`}>
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white')
            }
          >
            <span aria-hidden="true" className="w-5 text-center">
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-800 p-3">
        <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white">
          <span aria-hidden="true" className="w-5 text-center">
            🛍
          </span>
          View storefront
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-slate-900 lg:block">{sidebar}</aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-slate-900/60" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
          <aside className="relative h-full w-72 max-w-[85%] bg-slate-900 shadow-xl">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button type="button" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            ☰
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.role_label}</p>
            </div>
            <div className="grid size-9 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700" aria-hidden="true">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <Button variant="ghost" size="sm" loading={logout.isPending} onClick={() => logout.mutate()}>
              Log out
            </Button>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
