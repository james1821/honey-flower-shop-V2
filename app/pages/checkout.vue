<template>
  <div class="checkout-page">
    <div class="container checkout-inner">
      <div class="checkout-left">
        <h1 class="checkout-title">Checkout</h1>

        <!-- Recipient -->
        <div class="checkout-section card">
          <div class="card-header"><h3>Recipient Details</h3></div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:16px">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Recipient Name *</label>
                <input v-model="form.recipientName" class="form-input" placeholder="Full name" />
              </div>
              <div class="form-group">
                <label class="form-label">Recipient Phone</label>
                <input v-model="form.recipientPhone" class="form-input" placeholder="+63 9xx xxx xxxx" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Gift Message</label>
              <textarea v-model="form.giftMessage" class="form-textarea" placeholder="Personal message for the card…"></textarea>
            </div>
          </div>
        </div>

        <!-- Delivery -->
        <div class="checkout-section card">
          <div class="card-header"><h3>Delivery Method</h3></div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
            <div class="delivery-opts">
              <button
                v-for="opt in deliveryOptions" :key="opt.id"
                class="delivery-opt" :class="{ active: form.deliveryOptionId === opt.id }"
                @click="selectDelivery(opt)"
              >
                <span>{{ opt.type === 'standard' ? '🚚' : '🏪' }}</span>
                <div class="dopt-info">
                  <strong>{{ opt.name }}</strong>
                  <span>{{ opt.estimated_days }} · {{ opt.price === 0 ? 'Free' : fmt(opt.price) }}</span>
                </div>
              </button>
            </div>

            <template v-if="form.deliveryType === 'standard'">
              <div class="form-group">
                <label class="form-label">Delivery Date *</label>
                <input v-model="form.deliveryDate" type="date" class="form-input" :min="minDate" />
              </div>
              <div class="form-group">
                <label class="form-label">Address Line 1 *</label>
                <input v-model="form.deliveryAddress.line1" class="form-input" placeholder="House no., street name" />
              </div>
              <div class="form-group">
                <label class="form-label">Address Line 2</label>
                <input v-model="form.deliveryAddress.line2" class="form-input" placeholder="Barangay, subdivision" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">City / Municipality *</label>
                  <input v-model="form.deliveryAddress.city" class="form-input" placeholder="City" />
                </div>
                <div class="form-group">
                  <label class="form-label">Province *</label>
                  <input v-model="form.deliveryAddress.province" class="form-input" placeholder="Province" />
                </div>
              </div>
              <div class="form-group" style="max-width:200px">
                <label class="form-label">Postal Code</label>
                <input v-model="form.deliveryAddress.postal_code" class="form-input" placeholder="0000" />
              </div>
            </template>

            <template v-if="form.deliveryType === 'pickup'">
              <div class="form-group">
                <label class="form-label">Pickup By (Name) *</label>
                <input v-model="form.pickupName" class="form-input" placeholder="Full name of person picking up" />
              </div>
              <div class="pickup-info">
                <p>📍 <strong>Store Address:</strong> Latorma Street, San Isidro, Lupao, Nueva Ecija</p>
                <p>🕐 <strong>Hours:</strong> Mon–Sat 8am–6pm, Sun 12pm–4pm</p>
              </div>
            </template>
          </div>
        </div>

        <!-- Notes -->
        <div class="checkout-section card">
          <div class="card-header"><h3>Additional Notes</h3></div>
          <div class="card-body">
            <textarea v-model="form.notes" class="form-textarea" placeholder="Any special instructions…"></textarea>
          </div>
        </div>
      </div>

      <!-- Right: Order Summary -->
      <div class="checkout-right">
        <div class="card order-summary">
          <div class="card-header"><h3>Order Summary</h3></div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
            <!-- Items -->
            <div class="oi-list">
              <div v-for="(item, i) in cart.items" :key="i" class="oi">
                <img :src="item.product.images[0]" :alt="item.product.name" class="oi-img" />
                <div class="oi-meta">
                  <p class="oi-name">{{ item.product.name }}</p>
                  <p v-if="item.variant" class="oi-sub">{{ item.variant.name }}</p>
                  <p v-if="item.moneyAmount" class="oi-money">+ {{ fmt(item.moneyAmount) }} cash</p>
                  <p class="oi-sub">×{{ item.quantity }}</p>
                </div>
                <span class="oi-price">{{ fmt(((item.product.sale_price ?? item.product.base_price) + (item.variant?.price_modifier ?? 0) + (item.moneyAmount ?? 0)) * item.quantity) }}</span>
              </div>
            </div>

            <hr>

            <!-- Promo -->
            <div class="promo-row">
              <input v-model="promoInput" class="form-input" placeholder="Promo code" style="flex:1" @keyup.enter="applyPromo" />
              <button class="btn btn-secondary btn-sm" :disabled="applyingPromo" @click="applyPromo">
                <span v-if="applyingPromo" class="spinner"></span>
                <span v-else>Apply</span>
              </button>
            </div>
            <p v-if="promoMsg" :class="promoValid ? 'form-hint' : 'form-error'" style="color:var(--success)">{{ promoMsg }}</p>

            <div class="sum-lines">
              <div class="sl"><span>Products</span><span>{{ fmt(cart.productSubtotal) }}</span></div>
              <div v-if="cart.cashTotal" class="sl gold"><span>Cash in bouquets</span><span>{{ fmt(cart.cashTotal) }}</span></div>
              <div v-if="deliveryFee" class="sl"><span>Delivery</span><span>{{ fmt(deliveryFee) }}</span></div>
              <div v-if="discount" class="sl green"><span>Discount ({{ form.promoCode }})</span><span>−{{ fmt(discount) }}</span></div>
              <hr>
              <div class="sl total"><span>Total</span><span>{{ fmt(orderTotal) }}</span></div>
            </div>

            <button class="btn btn-primary btn-lg" style="width:100%" :disabled="!canSubmit || placing" @click="place">
              <span v-if="placing" class="spinner"></span>
              <span v-else>Place Order</span>
            </button>
            <p class="secure-note">🔒 Your payment details are never stored</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DeliveryOption, CheckoutForm } from '~/types'

