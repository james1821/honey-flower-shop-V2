<template>
  <div class="products-admin">
   
    <div class="toolbar">
      <input v-model="search" class="form-input" placeholder="Search products…" style="max-width:260px" />
      <button class="btn btn-primary" @click="openNew">+ Add Product</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>Product</th><th>Type</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
        </tr></thead>
        <tbody>
          <tr v-for="p in products" :key="p.id">
            <td>
              <div class="product-cell">
                <img :src="p.images[0]" :alt="p.name" class="p-thumb" />
                <div>
                  <p class="p-name">{{ p.name }}</p>
                <p class="p-cat">{{ p.categories?.name }}</p>
                </div>
              </div>
            </td>
            <td><span class="badge" :class="typeBadge(p.type)">{{ typeLabel(p.type) }}</span></td>
            <td>
              <div>
                <strong>{{ fmt(p.sale_price ?? p.base_price) }}</strong>
                <span v-if="p.sale_price" class="old-price">{{ fmt(p.base_price) }}</span>
              </div>
              <p v-if="p.type==='money_bouquet'" class="money-note">+ ₱{{ p.money_min_amount }}–{{ p.money_max_amount }} cash</p>
            </td>
            <td>
              <span :class="p.stock_qty < 5 ? 'text-warn' : ''">{{ p.stock_qty }}</span>
            </td>
            <td>
              <label class="toggle">
                <input type="checkbox" :checked="p.is_active" @change="toggleActive(p)" />
                <span class="toggle-track"></span>
              </label>
            </td>
            <td>
              <div style="display:flex;gap:8px">
                <button class="btn btn-secondary btn-sm" @click="editProduct(p)">Edit</button>
                <button class="btn btn-danger btn-sm" @click="confirmDelete(p)">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

   
    <div class="pagination">
      <button class="btn btn-ghost btn-sm" :disabled="page===1" @click="page--">← Prev</button>
      <span>Page {{ page }} · {{ total }} total</span>
      <button class="btn btn-ghost btn-sm" :disabled="page * pageSize >= total" @click="page++">Next →</button>
    </div>

    
    <div v-if="showModal" class="modal-bg" @click.self="showModal=false">
      <div class="modal" style="max-width:680px">
        <div class="modal-header">
          <h2>{{ editing ? 'Edit Product' : 'New Product' }}</h2>
          <button class="modal-close" @click="showModal=false">✕</button>
        </div>
        <div class="modal-body" style="display:flex;flex-direction:column;gap:18px">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Product Name *</label>
              <input v-model="form.name" class="form-input" @input="autoSlug" />
            </div>
            <div class="form-group">
              <label class="form-label">Slug</label>
              <input v-model="form.slug" class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Short Description</label>
            <input v-model="form.short_description" class="form-input" placeholder="One line tagline" />
          </div>

          <div class="form-group">
            <label class="form-label">Full Description</label>
            <textarea v-model="form.description" class="form-textarea"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Product Type *</label>
              <select v-model="form.type" class="form-select">
               <option value="fresh_flowers">Fresh Flowers</option>
  <option value="money_bouquet">Money Bouquet</option>
  <option value="chocolate_bundle">Chocolate Bundle</option>
  <option value="handmade_flowers">Handmade Flowers</option>
  <option value="others">Others</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Category</label>
              <select v-model="form.category_id" class="form-select">
                <option value="">— None —</option>
                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Base Price (₱) *</label>
              <input v-model.number="form.base_price" type="number" class="form-input" min="0" step="1" />
            </div>
            <div class="form-group">
              <label class="form-label">Sale Price (₱) <span style="font-weight:400">(optional)</span></label>
              <input v-model.number="form.sale_price" type="number" class="form-input" min="0" step="1" placeholder="Leave blank if none" />
            </div>
          </div>

         
          <template v-if="form.type === 'money_bouquet'">
            <div class="money-fields">
              <p class="field-header">💵 Money Bouquet Settings</p>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Min Cash Amount (₱)</label>
                  <input v-model.number="form.money_min_amount" type="number" class="form-input" min="100" step="100" />
                </div>
                <div class="form-group">
                  <label class="form-label">Max Cash Amount (₱)</label>
                  <input v-model.number="form.money_max_amount" type="number" class="form-input" step="100" />
                </div>
                <div class="form-group">
                  <label class="form-label">Step (₱)</label>
                  <input v-model.number="form.money_step" type="number" class="form-input" min="100" step="100" />
                </div>
              </div>
            </div>
          </template>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Stock Quantity</label>
              <input v-model.number="form.stock_qty" type="number" class="form-input" min="0" />
            </div>
            <div class="form-group">
              <label class="form-label">Delivery Types</label>
              <div style="display:flex;gap:12px;margin-top:8px">
                <label class="check-label"><input type="checkbox" value="standard" v-model="form.delivery_types" /> Standard</label>
                <label class="check-label"><input type="checkbox" value="pickup" v-model="form.delivery_types" /> Pickup</label>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Image URLs (one per line)</label>
            <textarea v-model="imagesText" class="form-textarea" rows="3" placeholder="https://…"></textarea>
          </div>

          <div style="display:flex;gap:12px">
            <label class="check-label"><input type="checkbox" v-model="form.is_featured" /> Featured</label>
            <label class="check-label"><input type="checkbox" v-model="form.is_active" /> Active</label>
          </div>

          <p v-if="formErr" class="form-error">{{ formErr }}</p>

          <div style="display:flex;gap:12px;justify-content:flex-end">
            <button class="btn btn-secondary" @click="showModal=false">Cancel</button>
            <button class="btn btn-primary" :disabled="saving" @click="save">
              <span v-if="saving" class="spinner"></span>
              <span v-else>{{ editing ? 'Save Changes' : 'Create Product' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product, Category, ProductType } from '~/types'
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { adminGetProducts, adminUpsertProduct, adminDeleteProduct } = useAdmin()
const { getCategories } = useProducts()
const { fmt } = useCurrency()
const { success, error } = useToast()

const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const loading = ref(true)
const page = ref(1)
const pageSize = 20
const total = ref(0)
const search = ref('')
const showModal = ref(false)
const editing = ref(false)
const saving = ref(false)
const formErr = ref('')

const form = reactive<Partial<Product> & { id?: string }>({
  name: '', slug: '', short_description: '', description: '',
  type: 'flowers' as ProductType, category_id: '',
  base_price: 0, sale_price: undefined,
  images: [], is_active: true, is_featured: false, stock_qty: 0,
  delivery_types: ['standard'],
  money_min_amount: 500, money_max_amount: 20000, money_step: 500,
})

const imagesText = computed({
  get: () => (form.images ?? []).join('\n'),
  set: (v: string) => { form.images = v.split('\n').map(s => s.trim()).filter(Boolean) },
})

async function load() {
  loading.value = true
  const { data, count } = await adminGetProducts(page.value, pageSize, search.value)
  products.value = data ?? []
  total.value = count ?? 0
  loading.value = false
}

const { data: catData } = await useAsyncData('admin-cats', () => getCategories().then(r => r.data))
categories.value = catData.value ?? []

watch([page, search], useDebounceFn(load, 300))
await load()

function openNew() {
  editing.value = false
  Object.assign(form, {
    id: undefined, name: '', slug: '', short_description: '', description: '',
    type: 'flowers', category_id: '', base_price: 0, sale_price: undefined,
    images: [], is_active: true, is_featured: false, stock_qty: 0,
    delivery_types: ['standard'], money_min_amount: 500, money_max_amount: 20000, money_step: 500,
  })
  imagesText.value = ''
  formErr.value = ''
  showModal.value = true
}


function editProduct(p: Product) {
  editing.value = true
  Object.assign(form, {
  id: p.id,
  name: p.name,
  slug: p.slug,
  short_description: p.short_description,
  description: p.description,
  type: p.type,
  category_id: p.category_id,
  base_price: p.base_price,
  sale_price: p.sale_price,
  images: p.images,
  is_active: p.is_active,
  is_featured: p.is_featured,
  stock_qty: p.stock_qty,
  delivery_types: p.delivery_types,
  money_min_amount: p.money_min_amount,
  money_max_amount: p.money_max_amount,
  money_step: p.money_step,
})
  imagesText.value = (p.images ?? []).join('\n')
  formErr.value = ''
  showModal.value = true
}

function autoSlug() {
  if (!editing.value) {
    form.slug = (form.name ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }
}

async function save() {
  if (!form.name || !form.slug) { formErr.value = 'Name and slug are required'; return }
  if ((form.base_price ?? 0) < 0) { formErr.value = 'Price cannot be negative'; return }
  saving.value = true; formErr.value = ''
  const payload = { ...form, sale_price: form.sale_price || null }
  const { error: err } = await adminUpsertProduct(payload)
  saving.value = false
  if (err) { formErr.value = err.message; return }
  success(editing.value ? 'Product updated!' : 'Product created!')
  showModal.value = false
  await load()
}

async function toggleActive(p: Product) {
  await adminUpsertProduct({ id: p.id, is_active: !p.is_active })
  p.is_active = !p.is_active
}

async function confirmDelete(p: Product) {
  if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return

  const { error: err } = await adminDeleteProduct(p.id)

  if (err) {
    error('Delete failed: ' + err.message)
    return
  }

 
  products.value = products.value.filter(x => x.id !== p.id)
  total.value = total.value - 1
  success('Product deleted')

  await load()
}

const typeMap: Record<string, string> = {
  flowers: '🌸 Flowers',
  money_bouquet: '💵 Money',
  chocolate_bundle: '🍫 Bundle',
  handmade_bouquet: '💐 Handmade Flower',
  others: '📦 Others',
}

const typeBadgeMap: Record<string, string> = {
  flowers: 'badge-green',
  money_bouquet: 'badge-gold',
  chocolate_bundle: 'badge-blush',
  handmade_bouquet: 'badge-green',
  others: 'badge-gray',
}
function typeLabel(t: string) { return typeMap[t] ?? t }
function typeBadge(t: string) { return typeBadgeMap[t] ?? 'badge-gray' }
</script>

<style scoped>
.products-admin { display:flex; flex-direction:column; gap:20px; }
.toolbar { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
.product-cell { display:flex; align-items:center; gap:12px; }
.p-thumb { width:44px; height:44px; object-fit:cover; border-radius:var(--radius-sm); flex-shrink:0; }
.p-name { font-weight:600; font-size:14px; }
.p-cat  { font-size:12px; color:var(--gray); }
.old-price { font-size:12px; color:var(--gray-light); text-decoration:line-through; margin-left:6px; }
.money-note { font-size:11px; color:var(--gold); font-weight:600; }
.text-warn { color:var(--warning); font-weight:600; }
.pagination { display:flex; align-items:center; gap:16px; justify-content:center; font-size:14px; color:var(--gray); }
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
.money-fields {
  background:#fffdf5; border:1.5px solid #e8d48a; border-radius:var(--radius-md); padding:16px;
  display:flex; flex-direction:column; gap:14px;
}
.field-header { font-size:14px; font-weight:600; color:#7a5c10; }
.check-label { display:flex; align-items:center; gap:6px; font-size:14px; cursor:pointer; }
</style>
