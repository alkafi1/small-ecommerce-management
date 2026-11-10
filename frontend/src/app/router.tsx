import { createBrowserRouter, Navigate } from 'react-router'
import { FullPageLoader } from '@/components/feedback/full-page-loader'
import { RouteError } from '@/components/feedback/route-error'
import { NotFoundPage } from '@/components/feedback/status-page'
import { DashboardLayout, type NavItem } from '@/components/layout/dashboard-layout'
import { StorefrontLayout } from '@/components/layout/storefront-layout'
import { ShopSwitcher } from '@/features/owner/shop-switcher'
import { GuestOnly, RequireRole } from '@/routes/guards'

const adminNav: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: '▦', end: true },
  { to: '/admin/shop-owners', label: 'Shop owners', icon: '👤' },
  { to: '/admin/shops', label: 'Shops', icon: '🏬' },
  { to: '/admin/products', label: 'Products', icon: '📦' },
]

const ownerNav: NavItem[] = [
  { to: '/owner', label: 'Dashboard', icon: '▦', end: true },
  { to: '/owner/listings', label: 'My shop products', icon: '🏷' },
  { to: '/owner/catalog', label: 'Shared catalog', icon: '🗂' },
  { to: '/owner/products', label: 'My created products', icon: '📦' },
]

/** Pages are lazy-loaded so each area only downloads its own code. */
export const router = createBrowserRouter([
  {
    errorElement: <RouteError />,
    hydrateFallbackElement: <FullPageLoader />,
    children: [
      {
        element: <StorefrontLayout />,
        children: [
          { index: true, lazy: async () => ({ Component: (await import('@/features/storefront/home-page')).StorefrontHomePage }) },
          { path: 'shops/:slug', lazy: async () => ({ Component: (await import('@/features/storefront/shop-page')).StorefrontShopPage }) },
          { path: 'shops/:slug/products/:productId', lazy: async () => ({ Component: (await import('@/features/storefront/product-page')).StorefrontProductPage }) },
        ],
      },
      {
        element: <GuestOnly />,
        children: [{ path: 'login', lazy: async () => ({ Component: (await import('@/features/auth/login-page')).LoginPage }) }],
      },
      {
        path: 'admin',
        element: <RequireRole roles={['admin']} />,
        children: [
          {
            element: <DashboardLayout nav={adminNav} area="Admin" />,
            children: [
              { index: true, lazy: async () => ({ Component: (await import('@/features/admin/dashboard/dashboard-page')).AdminDashboardPage }) },
              { path: 'shop-owners', lazy: async () => ({ Component: (await import('@/features/admin/shop-owners/shop-owners-page')).ShopOwnersPage }) },
              { path: 'shops', lazy: async () => ({ Component: (await import('@/features/admin/shops/shops-page')).ShopsPage }) },
              {
                path: 'products',
                lazy: async () => {
                  const { ProductsPage } = await import('@/features/products/products-page')
                  return { Component: () => <ProductsPage scope="admin" /> }
                },
              },
            ],
          },
        ],
      },
      {
        path: 'owner',
        element: <RequireRole roles={['shop_owner']} />,
        children: [
          {
            element: <DashboardLayout nav={ownerNav} area="Seller" sidebarTop={<ShopSwitcher />} />,
            children: [
              { index: true, lazy: async () => ({ Component: (await import('@/features/owner/owner-dashboard-page')).OwnerDashboardPage }) },
              { path: 'listings', lazy: async () => ({ Component: (await import('@/features/owner/listings-page')).ListingsPage }) },
              { path: 'catalog', lazy: async () => ({ Component: (await import('@/features/owner/catalog-page')).CatalogPage }) },
              {
                path: 'products',
                lazy: async () => {
                  const { ProductsPage } = await import('@/features/products/products-page')
                  return { Component: () => <ProductsPage scope="owner" /> }
                },
              },
            ],
          },
        ],
      },
      { path: 'dashboard', element: <Navigate to="/login" replace /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
