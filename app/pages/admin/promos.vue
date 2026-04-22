<template>
  <div class="promos-admin">
    <div class="toolbar">
      <h2 style="font-size:16px;font-weight:600">{{ promoCodes.length }} active codes</h2>
      <button class="btn btn-primary" @click="openNew">+ New Promo Code</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>Code</th><th>Discount</th><th>Min Order</th><th>Usage</th><th>Expires</th><th>Status</th><th>Actions</th>
        </tr></thead>
        <tbody>
          <tr v-for="p in promoCodes" :key="p.id">
            <td>
              <div>
                <span class="promo-code">{{ p.code }}</span>
                <p style="font-size:12px;color:var(--gray);margin-top:2px">{{ p.description }}</p>
              </div>
            </td>
            <td>
              <strong>
                {{ p.discount_type === 'percentage' ? p.discount_value + '%' : fmt(p.discount_value) }}
              </strong>
              <span style="font-size:12px;color:var(--gray);margin-left:4px">off</span>
            </td>
            <td>{{ p.min_order_amount ? fmt(p.min_order_amount) : '—' }}</td>
            <td>
              <span>{{ p.uses_count }}</span>
              <span v-if="p.max_uses" style="color:var(--gray)"> / {{ p.max_uses }}</span>
              <span v-else style="color:var(--gray)"> / ∞</span>
            </td>
            <td style="font-size:13px;color:var(--gray)">
              {{ p.valid_until ? new Date(p.valid_until).toLocaleDateString('en-PH') : 'No expiry' }}
            </td>
            <td>
              <label class="toggle">
                <input type="checkbox" :checked="p.is_active" @change="togglePromo(p)" />
                <span class="toggle-track"></span>
              </label>
            </td>
            <td>
              <div style="display:flex;gap:6px">
                <button class="btn btn-secondary btn-sm" @click="editPromo(p)">Edit</button>
                <button class="btn btn-danger btn-sm" @click="deletePromo(p)">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-bg" @click.self="showModal=false">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editing ? 'Edit Promo Code' : 'New Promo Code' }}</h2>
          <button class="modal-close" @click="showModal=false">✕</button>
        </div>
        <div class="modal-body" style="display:flex;flex-direction:column;gap:16px">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Code *</label>
              <input v-model="form.code" class="form-input" placeholder="e.g. SAVE200" style="text-transform:uppercase" @input="form.code = form.code?.toUpperCase()" />
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <input v-model="form.description" class="form-input" placeholder="Internal note" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Discount Type</label>
              <select v-model="form.discount_type" class="form-select">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₱)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Discount Value {{ form.discount_type === 'percentage' ? '(%)' : '(₱)' }} *</label>
              <input v-model.number="form.discount_value" type="number" class="form-input" min="0" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Min Order Amount (₱)</label>
              <input v-model.number="form.min_order_amount" type="number" class="form-input" placeholder="No minimum" />
            </div>
            <div class="form-group">
              <label class="form-label">Max Uses</label>
              <input v-model.number="form.max_uses" type="number" class="form-input" placeholder="Unlimited" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Valid From</label>
              <input v-model="form.valid_from" type="datetime-local" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Valid Until</label>
              <input v-model="form.valid_until" type="datetime-local" class="form-input" />
            </div>
          </div>

          <label class="check-label">
            <input type="checkbox" v-model="form.is_active" />
            Active (can be used by customers)
          </label>

          <p v-if="formErr" class="form-error">{{ formErr }}</p>

          <div style="display:flex;gap:12px;justify-content:flex-end">
            <button class="btn btn-secondary" @click="showModal=false">Cancel</button>
            <button class="btn btn-primary" :disabled="saving" @click="save">
              <span v-if="saving" class="spinner"></span>
              <span v-else>{{ editing ? 'Save Changes' : 'Create Code' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PromoCode } from '~/types'
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { adminGetPromos, adminUpsertPromo, adminDeletePromo } = useAdmin()
const { fmt } = useCurrency()
const { success, error } = useToast()

const promoCodes = ref<PromoCode[]>([])
const showModal = ref(false)
const editing = ref(false)
const saving = ref(false)
const formErr = ref('')

const form = reactive<Partial<PromoCode>>({
  code: '', description: '', discount_type: 'percentage', discount_value: 10,
  min_order_amount: undefined, max_uses: undefined,
  valid_from: undefined, valid_until: undefined, is_active: true,
})

async function load() {
  const { data } = await adminGetPromos()
  promoCodes.value = data ?? []
}
await load()

function openNew() {
  editing.value = false
  Object.assign(form, {
    id: undefined, code: '', description: '', discount_type: 'percentage', discount_value: 10,
    min_order_amount: undefined, max_uses: undefined, valid_from: undefined, valid_until: undefined, is_active: true,
  })
  formErr.value = ''
  showModal.value = true
}

function editPromo(p: PromoCode) {
  editing.value = true
  Object.assign(form, { ...p })
  formErr.value = ''
  showModal.value = true
}

async function save() {
  if (!form.code) { formErr.value = 'Code is required'; return }
  if (!form.discount_value || form.discount_value <= 0) { formErr.value = 'Discount value must be > 0'; return }
  saving.value = true; formErr.value = ''
  const { error: err } = await adminUpsertPromo({
    ...form,
    min_order_amount: form.min_order_amount || null,
    max_uses: form.max_uses || null,
    valid_from: form.valid_from || null,
    valid_until: form.valid_until || null,
  } as Partial<PromoCode>)
  saving.value = false
  if (err) { formErr.value = err.message; return }
  success(editing.value ? 'Promo updated!' : 'Promo created!')
  showModal.value = false
  await load()
}

async function togglePromo(p: PromoCode) {
  await adminUpsertPromo({ id: p.id, is_active: !p.is_active })
  p.is_active = !p.is_active
}

async function deletePromo(p: PromoCode) {
  if (!confirm(`Delete code "${p.code}"?`)) return
  const { error: err } = await adminDeletePromo(p.id)
  if (err) { error(err.message); return }
  success('Promo code deleted')
  await load()
}
</script>

<style scoped>
.promos-admin { display:flex; flex-direction:column; gap:20px; }
.toolbar { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
.promo-code {
  font-family: monospace; font-size: 15px; font-weight: 700; color: var(--purple);
  background: var(--purple-pale); padding: 3px 10px; border-radius: var(--radius-sm);
  letter-spacing: .08em;
}
.toggle { display:inline-flex; align-items:center; cursor:pointer; }
.toggle input { display:none; }
.toggle-track {
  width:36px; height:20px; border-radius:10px; background:var(--border);
  position:relative; transition:background var(--t);
}
.toggle-track::after {
  content:''; position:absolute; top:3px; left:3px;
  width:14px; height:14px; border-radius:50%; background:#fff;
  transition:transform var(--t); box-shadow:var(--shadow-xs);
}
.toggle input:checked + .toggle-track { background:var(--purple); }
.toggle input:checked + .toggle-track::after { transform:translateX(16px); }
.check-label { display:flex; align-items:center; gap:8px; font-size:14px; cursor:pointer; }
</style>
