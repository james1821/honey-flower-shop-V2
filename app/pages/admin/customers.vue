<template>
  <div class="customers-admin">
    <div class="toolbar">
      <input v-model="search" class="form-input" placeholder="Search by name or email…" style="max-width:300px" />
      <span class="total-count">{{ total }} customers</span>
    </div>

    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>Customer</th><th>Phone</th><th>Role</th><th>Joined</th><th>Actions</th>
        </tr></thead>
        <tbody>
          <tr v-for="c in customers" :key="c.id">
            <td>
              <div class="cust-cell">
                <div class="cust-avatar">{{ (c.full_name ?? c.email).slice(0,2).toUpperCase() }}</div>
                <div>
                  <p class="cust-name">{{ c.full_name ?? '—' }}</p>
                  <p class="cust-email">{{ c.email }}</p>
                </div>
              </div>
            </td>
            <td style="font-size:14px;color:var(--gray)">{{ c.phone ?? '—' }}</td>
            <td>
              <span class="badge" :class="c.role==='admin'?'badge-gold':'badge-green'">{{ c.role }}</span>
            </td>
            <td style="font-size:13px;color:var(--gray)">{{ new Date(c.created_at).toLocaleDateString('en-PH') }}</td>
            <td>
              <button class="btn btn-ghost btn-sm" @click="viewOrders(c.id)">View Orders</button>
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
  </div>
</template>

<script setup lang="ts">
import type { Profile } from '~/types'
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { adminGetCustomers } = useAdmin()

const customers = ref<Profile[]>([])
const total = ref(0)
const page = ref(1)
const search = ref('')

async function load() {
  const { data, count } = await adminGetCustomers(page.value, 20, search.value)
  customers.value = data ?? []
  total.value = count ?? 0
}

watch([page, search], useDebounceFn(load, 300))
await load()

function viewOrders(id: string) {
  navigateTo(`/admin/orders?customer=${id}`)
}
</script>

<style scoped>
.customers-admin { display:flex; flex-direction:column; gap:20px; }
.toolbar { display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
.total-count { font-size:14px; color:var(--gray); }
.cust-cell { display:flex; align-items:center; gap:12px; }
.cust-avatar {
  width:36px; height:36px; border-radius:50%; background:var(--purple-pale);
  color:var(--purple); font-size:12px; font-weight:700;
  display:flex; align-items:center; justify-content:center; flex-shrink:0;
}
.cust-name  { font-size:14px; font-weight:500; }
.cust-email { font-size:12px; color:var(--gray); }
.pagination { display:flex; align-items:center; gap:16px; justify-content:center; font-size:14px; color:var(--gray); }
</style>
