import { defineStore } from 'pinia'
import type { CartItem, Product, ProductVariant, DeliveryOption } from '~/types'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const isOpen = ref(false)

  const itemCount = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))

  const productSubtotal = computed(() =>
    items.value.reduce((s, item) => {
      const base = item.product.sale_price ?? item.product.base_price
      const variant = item.variant?.price_modifier ?? 0
      return s + (base + variant) * item.quantity
    }, 0)
  )

  const cashTotal = computed(() =>
    items.value.reduce((s, item) => s + (item.moneyAmount ?? 0) * item.quantity, 0)
  )

  const deliveryTotal = computed(() =>
    items.value.reduce((s, item) => s + (item.deliveryOption?.price ?? 0), 0)
  )

  const grandTotal = computed(() => productSubtotal.value + cashTotal.value + deliveryTotal.value)

  function addItem(
    product: Product,
    qty = 1,
    opts?: {
      variant?: ProductVariant
      deliveryOption?: DeliveryOption
      deliveryDate?: string
      giftMessage?: string
      recipientName?: string
      recipientPhone?: string
      moneyAmount?: number
    }
  ) {
    const key = `${product.id}::${opts?.variant?.id ?? ''}::${opts?.moneyAmount ?? ''}`
    const existing = items.value.find(
      (i) => `${i.product.id}::${i.variant?.id ?? ''}::${i.moneyAmount ?? ''}` === key
    )
    if (existing) {
      existing.quantity += qty
      if (opts?.deliveryOption !== undefined) existing.deliveryOption = opts.deliveryOption
    } else {
      items.value.push({
        product, quantity: qty,
        variant: opts?.variant,
        deliveryOption: opts?.deliveryOption,
        deliveryDate: opts?.deliveryDate,
        giftMessage: opts?.giftMessage,
        recipientName: opts?.recipientName,
        recipientPhone: opts?.recipientPhone,
        moneyAmount: opts?.moneyAmount,
      })
    }
    isOpen.value = true
  }

  function removeItem(productId: string, variantId?: string, moneyAmount?: number) {
    items.value = items.value.filter(
      (i) => !(i.product.id === productId && (i.variant?.id ?? '') === (variantId ?? '') && (i.moneyAmount ?? 0) === (moneyAmount ?? 0))
    )
  }

  function updateQty(productId: string, variantId: string | undefined, moneyAmount: number | undefined, qty: number) {
    const item = items.value.find(
      (i) => i.product.id === productId && (i.variant?.id ?? '') === (variantId ?? '') && (i.moneyAmount ?? 0) === (moneyAmount ?? 0)
    )
    if (!item) return
    if (qty <= 0) removeItem(productId, variantId, moneyAmount)
    else item.quantity = qty
  }

  function clear() { items.value = [] }

  return { items, isOpen, itemCount, productSubtotal, cashTotal, deliveryTotal, grandTotal, addItem, removeItem, updateQty, clear }
}, { persist: true })
