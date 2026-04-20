import type { Order, CheckoutForm } from '~/types'
import { useCartStore } from '~/stores/cart'

export function useOrders() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const cart = useCartStore()

  async function validatePromo(code: string, orderTotal: number) {
    const { data, error } = await supabase.from('promo_codes').select('*').eq('code', code.toUpperCase()).eq('is_active', true).maybeSingle()
    if (error || !data) return { valid: false, discount: 0, message: 'Invalid promo code' }
    if (data.valid_until && new Date(data.valid_until) < new Date()) return { valid: false, discount: 0, message: 'Code has expired' }
    if (data.max_uses && data.uses_count >= data.max_uses) return { valid: false, discount: 0, message: 'Code usage limit reached' }
    if (data.min_order_amount && orderTotal < data.min_order_amount) return { valid: false, discount: 0, message: `Min order ₱${data.min_order_amount} required` }
    const discount = data.discount_type === 'percentage' ? (orderTotal * data.discount_value) / 100 : data.discount_value
    const label = data.discount_type === 'percentage' ? `${data.discount_value}%` : `₱${data.discount_value}`
    return { valid: true, discount, message: `${label} discount applied!`, promo: data }
  }

  async function placeOrder(form: CheckoutForm, discountAmount = 0) {
    if (!cart.items.length) return { data: null, error: 'Cart is empty' }

    const cashInOrder = cart.cashTotal
    const deliveryFee = cart.deliveryTotal
    const subtotal = cart.productSubtotal
    const total = subtotal + cashInOrder + deliveryFee - discountAmount

    const { data: order, error: oErr } = await supabase.from('orders').insert({
      customer_id: user.value?.id ?? null,
      subtotal, delivery_fee: deliveryFee, discount_amount: discountAmount,
      total, cash_in_order: cashInOrder,
      delivery_option_id: form.deliveryOptionId || null,
      delivery_date: form.deliveryDate || null,
      delivery_address: form.deliveryType === 'standard' ? form.deliveryAddress : null,
      pickup_name: form.deliveryType === 'pickup' ? form.pickupName : null,
      recipient_name: form.recipientName,
      recipient_phone: form.recipientPhone || null,
      gift_message: form.giftMessage || null,
      promo_code: form.promoCode || null,
      notes: form.notes || null,
    }).select().maybeSingle()

    if (oErr || !order) return { data: null, error: oErr?.message ?? 'Order creation failed' }

    const orderItems = cart.items.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
      variant_id: item.variant?.id ?? null,
      quantity: item.quantity,
      unit_price: (item.product.sale_price ?? item.product.base_price) + (item.variant?.price_modifier ?? 0),
      money_amount: item.moneyAmount ?? null,
      subtotal: ((item.product.sale_price ?? item.product.base_price) + (item.variant?.price_modifier ?? 0)) * item.quantity + (item.moneyAmount ?? 0) * item.quantity,
      product_snapshot: { name: item.product.name, images: item.product.images, type: item.product.type, variant_name: item.variant?.name },
    }))

    const { error: iErr } = await supabase.from('order_items').insert(orderItems)
    if (iErr) return { data: null, error: iErr.message }

    if (form.promoCode) {
      await supabase.rpc('increment_promo_uses', { promo_code_val: form.promoCode.toUpperCase() })
    }

    cart.clear()
    return { data: order as Order, error: null }
  }

  async function getMyOrders() {
    const { data, error } = await supabase.from('orders')
      .select('*, items:order_items(*), delivery_option:delivery_options(*)')
      .eq('customer_id', user.value?.id ?? '').order('created_at', { ascending: false })
    return { data: data as Order[] | null, error }
  }

  return { placeOrder, validatePromo, getMyOrders }
}
