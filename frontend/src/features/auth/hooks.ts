import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth.store'
import { authApi } from './api'

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: authApi.login,
    meta: { handlesErrors: true },
    onSuccess: ({ token, user }) => setSession(token, user),
  })
}

export function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authApi.logout,
    meta: { handlesErrors: true },
    // Sign out locally even if the server call fails (e.g. token already revoked).
    onSettled: () => {
      clearSession()
      queryClient.clear()
      navigate('/login', { replace: true })
      toast.success('You have been logged out.')
    },
  })
}

/** Refreshes the stored user from the server, e.g. after an admin changed the account. */
export function useSyncCurrentUser() {
  const token = useAuthStore((state) => state.token)
  const setUser = useAuthStore((state) => state.setUser)

  const query = useQuery({ queryKey: ['auth', 'me', token], queryFn: authApi.me, enabled: Boolean(token), staleTime: 5 * 60_000 })

  useEffect(() => {
    if (query.data) setUser(query.data)
  }, [query.data, setUser])
}
