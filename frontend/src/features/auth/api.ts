import { request } from '@/lib/http/client'
import type { User } from '@/types/models'

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResult {
  token: string
  token_type: 'Bearer'
  user: User
}

export const authApi = {
  login: (payload: LoginPayload) => request<LoginResult>({ method: 'POST', url: '/auth/login', data: { ...payload, device_name: 'web' } }),
  me: () => request<User>({ url: '/auth/me' }),
  logout: () => request<null>({ method: 'POST', url: '/auth/logout' }),
}
