export type ProductType = 'flowers' | 'money_bouquet' | 'chocolate_bundle' | 'handmade_flower' | 'others'
export type DeliveryType = 'standard' | 'pickup'
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: 'customer' | 'admin'
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  type: ProductType
  category_id: string | null
  base_price: number
  sale_price: number | null
  images: string[]
  is_active: boolean
  is_featured: boolean
  stock_qty: number
  delivery_types: DeliveryType[]
  tags: string[]

  money_min_amount: number | null   
  money_max_amount: number | null   
  money_step: number | null         
  
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  
 categories?: Category
  variants?: ProductVariant[]
}


export interface ProductVariant {
  id: string
  product_id: string
  name: string
  price_modifier: number
  description: string | null
  is_active: boolean
}