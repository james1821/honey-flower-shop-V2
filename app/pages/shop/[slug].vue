<template>
  <div v-if="product" class="product-page">
    <div class="container product-inner">
   
      <div class="product-gallery">
        <img :src="product.images[activeImg] || ''" :alt="product.name" class="main-img" />
        <div v-if="product.images.length > 1" class="thumbs">
          <button
            v-for="(img, i) in product.images" :key="i"
            class="thumb" :class="{ active: activeImg === i }"
            @click="activeImg = i"
          >
            <img :src="img" :alt="`${product.name} ${i+1}`" />
          </button>
        </div>
      </div>

   
      <div class="product-details">
        <div class="detail-badges">
          <span v-if="product.is_featured" class="badge badge-gold">⭐ Featured</span>
          <span v-if="product.type === 'money_bouquet'" class="badge badge-gold">💵 Money Bouquet</span>
          <span v-if="product.type === 'chocolate_bundle'" class="badge badge-blush">🍫 Chocolate Bundle</span>
          <span v-if="product.type === 'gift_voucher'" class="badge badge-green">🎁 Gift Voucher</span>
          <span v-if="product.sale_price" class="badge badge-error">On Sale</span>
        </div>

        <h1 class="detail-title">{{ product.name }}</h1>
        <p class="detail-desc">{{ product.short_description }}</p>

        <div class="price-block">
          <span v-if="product.sale_price" class="price-old">{{ fmt(product.base_price) }}</span>
          <span class="price-main">{{ fmt(product.sale_price ?? product.base_price) }}</span>
          <span v-if="selectedVariant" class="price-extra">+ {{ fmt(selectedVariant.price_modifier) }} ({{ selectedVariant.name }})</span>
        </div>

     
        <div v-if="product.variants?.length" class="option-group">
          <label class="option-label">Size / Variant</label>
          <div class="variant-chips">
            <button
              v-for="v in product.variants" :key="v.id"
              class="variant-chip"
              :class="{ active: selectedVariant?.id === v.id }"
              @click="selectedVariant = v"
            >
              {{ v.name }}
              <span v-if="v.price_modifier">+{{ fmt(v.price_modifier) }}</span>
            </button>
          </div>
          <p v-if="selectedVariant?.description" class="form-hint">{{ selectedVariant.description }}</p>
        </div>

       
        <ShopMoneyAmountPicker
          v-if="product.type === 'money_bouquet'"
          v-model="moneyAmount"
          :min-amount="product.money_min_amount ?? 500"
          :max-amount="product.money_max_amount ?? 20000"
          :step="product.money_step ?? 500"
          :bouquet-price="effectivePrice"
        />

      
        <div class="option-group">
          <label class="option-label">Delivery Method</label>
          <div class="delivery-opts">
            <button
              v-for="opt in deliveryOptions.filter(d => product!.delivery_types.includes(d.type))"
              :key="opt.id"
              class="delivery-opt"
              :class="{ active: selectedDelivery?.id === opt.id }"
              @click="selectedDelivery = opt"
            >
              <span class="dopt-icon">{{ opt.type === 'standard' ? '🚚' : '🏪' }}</span>
              <div class="dopt-info">
                <strong>{{ opt.name }}</strong>
                <span>{{ opt.estimated_days }} · {{ opt.price === 0 ? 'Free' : fmt(opt.price) }}</span>
              </div>
              <span v-if="selectedDelivery?.id === opt.id" class="dopt-check">✓</span>
            </button>
          </div>
        </div>

        
        <div v-if="selectedDelivery?.type === 'standard'" class="option-group">
          <label class="option-label">Preferred Delivery Date</label>
          <input v-model="deliveryDate" type="date" class="form-input" :min="minDate" />
        </div>

      
        <div class="option-group">
          <label class="option-label">Gift Message <span style="font-weight:400;text-transform:none;color:var(--gray-light)">(optional)</span></label>
          <textarea v-model="giftMessage" class="form-textarea" placeholder="Write a personal message for the recipient…" rows="3"></textarea>
        </div>

       
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Recipient Name</label>
            <input v-model="recipientName" class="form-input" placeholder="Who is this for?" />
          </div>
          <div class="form-group">
            <label class="form-label">Recipient Phone</label>
            <input v-model="recipientPhone" class="form-input" placeholder="+63 9xx xxx xxxx" />
          </div>
        </div>

      
        <div class="qty-row">
          <label class="option-label">Quantity</label>
          <div class="qty-ctrl">
            <button @click="qty = Math.max(1, qty - 1)">−</button>
            <span>{{ qty }}</span>
            <button @click="qty++">+</button>
          </div>
        </div>

       
        <div class="total-bar">
          <div>
            <span class="total-label">Total</span>
            <span class="total-price">{{ fmt(lineTotal) }}</span>
            <span v-if="product.type === 'money_bouquet' && moneyAmount" class="total-note">
              (incl. {{ fmt(moneyAmount) }} cash)
            </span>
          </div>
          <button class="btn btn-primary btn-lg" :disabled="!canAdd" @click="addToCart">
            Add to Cart
          </button>
        </div>

        
        <div v-if="product.description" class="long-desc">
          <h4>About this product</h4>
          <p>{{ product.description }}</p>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="container" style="padding:80px 24px;text-align:center">
    <p>Product not found.</p>
    <NuxtLink to="/shop" class="btn btn-primary" style="margin-top:16px">Back to Shop</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { Product, ProductVariant, DeliveryOption } from '~/types'

