const apiUrl = import.meta.env.VITE_API_URL as string | undefined

if (!apiUrl) {
  throw new Error('VITE_API_URL is not set. Copy frontend/.env.example to frontend/.env and set it.')
}

export const env = {
  apiUrl: apiUrl.replace(/\/+$/, ''),
  appName: 'ShopHub',
} as const
