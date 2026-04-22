<template>
  <div class="delivery-admin">
    <div class="toolbar">
      <p style="font-size:14px;color:var(--gray)">Manage delivery methods and pricing</p>
      <button class="btn btn-primary" @click="openNew">+ Add Delivery Option</button>
    </div>

    <div class="options-grid">
      <div v-for="d in options" :key="d.id" class="option-card card">
        <div class="card-body">
          <div class="opt-header">
            <span class="opt-icon">{{ d.type === 'standard' ? '🚚' : '🏪' }}</span>
            <div style="flex:1">
              <h3 class="opt-name">{{ d.name }}</h3>
              <p class="opt-desc">{{ d.description }}</p>
            </div>
            <label class="toggle">
              <input type="checkbox" :checked="d.is_active" @change="toggleOption(d)" />
              <span class="toggle-track"></span>
            </label>
          </div>

          <div class="opt-details">
            <div class="opt-detail">
              <span class="dl">Type</span>
              <span class="badge" :class="d.type==='standard'?'badge-green':'badge-gray'">{{ d.type }}</span>
            </div>
            <div class="opt-detail">
              <span class="dl">Price</span>
              <span class="opt-price">{{ d.price === 0 ? 'Free' : fmt(d.price) }}</span>
            </div>
            <div class="opt-detail">
              <span class="dl">Est. Days</span>
              <span>{{ d.estimated_days }}</span>
            </div>
          </div>

          <div style="display:flex;gap:8px;margin-top:16px">
            <button class="btn btn-secondary btn-sm" style="flex:1" @click="editOption(d)">Edit</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-bg" @click.self="showModal=false">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editing ? 'Edit Delivery Option' : 'New Delivery Option' }}</h2>
          <button class="modal-close" @click="showModal=false">✕</button>
        </div>
        <div class="modal-body" style="display:flex;flex-direction:column;gap:16px">
          <div class="form-group">
            <label class="form-label">Name *</label>
            <input v-model="form.name" class="form-input" placeholder="e.g. Standard Delivery" />
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <input v-model="form.description" class="form-input" placeholder="Short description shown to customers" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Type</label>
              <select v-model="form.type" class="form-select">
                <option value="standard">🚚 Standard Delivery</option>
                <option value="pickup">🏪 Store Pickup</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Price (₱)</label>
              <input v-model.number="form.price" type="number" class="form-input" min="0" step="10" />
              <p class="form-hint">Set to 0 for free</p>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Estimated Delivery Days</label>
            <input v-model="form.estimated_days" class="form-input" placeholder="e.g. 3–5 days" />
          </div>

          <label class="check-label">
            <input type="checkbox" v-model="form.is_active" />
            Active (available to customers)
          </label>

          <p v-if="formErr" class="form-error">{{ formErr }}</p>

          <div style="display:flex;gap:12px;justify-content:flex-end">
            <button class="btn btn-secondary" @click="showModal=false">Cancel</button>
            <button class="btn btn-primary" :disabled="saving" @click="save">
              <span v-if="saving" class="spinner"></span>
              <span v-else>{{ editing ? 'Save Changes' : 'Create' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DeliveryOption } from '~/types'
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { adminGetDelivery, adminUpsertDelivery } = useAdmin()
const { fmt } = useCurrency()
const { success, error } = useToast()

const options = ref<DeliveryOption[]>([])
const showModal = ref(false)
const editing = ref(false)
const saving = ref(false)
const formErr = ref('')

const form = reactive<Partial<DeliveryOption>>({
  name: '', description: '', type: 'standard', price: 0, estimated_days: '3–5 days', is_active: true,
})

async function load() {
  const { data } = await adminGetDelivery()
  options.value = data ?? []
}
await load()

function openNew() {
  editing.value = false
  Object.assign(form, { id: undefined, name: '', description: '', type: 'standard', price: 0, estimated_days: '3–5 days', is_active: true })
  formErr.value = ''
  showModal.value = true
}

function editOption(d: DeliveryOption) {
  editing.value = true
  Object.assign(form, { ...d })
  formErr.value = ''
  showModal.value = true
}

async function save() {
  if (!form.name) { formErr.value = 'Name is required'; return }
  saving.value = true; formErr.value = ''
  const { error: err } = await adminUpsertDelivery(form as Partial<DeliveryOption>)
  saving.value = false
  if (err) { formErr.value = err.message; return }
  success(editing.value ? 'Delivery option updated!' : 'Delivery option created!')
  showModal.value = false
  await load()
}

async function toggleOption(d: DeliveryOption) {
  await adminUpsertDelivery({ id: d.id, is_active: !d.is_active })
  d.is_active = !d.is_active
}
</script>

<style scoped>
.delivery-admin { display:flex; flex-direction:column; gap:20px; }
.toolbar { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
.options-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:20px; }
.opt-header { display:flex; align-items:flex-start; gap:14px; margin-bottom:16px; }
.opt-icon { font-size:28px; flex-shrink:0; }
.opt-name { font-size:17px; font-weight:600; margin-bottom:3px; }
.opt-desc { font-size:13px; color:var(--gray); line-height:1.5; }
.opt-details { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; background:var(--cream); border-radius:var(--radius-md); padding:12px; }
.opt-detail { display:flex; flex-direction:column; gap:4px; }
.dl { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:var(--gray-light); }
.opt-price { font-size:16px; font-weight:700; color:var(--purple); }
.toggle { display:inline-flex; align-items:center; cursor:pointer; }
.toggle input { display:none; }
.toggle-track {
  width:36px; height:20px; border-radius:10px; background:var(--border);
  position:relative; transition:background var(--t);
}
.toggle-track::after {
  content:''; position:absolute; top:3px; left:3px;
  width:14px; height:14px; border-radius:50%; background:#fff;
  transition:transform var(--t);
}
.toggle input:checked + .toggle-track { background:var(--purple); }
.toggle input:checked + .toggle-track::after { transform:translateX(16px); }
.check-label { display:flex; align-items:center; gap:8px; font-size:14px; cursor:pointer; }
</style>
