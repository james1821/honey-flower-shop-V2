// Product Types
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

 category?: Category
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






export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: 'customer' | 'admin'
  created_at: string
  updated_at: string
}


export interface DeliveryOption {
  id: string
  name: string
  type: DeliveryType
  description: string
  price: number
  estimated_days: string
  is_active: boolean
}


export interface Address {
  line1: string
  line2: string
  city: string
  province: string
  postal_code: string
  country: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id: string | null
  quantity: number
  unit_price: number
  money_amount: number | null
  subtotal: number
  product_snapshot: { name: string; images: string[]; type: ProductType; variant_name?: string }
}

export interface Order {
  id: string
  order_number: string
  customer_id: string | null
  customer?: { full_name: string | null; email: string }
  subtotal: number
  delivery_fee: number
  discount_amount: number
  total: number
  cash_in_order: number
  delivery_option_id: string | null
  delivery_option?: { name: string }
  delivery_date: string | null
  delivery_address: Address | null
  pickup_name: string | null
  recipient_name: string
  recipient_phone: string | null
  gift_message: string | null
  promo_code: string | null
  notes: string | null
  status: OrderStatus
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export interface PromoCode {
  id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  valid_from: string | null
  valid_until: string | null
  max_uses: number | null
  uses_count: number
  min_order_amount: number | null
  is_active: boolean
  created_at: string
}

export interface CheckoutForm {
  recipientName: string
  recipientPhone: string
  giftMessage: string
  deliveryType: DeliveryType
  deliveryOptionId: string
  deliveryDate: string
  deliveryAddress: Address
  pickupName: string
  promoCode: string
  notes: string
}

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  pendingOrders: number
  totalCustomers: number
  revenueChange: number
  ordersChange: number
  recentOrders: Order[]
  revenueByDay: { date: string; revenue: number }[]
}

export interface CartItem {
  product: Product
  variant?: ProductVariant
  quantity: number
  deliveryOptionId?: string
  deliveryOption?: DeliveryOption
  deliveryDate?: string
  giftMessage?: string
  recipientName?: string
  recipientPhone?: string
 
  moneyAmount?: number
}

