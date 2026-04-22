<template>
  <div class="page">
    <div class="container">
      <h1 class="page-title">My Orders</h1>

      <div v-if="loading" class="loading-state">
        <div class="spinner spinner-lg"></div>
      </div>

      <div v-else-if="!orders.length" class="empty-state">
        <p>You haven't placed any orders yet.</p>
        <NuxtLink to="/shop" class="btn btn-primary">Start Shopping</NuxtLink>
      </div>

      <div v-else class="orders-list">
        <div v-for="order in orders" :key="order.id" class="order-card card">
          <div class="order-header">
            <div>
              <p class="order-num">{{ order.order_number }}</p>
              <p class="order-date">{{ formatDate(order.created_at) }}</p>
            </div>
            <span class="badge" :class="statusBadge(order.status)">{{ order.status.replace(/_/g,' ') }}</span>
          </div>
          <div class="order-items">
            <div v-for="item in order.items" :key="item.id" class="oi">
              <img :src="item.product_snapshot?.images?.[0] || ''" :alt="item.product_snapshot?.name" class="oi-img" />
              <div class="oi-meta">
                <p>{{ item.product_snapshot?.name }}</p>
                <p v-if="item.money_amount" class="money-label">+ {{ fmt(item.money_amount) }} cash inside</p>
              </div>
              <span>× {{ item.quantity }}</span>
            </div>
          </div>
          <div class="order-footer">
            <div>
              <span class="label">Delivery</span>
              <span>{{ order.delivery_option?.name ?? (order.pickup_name ? 'Store Pickup' : '—') }}</span>
            </div>
            <div class="order-total">
              <span>Total</span>
              <span class="total-val">{{ fmt(order.total) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Order } from '~/types'
definePageMeta({ middleware: ['auth'] })

const { getMyOrders } = useOrders()
const { fmt } = useCurrency()

const orders = ref<Order[]>([])
const loading = ref(true)

onMounted(async () => {
  const { data } = await getMyOrders()
  orders.value = data ?? []
  loading.value = false
})

function formatDate(d: string) { return new Date(d).toLocaleDateString('en-PH', { year:'numeric', month:'long', day:'numeric' }) }

const statusMap: Record<string, string> = {
  pending: 'badge-warning', confirmed: 'badge-green', processing: 'badge-green',
  ready_for_pickup: 'badge-green', out_for_delivery: 'badge-green',
  delivered: 'badge-success', cancelled: 'badge-error', refunded: 'badge-gray',
}
function statusBadge(s: string) { return statusMap[s] ?? 'badge-gray' }
</script>

<style scoped>
.page { padding:48px 0 80px; }
.page-title { font-size:clamp(28px,4vw,40px); margin-bottom:32px; }
.loading-state { display:flex; justify-content:center; padding:80px; }
.empty-state { text-align:center; padding:80px; display:flex; flex-direction:column; align-items:center; gap:16px; }
.empty-state p { font-size:18px; color:var(--gray); }
.orders-list { display:flex; flex-direction:column; gap:20px; }
.order-card { overflow:hidden; }
.order-header { padding:20px 24px; border-bottom:1px solid var(--border); display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
.order-num  { font-size:14px; font-weight:700; color:var(--purple); letter-spacing:.06em; }
.order-date { font-size:13px; color:var(--gray); margin-top:2px; }
.order-items { padding:16px 24px; display:flex; flex-direction:column; gap:10px; }
.oi { display:flex; gap:12px; align-items:center; }
.oi-img { width:48px; height:48px; object-fit:cover; border-radius:var(--radius-sm); flex-shrink:0; }
.oi-meta { flex:1; font-size:14px; }
.money-label { font-size:12px; color:var(--gold); font-weight:600; }
.oi span { font-size:14px; color:var(--gray); }
.order-footer { padding:16px 24px; background:var(--cream); border-top:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; }
.order-footer .label { font-size:12px; color:var(--gray); margin-right:6px; }
.order-footer span { font-size:14px; }
.order-total { display:flex; gap:10px; align-items:center; font-size:14px; color:var(--gray); }
.total-val { font-size:18px; font-weight:700; color:var(--purple); }
</style>
