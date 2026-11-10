import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { User, UserRole } from '@/types/models'

interface AuthState {
  token: string | null
  user: User | null
  /** One-time message for the login page (e.g. "session expired"). */
  notice: string | null
  setSession: (token: string, user: User) => void
  setUser: (user: User) => void
  clearSession: (notice?: string) => void
  consumeNotice: () => string | null
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      notice: null,
      setSession: (token, user) => set({ token, user, notice: null }),
      setUser: (user) => set({ user }),
      clearSession: (notice) => set({ token: null, user: null, notice: notice ?? null }),
      consumeNotice: () => {
        const notice = get().notice
        if (notice) set({ notice: null })
        return notice
      },
    }),
    {
      name: 'shophub-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ token, user }) => ({ token, user }),
    },
  ),
)

/** Where each role lands after login. */
export const HOME_BY_ROLE: Record<UserRole, string> = {
  admin: '/admin',
  shop_owner: '/owner',
}
