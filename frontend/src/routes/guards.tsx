import { Navigate, Outlet, useLocation } from 'react-router'
import { ForbiddenPage } from '@/components/feedback/status-page'
import { HOME_BY_ROLE, useAuthStore } from '@/stores/auth.store'
import type { UserRole } from '@/types/models'

/** Signed-in users with one of the given roles only. Others go to /login or see 403. */
export function RequireRole({ roles }: { roles: UserRole[] }) {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const location = useLocation()

  if (!token || !user) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  if (!roles.includes(user.role)) return <ForbiddenPage />

  return <Outlet />
}

/** Login page: a signed-in user is sent to their dashboard instead. */
export function GuestOnly() {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)

  if (token && user) return <Navigate to={HOME_BY_ROLE[user.role]} replace />

  return <Outlet />
}
