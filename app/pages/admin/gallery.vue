<template>
  <div class="gallery-admin">
    <div class="toolbar">
      <div class="tab-pills">
        <button class="pill" :class="{ active: filterType === 'all' }" @click="filterType = 'all'">All ({{ items.length }})</button>
        <button class="pill" :class="{ active: filterType === 'work' }" @click="filterType = 'work'">Our Work</button>
        <button class="pill" :class="{ active: filterType === 'customer' }" @click="filterType = 'customer'">Customer Photos</button>
      </div>
      <button class="btn btn-primary" @click="openNew">+ Add Photo</button>
    </div>

  
    <div v-if="loading" class="admin-grid">
      <div v-for="n in 6" :key="n" class="skeleton" style="height:220px;border-radius:var(--radius-lg)"></div>
    </div>

    <div v-else-if="filtered.length" class="admin-grid">
      <div v-for="item in filtered" :key="item.id" class="gallery-card">
     
        <div class="gc-img-wrap">
          <img :src="item.image_url" :alt="item.caption ?? ''" class="gc-img" />
          <span class="gc-type-badge" :class="item.type === 'work' ? 'work' : 'customer'">
            {{ item.type === 'work' ? '📷 Work' : '📸 Customer' }}
          </span>
      
          <div class="gc-status" :class="{ inactive: !item.is_active }">
            {{ item.is_active ? 'Active' : 'Hidden' }}
          </div>
        </div>

       
        <div class="gc-info">
          <p class="gc-caption">{{ item.caption || '—' }}</p>
          <p v-if="item.customer_name" class="gc-customer">{{ item.customer_name }}</p>
          <div v-if="item.rating" class="gc-stars">
            <span v-for="s in 5" :key="s" :class="s <= item.rating! ? 'star-on' : 'star-off'">★</span>
          </div>
          <p class="gc-order">Order: {{ item.sort_order }}</p>
        </div>

      
        <div class="gc-actions">
          <button class="btn btn-secondary btn-sm" style="flex:1" @click="editItem(item)">Edit</button>
          <button
            class="btn btn-sm"
            :class="item.is_active ? 'btn-secondary' : 'btn-primary'"
            @click="toggleActive(item)"
          >{{ item.is_active ? 'Hide' : 'Show' }}</button>
          <button class="btn btn-danger btn-sm" @click="deleteItem(item)">✕</button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>No photos yet. Add your first one!</p>
    </div>

    
    <div v-if="showModal" class="modal-bg" @click.self="showModal = false">
      <div class="modal" style="max-width:540px">
        <div class="modal-header">
          <h2>{{ editing ? 'Edit Photo' : 'Add Photo' }}</h2>
          <button class="modal-close" @click="showModal = false">✕</button>
        </div>
        <div class="modal-body" style="display:flex;flex-direction:column;gap:16px">

          
          <div v-if="form.image_url" class="img-preview">
            <img :src="form.image_url" alt="Preview" />
          </div>

          <div class="form-group">
            <label class="form-label">Image URL *</label>
            <input v-model="form.image_url" class="form-input" placeholder="https://…" />
            <p class="form-hint">Paste a direct image URL (Unsplash, your CDN, Google Drive public link, etc.)</p>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Type *</label>
              <select v-model="form.type" class="form-select">
                <option value="work">📷 Our Work</option>
                <option value="customer">📸 Customer Photo</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Sort Order</label>
              <input v-model.number="form.sort_order" type="number" class="form-input" min="0" />
              <p class="form-hint">Lower = appears first</p>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Caption</label>
            <input v-model="form.caption" class="form-input" placeholder="e.g. Blush Romance Arrangement" />
          </div>

         
          <template v-if="form.type === 'customer'">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Customer Name</label>
                <input v-model="form.customer_name" class="form-input" placeholder="e.g. Maria Santos" />
              </div>
              <div class="form-group">
                <label class="form-label">Rating</label>
                <div class="star-picker">
                  <button
                    v-for="s in 5" :key="s"
                    class="star-btn"
                    :class="{ active: (form.rating ?? 0) >= s }"
                    @click="form.rating = s"
                  >★</button>
                </div>
              </div>
            </div>
          </template>

          <label class="check-label">
            <input type="checkbox" v-model="form.is_active" />
            Visible on website
          </label>

          <p v-if="formErr" class="form-error">{{ formErr }}</p>

          <div style="display:flex;gap:12px;justify-content:flex-end">
            <button class="btn btn-secondary" @click="showModal = false">Cancel</button>
            <button class="btn btn-primary" :disabled="saving" @click="save">
              <span v-if="saving" class="spinner"></span>
              <span v-else>{{ editing ? 'Save Changes' : 'Add Photo' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GalleryItem } from '~/composables/useGallery'
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { adminGetAllGallery, adminUpsertGalleryItem, adminDeleteGalleryItem } = useGallery()
const { success, error } = useToast()

const items = ref<GalleryItem[]>([])
const loading = ref(true)
const filterType = ref<'all' | 'work' | 'customer'>('all')
const showModal = ref(false)
const editing = ref(false)
const saving = ref(false)
const formErr = ref('')

const form = reactive<Partial<GalleryItem>>({
  type: 'work', image_url: '', caption: '',
  customer_name: '', rating: null, sort_order: 0, is_active: true,
})

const filtered = computed(() => {
  if (filterType.value === 'all') return items.value
  return items.value.filter(i => i.type === filterType.value)
})

async function load() {
  loading.value = true
  const { data } = await adminGetAllGallery()
  items.value = data ?? []
  loading.value = false
}
await load()

function openNew() {
  editing.value = false
  Object.assign(form, {
    id: undefined, type: 'work', image_url: '', caption: '',
    customer_name: '', rating: null,
    sort_order: items.value.length + 1,
    is_active: true,
  })
  formErr.value = ''
  showModal.value = true
}

function editItem(item: GalleryItem) {
  editing.value = true
  Object.assign(form, { ...item })
  formErr.value = ''
  showModal.value = true
}

async function save() {
  if (!form.image_url) { formErr.value = 'Image URL is required'; return }
  saving.value = true; formErr.value = ''

  const payload = {
    ...form,
    customer_name: form.type === 'customer' ? (form.customer_name || null) : null,
    rating: form.type === 'customer' ? (form.rating || null) : null,
  }

  const { error: err } = await adminUpsertGalleryItem(payload)
  saving.value = false

  if (err) { formErr.value = err.message; return }

  success(editing.value ? 'Photo updated!' : 'Photo added!')
  showModal.value = false
  await load()
}

async function toggleActive(item: GalleryItem) {
  await adminUpsertGalleryItem({ id: item.id, is_active: !item.is_active })
  item.is_active = !item.is_active
  success(item.is_active ? 'Photo visible' : 'Photo hidden')
}

async function deleteItem(item: GalleryItem) {
  if (!confirm(`Delete this photo? This cannot be undone.`)) return
  const { error: err } = await adminDeleteGalleryItem(item.id)
  if (err) { error(err.message); return }
  items.value = items.value.filter(i => i.id !== item.id)
  success('Photo deleted')
}
</script>

<style scoped>
.gallery-admin { display:flex; flex-direction:column; gap:20px; }
.toolbar { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
.tab-pills { display:flex; gap:8px; flex-wrap:wrap; }
.pill { padding:7px 16px; border-radius:var(--radius-full); border:1.5px solid var(--border); background:#fff; font-size:13px; color:var(--gray); cursor:pointer; transition:all var(--t); }
.pill:hover, .pill.active { background:var(--purple); color:#fff; border-color:var(--purple); }

.admin-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:16px; }
.gallery-card { background:#fff; border-radius:var(--radius-lg); border:1px solid var(--border); overflow:hidden; display:flex; flex-direction:column; }

.gc-img-wrap { position:relative; aspect-ratio:4/3; overflow:hidden; }
.gc-img { width:100%; height:100%; object-fit:cover; }
.gc-type-badge {
  position:absolute; top:8px; left:8px;
  padding:3px 10px; border-radius:var(--radius-full);
  font-size:11px; font-weight:700;
  backdrop-filter:blur(6px);
}
.gc-type-badge.work { background:rgba(61,107,71,.85); color:#fff; }
.gc-type-badge.customer { background:rgba(232,180,184,.9); color:#5a2a30; }

.gc-status {
  position:absolute; top:8px; right:8px;
  background:rgba(46,125,82,.85); color:#fff;
  font-size:10px; font-weight:700; padding:3px 8px;
  border-radius:var(--radius-full); text-transform:uppercase; letter-spacing:.04em;
}
.gc-status.inactive { background:rgba(107,101,96,.7); }

.gc-info { padding:12px 14px; flex:1; display:flex; flex-direction:column; gap:4px; }
.gc-caption { font-size:14px; font-weight:500; line-height:1.3; }
.gc-customer { font-size:12px; color:var(--gray); }
.gc-order { font-size:11px; color:var(--gray-light); }
.gc-stars { display:flex; gap:2px; }
.star-on { color:#f5c842; font-size:13px; }
.star-off { color:var(--border); font-size:13px; }

.gc-actions { padding:10px 12px; border-top:1px solid var(--border); display:flex; gap:6px; }

.img-preview { border-radius:var(--radius-md); overflow:hidden; max-height:200px; }
.img-preview img { width:100%; height:200px; object-fit:cover; }

.star-picker { display:flex; gap:4px; margin-top:6px; }
.star-btn { background:none; border:none; font-size:24px; color:var(--border); cursor:pointer; transition:color var(--t); padding:0; }
.star-btn.active { color:#f5c842; }

.check-label { display:flex; align-items:center; gap:8px; font-size:14px; cursor:pointer; }
.empty-state { text-align:center; padding:60px; color:var(--gray); font-size:16px; }
</style>