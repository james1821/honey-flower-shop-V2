<template>
  <Teleport to="body">
    <div v-if="cart.isOpen" class="cart-overlay fade-in" @click.self="cart.isOpen=false">
      <div class="cart-panel" style="animation:slideRight .3s var(--ease)">
        <div class="cart-head">
          <h3>Your Cart <span v-if="cart.itemCount" class="count-pill">{{ cart.itemCount }}</span></h3>
          <button class="modal-close" @click="cart.isOpen=false">✕</button>
        </div>

        <div v-if="!cart.items.length" class="cart-empty">
          <div class="empty-icon">🛒</div>
          <p>Your cart is empty</p>
          <NuxtLink to="/shop" class="btn btn-primary" @click="cart.isOpen=false">Browse Products</NuxtLink>
        </div>

        <div v-else class="cart-body">
          <div class="cart-items">
            <div v-for="(item, i) in cart.items" :key="i" class="cart-item">
              <img :src="item.product.images[0]" :alt="item.product.name" class="item-img" />
              <div class="item-info">
                <p class="item-name">{{ item.product.name }}</p>
                <p v-if="item.variant" class="item-sub">{{ item.variant.name }}</p>
                <p v-if="item.moneyAmount" class="item-money">
                  + {{ fmt(item.moneyAmount) }} cash inside
                </p>
                <p v-if="item.deliveryOption" class="item-sub">{{ item.deliveryOption.name }}</p>
                <div class="item-row">
                  <div class="qty-ctrl">
                    <button @click="cart.updateQty(item.product.id, item.variant?.id, item.moneyAmount, item.quantity - 1)">−</button>
                    <span>{{ item.quantity }}</span>
                    <button @click="cart.updateQty(item.product.id, item.variant?.id, item.moneyAmount, item.quantity + 1)">+</button>
                  </div>
                  <span class="item-price">{{ fmt(((item.product.sale_price ?? item.product.base_price) + (item.variant?.price_modifier ?? 0) + (item.moneyAmount ?? 0)) * item.quantity) }}</span>
                </div>
              </div>
              <button class="remove-btn" @click="cart.removeItem(item.product.id, item.variant?.id, item.moneyAmount)">✕</button>
            </div>
          </div>

          <div class="cart-summary">
            <div class="sum-row"><span>Products</span><span>{{ fmt(cart.productSubtotal) }}</span></div>
            <div v-if="cart.cashTotal" class="sum-row highlight"><span>Cash in bouquets</span><span>{{ fmt(cart.cashTotal) }}</span></div>
            <div v-if="cart.deliveryTotal" class="sum-row"><span>Delivery</span><span>{{ fmt(cart.deliveryTotal) }}</span></div>
            <hr>
            <div class="sum-row total"><span>Total</span><span>{{ fmt(cart.grandTotal) }}</span></div>
            <NuxtLink to="/checkout" class="btn btn-primary btn-lg w-full" @click="cart.isOpen=false">
              Proceed to Checkout
            </NuxtLink>
            <button class="btn btn-ghost w-full" @click="cart.isOpen=false">Continue Shopping</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const cart = useCartStore()
const { fmt } = useCurrency()
</script>

<style scoped>
.cart-overlay {
  position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:300;
  display:flex; justify-content:flex-end;
}
.cart-panel {
  width:100%; max-width:420px; background:#fff; display:flex; flex-direction:column;
  height:100%; overflow:hidden;
}
.cart-head {
  padding:20px 24px; border-bottom:1px solid var(--border);
  display:flex; align-items:center; justify-content:space-between;
}
.cart-head h3 { font-size:20px; display:flex; align-items:center; gap:10px; }
.count-pill {
  background:var(--green); color:#fff; font-size:12px; font-weight:700;
  width:22px; height:22px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center;
}
.cart-empty {
  flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:16px; padding:40px;
}
.empty-icon { font-size:56px; }
.cart-empty p { color:var(--gray); font-size:16px; }
.cart-body { flex:1; overflow:hidden; display:flex; flex-direction:column; }
.cart-items { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:12px; }
.cart-item {
  display:flex; gap:12px; align-items:flex-start; padding:12px;
  border-radius:var(--radius-md); border:1px solid var(--border); position:relative;
}
.item-img { width:64px; height:64px; object-fit:cover; border-radius:var(--radius-sm); flex-shrink:0; }
.item-info { flex:1; min-width:0; }
.item-name { font-size:14px; font-weight:500; line-height:1.3; }
.item-sub   { font-size:12px; color:var(--gray); margin-top:2px; }
.item-money { font-size:12px; color:var(--gold); font-weight:600; margin-top:2px; }
.item-row { display:flex; align-items:center; justify-content:space-between; margin-top:8px; }
.qty-ctrl { display:flex; align-items:center; gap:8px; }
.qty-ctrl button {
  width:26px; height:26px; border-radius:50%; border:1px solid var(--border);
  background:none; font-size:16px; display:flex; align-items:center; justify-content:center;
  transition:background var(--t);
}
.qty-ctrl button:hover { background:var(--cream); }
.qty-ctrl span { font-size:14px; font-weight:600; min-width:20px; text-align:center; }
.item-price { font-size:14px; font-weight:600; color:var(--green); }
.remove-btn {
  position:absolute; top:8px; right:8px; background:none; border:none;
  font-size:12px; color:var(--gray-light); padding:4px; cursor:pointer;
}
.remove-btn:hover { color:var(--error); }
.cart-summary { padding:16px 20px; border-top:1px solid var(--border); display:flex; flex-direction:column; gap:10px; }
.sum-row { display:flex; justify-content:space-between; font-size:14px; color:var(--gray); }
.sum-row.highlight { color:var(--gold); font-weight:600; }
.sum-row.total { font-size:17px; font-weight:700; color:var(--charcoal); }
.w-full { width:100%; }
</style>
