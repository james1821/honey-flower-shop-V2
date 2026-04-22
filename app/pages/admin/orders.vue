<template>
  <div class="orders-admin">
    <div class="toolbar">
      <div class="status-tabs">
        <button
          v-for="s in statuses" :key="s.value"
          class="tab" :class="{ active: statusFilter === s.value }"
          @click="statusFilter = s.value; page = 1"
        >{{ s.label }}</button>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>Order #</th><th>Customer</th><th>Delivery</th><th>Cash</th><th>Total</th><th>Status</th><th>Date</th><th>Action</th>
        </tr></thead>
        <tbody>
          <tr v-for="o in orders" :key="o.id">
            <td><span class="order-num">{{ o.order_number }}</span></td>
            <td>
              <div>
                <p style="font-weight:500;font-size:14px">{{ o.customer?.full_name ?? o.recipient_name }}</p>
                <p style="font-size:12px;color:var(--gray)">{{ o.customer?.email }}</p>
              </div>
            </td>
            <td>
              <p style="font-size:13px">{{ o.delivery_option?.name ?? (o.pickup_name ? 'Pickup: ' + o.pickup_name : '—') }}</p>
              <p v-if="o.delivery_date" style="font-size:12px;color:var(--gray)">{{ o.delivery_date }}</p>
            </td>
            <td>
              <span v-if="o.cash_in_order > 0" class="cash-badge">{{ fmt(o.cash_in_order) }}</span>
              <span v-else>—</span>
            </td>
            <td><strong>{{ fmt(o.total) }}</strong></td>
            <td>
              <select
                class="status-select"
                :value="o.status"
                :class="`status-${o.status}`"
                @change="updateStatus(o, ($event.target as HTMLSelectElement).value as any)"
              >
                <option v-for="s in allStatuses" :key="s" :value="s">{{ s.replace(/_/g,' ') }}</option>
              </select>
            </td>
            <td style="font-size:13px;color:var(--gray)">{{ new Date(o.created_at).toLocaleDateString('en-PH') }}</td>
            <td>
              <button class="btn btn-ghost btn-sm" @click="viewOrder(o)">Details</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button class="btn btn-ghost btn-sm" :disabled="page===1" @click="page--">← Prev</button>
      <span>Page {{ page }} · {{ total }} total</span>
      <button class="btn btn-ghost btn-sm" :disabled="page * 20 >= total" @click="page++">Next →</button>
    </div>

    
    <div v-if="selected" class="modal-bg" @click.self="selected=null">
      <div class="modal" style="max-width:600px">
        <div class="modal-header">
          <h2>{{ selected.order_number }}</h2>
          <button class="modal-close" @click="selected=null">✕</button>
        </div>
        <div class="modal-body" style="display:flex;flex-direction:column;gap:16px">
          <div class="detail-grid">
            <div><p class="dl">Recipient</p><p>{{ selected.recipient_name }}</p></div>
            <div><p class="dl">Phone</p><p>{{ selected.recipient_phone ?? '—' }}</p></div>
            <div><p class="dl">Delivery</p><p>{{ selected.delivery_option?.name ?? 'Pickup' }}</p></div>
            <div><p class="dl">Date</p><p>{{ selected.delivery_date ?? '—' }}</p></div>
            <div v-if="selected.delivery_address?.line1">
              <p class="dl">Address</p>
              <p>{{ selected.delivery_address.line1 }}, {{ selected.delivery_address.city }}</p>
            </div>
            <div v-if="selected.gift_message">
              <p class="dl">Gift Message</p>
              <p>{{ selected.gift_message }}</p>
            </div>
          </div>

          <div>
            <p class="dl" style="margin-bottom:8px">Items</p>
            <div v-for="item in selected.items" :key="item.id" class="order-item-row">
              <img :src="item.product_snapshot?.images?.[0]" :alt="item.product_snapshot?.name" class="oi-img" />
              <div style="flex:1">
                <p style="font-size:14px;font-weight:500">{{ item.product_snapshot?.name }}</p>
                <p v-if="item.money_amount" style="font-size:12px;color:var(--gold);font-weight:600">Cash inside: {{ fmt(item.money_amount) }}</p>
              </div>
              <span style="font-size:14px">×{{ item.quantity }}</span>
              <span style="font-size:14px;font-weight:600;color:var(--purple)">{{ fmt(item.subtotal) }}</span>
            </div>
          </div>

          <div class="sum-block">
            <div class="sl"><span>Products</span><span>{{ fmt(selected.subtotal) }}</span></div>
            <div v-if="selected.cash_in_order" class="sl" style="color:var(--gold)"><span>Cash in bouquets</span><span>{{ fmt(selected.cash_in_order) }}</span></div>
            <div class="sl"><span>Delivery</span><span>{{ fmt(selected.delivery_fee) }}</span></div>
            <div v-if="selected.discount_amount" class="sl" style="color:var(--success)"><span>Discount</span><span>−{{ fmt(selected.discount_amount) }}</span></div>
            <div class="sl total"><span>Total</span><span>{{ fmt(selected.total) }}</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Order, OrderStatus } from '~/types'
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { adminGetOrders, adminUpdateOrderStatus } = useAdmin()
const { fmt } = useCurrency()
const { success, error } = useToast()

