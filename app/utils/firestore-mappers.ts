// Shared helpers for turning Firestore documents into the app's plain TypeScript types.
// The app's types (see ~/types) model timestamps as ISO strings (that's what Supabase returned),
// so every mapper converts Firestore Timestamps -> ISO strings at the boundary. Nothing above
// this layer needs to know it's talking to Firestore.
import type { DocumentData, DocumentSnapshot, QueryDocumentSnapshot } from 'firebase/firestore'
import { Timestamp } from 'firebase/firestore'
import type { Product, Category, DeliveryOption, Order, PromoCode, Profile } from '~/types'
import type { GalleryItem } from '~/composables/useGallery'
import type { PopupBanner } from '~/composables/usePopup'

export function tsToIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return new Date().toISOString()
}

// Accepts either kind of Firestore snapshot. DocumentSnapshot#data() can return undefined
// (doc might not exist) so every mapper falls back to an empty object — callers that read
// via getDoc() are expected to check `snap.exists()` first regardless.
type AnyDoc = QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>

function dataOf(d: AnyDoc): DocumentData {
  return d.data() ?? {}
}

export function docToProduct(d: AnyDoc): Product {
  const v = dataOf(d)
  return {
    id: d.id,
    name: v.name ?? '',
    slug: v.slug ?? '',
    description: v.description ?? null,
    short_description: v.short_description ?? null,
    type: v.type,
    category_id: v.category_id ?? null,
    base_price: v.base_price ?? 0,
    sale_price: v.sale_price ?? null,
    images: v.images ?? [],
    is_active: v.is_active ?? true,
    is_featured: v.is_featured ?? false,
    stock_qty: v.stock_qty ?? 0,
    delivery_types: v.delivery_types ?? ['standard'],
    tags: v.tags ?? [],
    money_min_amount: v.money_min_amount ?? null,
    money_max_amount: v.money_max_amount ?? null,
    money_step: v.money_step ?? null,
    metadata: v.metadata ?? {},
    created_at: tsToIso(v.created_at),
    updated_at: tsToIso(v.updated_at),
    category: v.category ?? undefined,
    variants: v.variants ?? [],
  } as Product
}

export function docToCategory(d: AnyDoc): Category {
  const v = dataOf(d)
  return {
    id: d.id,
    name: v.name ?? '',
    slug: v.slug ?? '',
    description: v.description ?? null,
    image_url: v.image_url ?? null,
    sort_order: v.sort_order ?? 0,
    is_active: v.is_active ?? true,
    created_at: tsToIso(v.created_at),
  }
}

export function docToDeliveryOption(d: AnyDoc): DeliveryOption {
  const v = dataOf(d)
  return {
    id: d.id,
    name: v.name ?? '',
    type: v.type,
    description: v.description ?? '',
    price: v.price ?? 0,
    estimated_days: v.estimated_days ?? '',
    is_active: v.is_active ?? true,
  }
}

export function docToOrder(d: AnyDoc): Order {
  const v = dataOf(d)
  return {
    id: d.id,
    order_number: v.order_number ?? d.id,
    customer_id: v.customer_id ?? null,
    customer: v.customer ?? undefined,
    subtotal: v.subtotal ?? 0,
    delivery_fee: v.delivery_fee ?? 0,
    discount_amount: v.discount_amount ?? 0,
    total: v.total ?? 0,
    cash_in_order: v.cash_in_order ?? 0,
    delivery_option_id: v.delivery_option_id ?? null,
    delivery_option: v.delivery_option ?? undefined,
    delivery_date: v.delivery_date ?? null,
    delivery_address: v.delivery_address ?? null,
    pickup_name: v.pickup_name ?? null,
    recipient_name: v.recipient_name ?? '',
    recipient_phone: v.recipient_phone ?? null,
    gift_message: v.gift_message ?? null,
    promo_code: v.promo_code ?? null,
    notes: v.notes ?? null,
    status: v.status ?? 'pending',
    items: v.items ?? [],
    created_at: tsToIso(v.created_at),
    updated_at: tsToIso(v.updated_at),
  } as unknown as Order
}

export function docToPromo(d: AnyDoc): PromoCode {
  const v = dataOf(d)
  return {
    id: d.id,
    code: v.code ?? '',
    description: v.description ?? null,
    discount_type: v.discount_type,
    discount_value: v.discount_value ?? 0,
    valid_from: v.valid_from ?? null,
    valid_until: v.valid_until ?? null,
    max_uses: v.max_uses ?? null,
    uses_count: v.uses_count ?? 0,
    min_order_amount: v.min_order_amount ?? null,
    is_active: v.is_active ?? true,
    created_at: tsToIso(v.created_at),
  } as PromoCode
}

export function docToProfile(d: AnyDoc): Profile {
  const v = dataOf(d)
  return {
    id: d.id,
    email: v.email ?? '',
    full_name: v.full_name ?? null,
    phone: v.phone ?? null,
    role: v.role ?? 'customer',
    created_at: tsToIso(v.created_at),
    updated_at: tsToIso(v.updated_at),
  }
}

export function docToGalleryItem(d: AnyDoc): GalleryItem {
  const v = dataOf(d)
  return {
    id: d.id,
    type: v.type ?? 'work',
    image_url: v.image_url ?? '',
    caption: v.caption ?? null,
    customer_name: v.customer_name ?? null,
    rating: v.rating ?? null,
    sort_order: v.sort_order ?? 0,
    is_active: v.is_active ?? true,
    created_at: tsToIso(v.created_at),
  }
}

export function docToPopup(d: AnyDoc): PopupBanner {
  const v = dataOf(d)
  return {
    id: d.id,
    image_url: v.image_url ?? '',
    link_url: v.link_url ?? null,
    is_active: v.is_active ?? false,
    updated_at: tsToIso(v.updated_at),
  }
}