const route = useRoute()
const { getProduct, getDeliveryOptions } = useProducts()
const cartStore = useCartStore()
const { fmt } = useCurrency()
const { success, error } = useToast()

const { data: product } = await useAsyncData(`product-${route.params.slug}`, () =>
  getProduct(route.params.slug as string).then(r => r.data)
)
const { data: delivOpts } = await useAsyncData('delivery-opts', () => getDeliveryOptions().then(r => r.data))

const deliveryOptions = computed<DeliveryOption[]>(() => delivOpts.value ?? [])
const activeImg = ref(0)
const selectedVariant = ref<ProductVariant | undefined>(product.value?.variants?.[0])
const selectedDelivery = ref<DeliveryOption | undefined>(deliveryOptions.value[0])
const moneyAmount = ref(product.value?.money_min_amount ?? 500)
const giftMessage = ref('')
const recipientName = ref('')
const recipientPhone = ref('')
const deliveryDate = ref('')
const qty = ref(1)

const minDate = computed(() => {
  const d = new Date(); d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
})

const effectivePrice = computed(() =>
  (product.value?.sale_price ?? product.value?.base_price ?? 0) + (selectedVariant.value?.price_modifier ?? 0)
)

const lineTotal = computed(() => {
  const base = effectivePrice.value
  const cash = product.value?.type === 'money_bouquet' ? (moneyAmount.value ?? 0) : 0
  const delivery = selectedDelivery.value?.price ?? 0
  return (base + cash + delivery) * qty.value
})

const canAdd = computed(() => {
  if (!selectedDelivery.value) return false
  if (product.value?.type === 'money_bouquet' && !moneyAmount.value) return false
  return true
})

function addToCart() {
  if (!product.value || !canAdd.value) return
  cartStore.addItem(product.value, qty.value, {
    variant: selectedVariant.value,
    deliveryOption: selectedDelivery.value,
    deliveryDate: deliveryDate.value || undefined,
    giftMessage: giftMessage.value || undefined,
    recipientName: recipientName.value || undefined,
    recipientPhone: recipientPhone.value || undefined,
    moneyAmount: product.value.type === 'money_bouquet' ? moneyAmount.value : undefined,
  })
  success(`${product.value.name} added to cart!`)
}

// init delivery option
watchEffect(() => {
  if (deliveryOptions.value.length && !selectedDelivery.value) {
    selectedDelivery.value = deliveryOptions.value[0]
  }
})
</script>

