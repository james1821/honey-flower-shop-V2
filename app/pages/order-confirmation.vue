<template>
  <div class="confirm-page">
    <div class="container confirm-inner">
      <div class="confirm-card">
        <div class="confirm-icon">🎉</div>
        <h1>Order Confirmed!</h1>
        <p class="order-num">Order #{{ orderNumber }}</p>
        <p class="confirm-msg">Thank you for your order. We'll send you a confirmation shortly.</p>
        <div class="confirm-actions">
          <NuxtLink to="/account/orders" class="btn btn-primary">View My Orders</NuxtLink>
          <NuxtLink to="/shop" class="btn btn-ghost">Continue Shopping</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const orderNumber = computed(() => route.query.order as string ?? '')
</script>

<style scoped>
.confirm-page { padding: 80px 0; }
.confirm-inner { display:flex; justify-content:center; }
.confirm-card {
  background:#fff; border-radius:var(--radius-xl); border:1px solid var(--border);
  padding:60px 48px; text-align:center; max-width:520px; width:100%;
  box-shadow:var(--shadow-md);
}
.confirm-icon { font-size:64px; margin-bottom:20px; }
.confirm-card h1 { font-size:36px; margin-bottom:12px; }
.order-num { font-size:14px; font-weight:700; color:var(--green); letter-spacing:.08em; text-transform:uppercase; margin-bottom:16px; }
.confirm-msg { font-size:16px; color:var(--gray); line-height:1.7; margin-bottom:32px; }
.confirm-actions { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
</style>