const orders = ref<Order[]>([])
const total = ref(0)
const page = ref(1)
const statusFilter = ref<OrderStatus | undefined>(undefined)
const selected = ref<Order | null>(null)

const statuses = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Processing', value: 'processing' },
  { label: 'Ready Pickup', value: 'ready_for_pickup' },
  { label: 'Out for Delivery', value: 'out_for_delivery' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
]

const allStatuses: OrderStatus[] = ['pending','confirmed','processing','ready_for_pickup','out_for_delivery','delivered','cancelled','refunded']

async function load() {
  const { data, count } = await adminGetOrders(page.value, 20, statusFilter.value)
  orders.value = data ?? []
  total.value = count ?? 0
}

watch([page, statusFilter], load)
await load()

async function updateStatus(o: Order, status: OrderStatus) {
  const { error: err } = await adminUpdateOrderStatus(o.id, status)
  if (err) { error(err.message); return }
  o.status = status
  success('Status updated')
}

function viewOrder(o: Order) { selected.value = o }
</script>

<style scoped>
.orders-admin { display:flex; flex-direction:column; gap:20px; }
.toolbar { overflow-x:auto; }
.status-tabs { display:flex; gap:6px; flex-wrap:wrap; }
.tab { padding:7px 14px; border-radius:var(--radius-full); border:1.5px solid var(--border); background:#fff; font-size:13px; color:var(--gray); cursor:pointer; transition:all var(--t); white-space:nowrap; }
.tab:hover, .tab.active { background:var(--purple); color:#fff; border-color:var(--purple); }
.order-num { font-size:12px; font-weight:700; color:var(--purple); letter-spacing:.04em; }
.cash-badge { background:#fdf5e0; color:#7a5c10; font-size:12px; font-weight:700; padding:3px 8px; border-radius:var(--radius-full); }
.status-select {
  padding:5px 10px; border-radius:var(--radius-full); border:1.5px solid var(--border);
  font-size:12px; font-weight:600; background:#fff; cursor:pointer; text-transform:capitalize;
}
.pagination { display:flex; align-items:center; gap:16px; justify-content:center; font-size:14px; color:var(--gray); }
.detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.dl { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--gray-light); margin-bottom:2px; }
.order-item-row { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid var(--border); }
.oi-img { width:44px; height:44px; object-fit:cover; border-radius:var(--radius-sm); flex-shrink:0; }
.sum-block { background:var(--cream); border-radius:var(--radius-md); padding:14px 16px; display:flex; flex-direction:column; gap:8px; }
.sl { display:flex; justify-content:space-between; font-size:14px; color:var(--gray); }
.sl.total { font-size:17px; font-weight:700; color:var(--charcoal); border-top:1px solid var(--border); padding-top:8px; }
</style>
