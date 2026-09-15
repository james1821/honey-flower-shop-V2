import type { Order, OrderItem, CheckoutForm } from '~/types'
import { useCartStore } from '~/stores/cart'
import type { Transaction } from 'firebase/firestore'
import {
  collection, query, where, orderBy, getDocs, doc, runTransaction,
  serverTimestamp, increment,
} from 'firebase/firestore'
import { docToOrder } from '~/utils/firestore-mappers'

export function useOrders() {
  const db = useFirestore()
  const user = useCurrentUser()
  const cart = useCartStore()

  async function validatePromo(code: string, orderTotal: number) {
    try {
      const q = query(collection(db, 'promo_codes'), where('code', '==', code.toUpperCase()), where('is_active', '==', true))
      const snap = await getDocs(q)
      if (snap.empty) return { valid: false, discount: 0, message: 'Invalid promo code' }
      const firstDoc = snap.docs[0]!
      const data = firstDoc.data()

      if (data.valid_until && new Date(data.valid_until) < new Date()) return { valid: false, discount: 0, message: 'Code has expired' }
      if (data.max_uses && data.uses_count >= data.max_uses) return { valid: false, discount: 0, message: 'Code usage limit reached' }
      if (data.min_order_amount && orderTotal < data.min_order_amount) return { valid: false, discount: 0, message: `Min order ₱${data.min_order_amount} required` }

      const discount = data.discount_type === 'percentage' ? (orderTotal * data.discount_value) / 100 : data.discount_value
      const label = data.discount_type === 'percentage' ? `${data.discount_value}%` : `₱${data.discount_value}`
      return { valid: true, discount, message: `${label} discount applied!`, promo: { id: firstDoc.id, ...data } }
    } catch (error: any) {
      return { valid: false, discount: 0, message: error?.message ?? 'Could not validate code' }
    }
  }

  // Firestore has no auto-increment column, so order numbers come from an atomic counter
  // document (counters/orders) bumped inside the same transaction that writes the order.
  async function nextOrderNumber(tx: Transaction): Promise<string> {
    const counterRef = doc(db, 'counters', 'orders')
    const counterSnap = await tx.get(counterRef)
    const next = (counterSnap.exists() ? counterSnap.data().value : 0) + 1
    tx.set(counterRef, { value: next }, { merge: true })
    return `HB-${String(next).padStart(5, '0')}`
  }

  async function placeOrder(form: CheckoutForm, discountAmount = 0) {
    if (!cart.items.length) return { data: null, error: 'Cart is empty' }

    const cashInOrder = cart.cashTotal
    const deliveryFee = cart.deliveryTotal
    const subtotal = cart.productSubtotal
    const total = subtotal + cashInOrder + deliveryFee - discountAmount

    const deliveryOption = form.deliveryOptionId
      ? cart.items.find(i => i.deliveryOption?.id === form.deliveryOptionId)?.deliveryOption
      : undefined

    const items: OrderItem[] = cart.items.map((item, idx) => ({
      id: String(idx),
      order_id: '',
      product_id: item.product.id,
      variant_id: item.variant?.id ?? null,
      quantity: item.quantity,
      unit_price: (item.product.sale_price ?? item.product.base_price) + (item.variant?.price_modifier ?? 0),
      money_amount: item.moneyAmount ?? null,
      subtotal: ((item.product.sale_price ?? item.product.base_price) + (item.variant?.price_modifier ?? 0)) * item.quantity + (item.moneyAmount ?? 0) * item.quantity,
      product_snapshot: { name: item.product.name, images: item.product.images, type: item.product.type, variant_name: item.variant?.name },
    }))

    try {
      const orderRef = doc(collection(db, 'orders'))
      const orderNumber = await runTransaction(db, async (tx) => {
        const num = await nextOrderNumber(tx)

        if (form.promoCode) {
          const promoQ = query(collection(db, 'promo_codes'), where('code', '==', form.promoCode.toUpperCase()))
          const promoSnap = await getDocs(promoQ)
          const firstPromo = promoSnap.docs[0]
          if (firstPromo) {
            tx.update(doc(db, 'promo_codes', firstPromo.id), { uses_count: increment(1) })
          }
        }

        tx.set(orderRef, {
          order_number: num,
          customer_id: user.value?.uid ?? null,
          customer: user.value ? { full_name: user.value.displayName ?? null, email: user.value.email ?? '' } : null,
          subtotal, delivery_fee: deliveryFee, discount_amount: discountAmount,
          total, cash_in_order: cashInOrder,
          delivery_option_id: form.deliveryOptionId || null,
          delivery_option: deliveryOption ? { name: deliveryOption.name } : null,
          delivery_date: form.deliveryDate || null,
          delivery_address: form.deliveryType === 'standard' ? form.deliveryAddress : null,
          pickup_name: form.deliveryType === 'pickup' ? form.pickupName : null,
          recipient_name: form.recipientName,
          recipient_phone: form.recipientPhone || null,
          gift_message: form.giftMessage || null,
          promo_code: form.promoCode || null,
          notes: form.notes || null,
          status: 'pending',
          items: items.map(i => ({ ...i, order_id: orderRef.id })),
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        })

        return num
      })

      cart.clear()
      const order: Order = {
        id: orderRef.id, order_number: orderNumber, customer_id: user.value?.uid ?? null,
        subtotal, delivery_fee: deliveryFee, discount_amount: discountAmount, total, cash_in_order: cashInOrder,
        delivery_option_id: form.deliveryOptionId || null, delivery_option: deliveryOption ? { name: deliveryOption.name } : undefined,
        delivery_date: form.deliveryDate || null,
        delivery_address: form.deliveryType === 'standard' ? form.deliveryAddress : null,
        pickup_name: form.deliveryType === 'pickup' ? form.pickupName : null,
        recipient_name: form.recipientName, recipient_phone: form.recipientPhone || null,
        gift_message: form.giftMessage || null, promo_code: form.promoCode || null, notes: form.notes || null,
        status: 'pending', items: items.map(i => ({ ...i, order_id: orderRef.id })),
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }
      return { data: order, error: null }
    } catch (error: any) {
      return { data: null, error: error?.message ?? 'Order creation failed' }
    }
  }

  async function getMyOrders() {
    if (!user.value) return { data: [], error: null }
    try {
      const q = query(collection(db, 'orders'), where('customer_id', '==', user.value.uid), orderBy('created_at', 'desc'))
      const snap = await getDocs(q)
      return { data: snap.docs.map(docToOrder), error: null }
    } catch (error: any) {
      return { data: null, error: error?.message ?? String(error) }
    }
  }

  return { placeOrder, validatePromo, getMyOrders }
}