const { getDeliveryOptions } = useProducts()
const { placeOrder, validatePromo } = useOrders()
const cart = useCartStore()
const { fmt } = useCurrency()
const { success, error } = useToast()

const { data: opts } = await useAsyncData('checkout-delivery', () => getDeliveryOptions().then(r => r.data))
const deliveryOptions = computed<DeliveryOption[]>(() => opts.value ?? [])

const form = reactive<CheckoutForm>({
  recipientName: '', recipientPhone: '', giftMessage: '',
  deliveryType: 'standard', deliveryOptionId: '',
  deliveryDate: '', deliveryAddress: { line1: '', line2: '', city: '', province: '', postal_code: '', country: 'PH' },
  pickupName: '', promoCode: '', notes: '',
})

const promoInput = ref('')
const promoMsg = ref('')
const promoValid = ref(false)
const discount = ref(0)
const applyingPromo = ref(false)
const placing = ref(false)

const minDate = computed(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0] })

const deliveryFee = computed(() => {
  if (!form.deliveryOptionId) return 0
  return deliveryOptions.value.find(d => d.id === form.deliveryOptionId)?.price ?? 0
})

const orderTotal = computed(() => cart.productSubtotal + cart.cashTotal + deliveryFee.value - discount.value)

const canSubmit = computed(() => {
  if (!cart.items.length) return false
  if (!form.recipientName) return false
  if (!form.deliveryOptionId) return false
  if (form.deliveryType === 'standard' && (!form.deliveryAddress.line1 || !form.deliveryAddress.city)) return false
  if (form.deliveryType === 'pickup' && !form.pickupName) return false
  return true
})

function selectDelivery(opt: DeliveryOption) {
  form.deliveryOptionId = opt.id
  form.deliveryType = opt.type
}

async function applyPromo() {
  if (!promoInput.value) return
  applyingPromo.value = true
  const res = await validatePromo(promoInput.value, orderTotal.value)
  applyingPromo.value = false
  promoValid.value = res.valid
  promoMsg.value = res.message
  if (res.valid) {
    discount.value = res.discount
    form.promoCode = promoInput.value.toUpperCase()
    success(res.message)
  }
}

async function place() {
  if (!canSubmit.value) return
  placing.value = true
  const { data: order, error: err } = await placeOrder(form, discount.value)
  placing.value = false
  if (err || !order) { error(err ?? 'Something went wrong'); return }
  success('Order placed! 🎉')
  navigateTo(`/order-confirmation?order=${order.order_number}`)
}

// Init delivery option
onMounted(() => {
  if (deliveryOptions.value.length) selectDelivery(deliveryOptions.value[0])
})
</script>

<style scoped>
.checkout-page { padding:48px 0 80px; }
.checkout-inner { display:grid; grid-template-columns:1fr 400px; gap:40px; align-items:flex-start; }
@media(max-width:900px){ .checkout-inner{ grid-template-columns:1fr; } }
.checkout-title { font-size:clamp(28px,4vw,40px); margin-bottom:28px; }
.checkout-section { margin-bottom:20px; }
.checkout-left { display:flex; flex-direction:column; }
.delivery-opts { display:flex; flex-direction:column; gap:8px; }
.delivery-opt {
  display:flex; gap:14px; align-items:center; padding:14px 16px;
  border:1.5px solid var(--border); border-radius:var(--radius-md);
  background:#fff; cursor:pointer; transition:all var(--t); text-align:left; width:100%;
  font-size:22px;
}
.delivery-opt:hover, .delivery-opt.active { border-color:var(--green); background:var(--green-pale); }
.dopt-info { flex:1; display:flex; flex-direction:column; }
.dopt-info strong { font-size:14px; font-weight:600; }
.dopt-info span { font-size:13px; color:var(--gray); }
.pickup-info { background:var(--cream); border-radius:var(--radius-md); padding:14px 16px; }
.pickup-info p { font-size:14px; color:var(--gray); margin-bottom:4px; }
.order-summary { position:sticky; top:calc(var(--nav-h) + 24px); }
.oi-list { display:flex; flex-direction:column; gap:10px; }
.oi { display:flex; gap:12px; align-items:flex-start; }
.oi-img { width:52px; height:52px; object-fit:cover; border-radius:var(--radius-sm); flex-shrink:0; }
.oi-meta { flex:1; }
.oi-name  { font-size:14px; font-weight:500; }
.oi-sub   { font-size:12px; color:var(--gray); }
.oi-money { font-size:12px; color:var(--gold); font-weight:600; }
.oi-price { font-size:14px; font-weight:600; color:var(--green); white-space:nowrap; }
.promo-row { display:flex; gap:8px; }
.sum-lines { display:flex; flex-direction:column; gap:8px; }
.sl { display:flex; justify-content:space-between; font-size:14px; color:var(--gray); }
.sl.gold   { color:var(--gold); font-weight:600; }
.sl.green  { color:var(--success); font-weight:600; }
.sl.total  { font-size:18px; font-weight:700; color:var(--charcoal); }
.secure-note { text-align:center; font-size:12px; color:var(--gray-light); }
</style>
