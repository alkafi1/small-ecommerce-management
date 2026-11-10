export type UserRole = 'admin' | 'shop_owner'

export interface User {
  id: number
  name: string
  email: string
  phone: string | null
  role: UserRole
  role_label: string
  is_active: boolean
  shops_count?: number
  created_at: string
}

export interface Shop {
  id: number
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  is_active: boolean
  owner_id: number
  owner?: { id: number; name: string; email: string }
  listings_count?: number
  created_at: string
  updated_at: string
}

export interface Product {
  id: number
  name: string
  slug: string
  sku: string | null
  description: string | null
  base_price: string
  thumbnail_url: string | null
  is_active: boolean
  created_by?: { id: number; name: string; role: UserRole }
  is_mine: boolean
  can: { update: boolean; delete: boolean }
  listings_count?: number
  already_listed?: boolean
  created_at: string
  updated_at: string
}

export interface Listing {
  id: number
  shop_id: number
  product_id: number
  price: string
  name: string
  description: string | null
  thumbnail_url: string | null
  is_visible: boolean
  overrides: { name: string | null; description: string | null; thumbnail_url: string | null }
  product: {
    id: number
    name: string
    sku: string | null
    description: string | null
    base_price: string
    thumbnail_url: string | null
    is_active: boolean
  }
  created_at: string
  updated_at: string
}

export interface OwnerOption {
  id: number
  name: string
  email: string
}

export interface StorefrontShop {
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  products_count?: number
}

export interface StorefrontProduct {
  id: number
  name: string
  description: string | null
  price: string
  thumbnail_url: string | null
  sku: string | null
  shop?: { name: string; slug: string }
}
