<template>
  <div class="dashboard">
    <div v-if="loading" class="loading"><div class="spinner spinner-lg"></div></div>
    <template v-else-if="stats">
    
      <div class="kpi-grid">
        <div class="kpi-card card">
          <div class="kpi-icon" style="background:#eef5f0;color:var(--purple)">₱</div>
          <div>
            <p class="kpi-label">Revenue (30d)</p>
            <p class="kpi-val">{{ fmt(stats.totalRevenue) }}</p>
            <p class="kpi-change" :class="stats.revenueChange>=0?'up':'down'">
              {{ stats.revenueChange>=0?'↑':'↓' }} {{ Math.abs(stats.revenueChange).toFixed(1) }}% vs prev
            </p>
          </div>
        </div>
        <div class="kpi-card card">
          <div class="kpi-icon" style="background:#fdf0f1;color:#8a4a50">📦</div>
          <div>
            <p class="kpi-label">Orders (30d)</p>
            <p class="kpi-val">{{ stats.totalOrders }}</p>
            <p class="kpi-change" :class="stats.ordersChange>=0?'up':'down'">
              {{ stats.ordersChange>=0?'↑':'↓' }} {{ Math.abs(stats.ordersChange).toFixed(1) }}% vs prev
            </p>
          </div>
        </div>
        <div class="kpi-card card">
          <div class="kpi-icon" style="background:#fef3dc;color:var(--warning)">⏳</div>
          <div>
            <p class="kpi-label">Pending Orders</p>
            <p class="kpi-val">{{ stats.pendingOrders }}</p>
            <NuxtLink to="/admin/orders?status=pending" class="kpi-link">View all →</NuxtLink>
          </div>
        </div>
        <div class="kpi-card card">
          <div class="kpi-icon" style="background:var(--purple-pale);color:var(--purple)">👥</div>
          <div>
            <p class="kpi-label">Total Customers</p>
            <p class="kpi-val">{{ stats.totalCustomers }}</p>
            <NuxtLink to="/admin/customers" class="kpi-link">View all →</NuxtLink>
          </div>
        </div>
      </div>

    
      <div class="card chart-card">
        <div class="card-header"><h3>Revenue — Last 14 Days</h3></div>
        <div class="card-body chart-body">
          <div class="bar-chart">
            <div v-for="d in stats.revenueByDay" :key="d.date" class="bar-wrap">
              <div
                class="bar"
                :style="{ height: maxRev > 0 ? (d.revenue / maxRev * 100) + '%' : '2%' }"
                :title="`${d.date}: ${fmt(d.revenue)}`"
              ></div>
              <span class="bar-label">{{ d.date.slice(5) }}</span>
            </div>
          </div>
        </div>
      </div>

     
      <div class="card">
        <div class="card-header">
          <h3>Recent Orders</h3>
          <NuxtLink to="/admin/orders" class="btn btn-ghost btn-sm">View all</NuxtLink>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>Order</th><th>Customer</th><th>Status</th><th>Total</th><th>Date</th><th>Action</th>
            </tr></thead>
            <tbody>
              <tr v-for="o in stats.recentOrders" :key="o.id">
                <td><span class="order-num">{{ o.order_number }}</span></td>
                <td>{{ o.customer?.full_name ?? o.recipient_name }}</td>
                <td><span class="badge" :class="statusBadge(o.status)">{{ o.status.replace(/_/g,' ') }}</span></td>
                <td><strong>{{ fmt(o.total) }}</strong></td>
                <td>{{ new Date(o.created_at).toLocaleDateString('en-PH') }}</td>
                <td>
                  <NuxtLink :to="`/admin/orders?id=${o.id}`" class="btn btn-ghost btn-sm">View</NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
const { getDashboardStats } = useAdmin()
const { fmt } = useCurrency()

const stats = ref<any>(null)
const loading = ref(true)

onMounted(async () => {
  const { data } = await getDashboardStats()
  stats.value = data
  loading.value = false
})

const maxRev = computed(() => Math.max(...(stats.value?.revenueByDay ?? []).map((d: any) => d.revenue), 1))

const statusMap: Record<string, string> = {
  pending: 'badge-warning', confirmed: 'badge-green', processing: 'badge-green',
  ready_for_pickup: 'badge-green', out_for_delivery: 'badge-green',
  delivered: 'badge-success', cancelled: 'badge-error', refunded: 'badge-gray',
}
function statusBadge(s: string) { return statusMap[s] ?? 'badge-gray' }
</script>

<style scoped>
.dashboard { display:flex; flex-direction:column; gap:24px; }
.loading { display:flex; justify-content:center; padding:80px; }
.kpi-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px; }
.kpi-card { display:flex; align-items:center; gap:16px; padding:20px; }
.kpi-icon { width:44px; height:44px; border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
.kpi-label { font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:.06em; color:var(--gray); margin-bottom:4px; }
.kpi-val { font-size:26px; font-weight:700; color:var(--charcoal); line-height:1.1; }
.kpi-change { font-size:12px; margin-top:4px; }
.kpi-change.up { color:var(--success); }
.kpi-change.down { color:var(--error); }
.kpi-link { font-size:12px; color:var(--purple); margin-top:4px; display:block; }
.chart-card .card-body { padding:20px 24px; }
.chart-body { overflow-x:auto; }
.bar-chart { display:flex; align-items:flex-end; gap:6px; height:160px; min-width:600px; }
.bar-wrap { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; height:100%; justify-content:flex-end; }
.bar { width:100%; background:var(--purple); border-radius:3px 3px 0 0; min-height:2px; transition:height .3s var(--ease); }
.bar:hover { background:var(--purple-light); }
.bar-label { font-size:10px; color:var(--gray); white-space:nowrap; }
.order-num { font-size:12px; font-weight:700; color:var(--purple); letter-spacing:.04em; }
</style>