<style scoped>
.product-page { padding: 48px 0 80px; }
.product-inner { display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:flex-start; }
@media(max-width:900px){ .product-inner{ grid-template-columns:1fr; gap:32px; } }
.main-img { width:100%; aspect-ratio:1; object-fit:cover; border-radius:var(--radius-xl); box-shadow:var(--shadow-md); }
.thumbs { display:flex; gap:10px; margin-top:12px; }
.thumb { border:2px solid transparent; border-radius:var(--radius-sm); overflow:hidden; width:72px; height:72px; cursor:pointer; transition:border-color var(--t); }
.thumb img { width:100%; height:100%; object-fit:cover; }
.thumb.active { border-color:var(--purple); }
.detail-badges { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:16px; }
.detail-title { font-size:clamp(28px,4vw,40px); margin-bottom:10px; }
.detail-desc { font-size:16px; color:var(--gray); line-height:1.7; margin-bottom:20px; }
.price-block { display:flex; align-items:baseline; gap:10px; margin-bottom:24px; flex-wrap:wrap; }
.price-main { font-size:32px; font-weight:700; color:var(--purple); }
.price-old  { font-size:18px; color:var(--gray-light); text-decoration:line-through; }
.price-extra { font-size:14px; color:var(--gold); font-weight:600; }
.option-group { margin-bottom:20px; display:flex; flex-direction:column; gap:8px; }
.option-label { font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:var(--gray); }
.variant-chips { display:flex; flex-wrap:wrap; gap:8px; }
.variant-chip {
  padding:8px 16px; border-radius:var(--radius-full); border:1.5px solid var(--border);
  background:#fff; font-size:14px; cursor:pointer; transition:all var(--t); display:flex; gap:6px; align-items:center;
}
.variant-chip:hover, .variant-chip.active { border-color:var(--purple); background:var(--purple-pale); color:var(--purple); }
.variant-chip span { font-size:12px; font-weight:600; }
.delivery-opts { display:flex; flex-direction:column; gap:8px; }
.delivery-opt {
  display:flex; align-items:center; gap:14px; padding:14px 16px;
  border:1.5px solid var(--border); border-radius:var(--radius-md);
  background:#fff; cursor:pointer; transition:all var(--t); text-align:left; width:100%;
}
.delivery-opt:hover, .delivery-opt.active { border-color:var(--purple); background:var(--purple-pale); }
.dopt-icon { font-size:22px; }
.dopt-info { flex:1; display:flex; flex-direction:column; }
.dopt-info strong { font-size:14px; font-weight:600; }
.dopt-info span { font-size:13px; color:var(--gray); }
.dopt-check { color:var(--purple); font-weight:700; }
.qty-row { display:flex; align-items:center; gap:16px; margin-bottom:20px; }
.qty-ctrl { display:flex; align-items:center; gap:12px; }
.qty-ctrl button { width:32px; height:32px; border-radius:50%; border:1.5px solid var(--border); background:#fff; font-size:18px; display:flex; align-items:center; justify-content:center; transition:background var(--t); }
.qty-ctrl button:hover { background:var(--purple-pale); border-color:var(--purple); }
.qty-ctrl span { font-size:18px; font-weight:700; min-width:28px; text-align:center; }
.total-bar { display:flex; align-items:center; justify-content:space-between; background:var(--purple-pale); border-radius:var(--radius-lg); padding:16px 20px; margin:20px 0; gap:16px; flex-wrap:wrap; }
.total-label { font-size:13px; color:var(--gray); margin-right:8px; }
.total-price { font-size:24px; font-weight:700; color:var(--purple); }
.total-note { font-size:12px; color:var(--gold); margin-left:6px; }
.long-desc { border-top:1px solid var(--border); padding-top:24px; margin-top:8px; }
.long-desc h4 { font-size:16px; font-weight:600; margin-bottom:10px; }
.long-desc p { font-size:15px; color:var(--gray); line-height:1.7; }
</style>
