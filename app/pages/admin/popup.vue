<template>
  <div class="popup-admin">

    <div class="preview-section card">
      <div class="card-header">
        <h3>Live Preview</h3>
        <span class="badge" :class="form.is_active ? 'badge-success' : 'badge-gray'">
          {{ form.is_active ? '● Active' : '○ Disabled' }}
        </span>
      </div>
      <div class="card-body preview-body">
        <div v-if="form.image_url" class="popup-preview">
          <div class="preview-box">
            <button class="preview-close">✕</button>
            <img :src="form.image_url" alt="Preview" class="preview-img" />
          </div>
          <p class="preview-hint">This is how the popup looks to visitors</p>
        </div>
        <div v-else class="preview-empty">
          <p>No image set yet — add an image URL below</p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><h3>Popup Settings</h3></div>
      <div class="card-body settings-body">

    
        <div class="setting-row">
          <div>
            <p class="setting-label">Show Popup to Visitors</p>
            <p class="setting-desc">When enabled, the popup appears on the first visit of each session</p>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="form.is_active" />
            <span class="toggle-track"></span>
          </label>
        </div>

        <hr>

    
        <div class="form-group">
          <label class="form-label">Popup Image URL *</label>
          <input
            v-model="form.image_url"
            class="form-input"
            placeholder="https://your-image-url.com/promo.jpg"
          />
          <p class="form-hint">Use a high-quality image. Recommended size: 540×400px or wider. Supports any public image URL.</p>
        </div>

      
        <div class="form-group">
          <label class="form-label">Click-through URL <span style="font-weight:400;text-transform:none">(optional)</span></label>
          <input
            v-model="form.link_url"
            class="form-input"
            placeholder="e.g. /shop or https://yoursite.com/promo"
          />
          <p class="form-hint">When set, clicking the image redirects the visitor to this URL and closes the popup.</p>
        </div>

        <p v-if="formErr" class="form-error">{{ formErr }}</p>
        <p v-if="savedMsg" class="save-msg">✓ {{ savedMsg }}</p>

    
        <div class="form-actions">
          <button class="btn btn-secondary" @click="resetSession">
             Re-show Popup (Test)
          </button>
          <button class="btn btn-primary" :disabled="saving" @click="save">
            <span v-if="saving" class="spinner"></span>
            <span v-else>Save Changes</span>
          </button>
        </div>

        <div class="last-updated" v-if="current?.updated_at">
          Last updated: {{ formatDate(current.updated_at) }}
        </div>
      </div>
    </div>


    <div class="help-card card">
      <div class="card-body">
        <h4>💡 How it works</h4>
        <ul class="help-list">
          <li>The popup appears automatically on a visitor's <strong>first page load per session</strong></li>
          <li>Once they close it, it won't appear again until they open a new browser session</li>
          <li>Clicking outside the popup or the ✕ button dismisses it</li>
          <li>If a <strong>Click-through URL</strong> is set, clicking the image navigates there</li>
          <li>Use the <strong>"Re-show Popup (Test)"</strong> button to preview it as a first-time visitor</li>
        </ul>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { PopupBanner } from '~/composables/usePopup'
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { adminGetPopup, adminSavePopup } = usePopup()
const { success, error } = useToast()

const current = ref<PopupBanner | null>(null)
const saving = ref(false)
const formErr = ref('')
const savedMsg = ref('')

const form = reactive({
  id: undefined as string | undefined,
  image_url: '',
  link_url: '',
  is_active: false,
})

onMounted(async () => {
  const { data } = await adminGetPopup()
  if (data) {
    current.value = data
    Object.assign(form, {
      id: data.id,
      image_url: data.image_url,
      link_url: data.link_url ?? '',
      is_active: data.is_active,
    })
  }
})

async function save() {
  if (!form.image_url) { formErr.value = 'Image URL is required'; return }
  saving.value = true; formErr.value = ''; savedMsg.value = ''

  const { data, error: err } = await adminSavePopup({
    id: form.id,
    image_url: form.image_url,
    link_url: form.link_url || null,
    is_active: form.is_active,
  })

  saving.value = false

  if (err) { formErr.value = err.message; return }

  if (data) {
    current.value = data as PopupBanner
    form.id = (data as PopupBanner).id
  }

  savedMsg.value = 'Changes saved! Visitors will see the updated popup.'
  success('Popup settings saved!')
  setTimeout(() => { savedMsg.value = '' }, 4000)
}


function resetSession() {
  sessionStorage.removeItem('florette_popup_seen')
  success('Session cleared — reload the homepage to see the popup again')
//   console.log('Popup session reset by admin for testing purposes')
}

function formatDate(d: string) {
  return new Date(d).toLocaleString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
</script>

<style scoped>
.popup-admin { display:flex; flex-direction:column; gap:24px; }


.preview-body { padding: 24px; }
.popup-preview { display:flex; flex-direction:column; align-items:center; gap:14px; }
.preview-box {
  position: relative; width: 100%; max-width: 400px;
  border-radius: var(--radius-xl); overflow: hidden;
  box-shadow: var(--shadow-lg); border: 2px dashed var(--border);
}
.preview-close {
  position: absolute; top: 10px; right: 10px;
  width: 30px; height: 30px; border-radius: 50%;
  background: rgba(0,0,0,.5); color: #fff; border: none;
  font-size: 13px; display:flex; align-items:center; justify-content:center;
  cursor: default;
}
.preview-img { width:100%; height:auto; display:block; max-height:300px; object-fit:cover; }
.preview-hint { font-size: 13px; color: var(--gray); }
.preview-empty {
  text-align:center; padding:48px; color:var(--gray-light);
  border: 2px dashed var(--border); border-radius: var(--radius-lg); width:100%;
}


.settings-body { padding:24px; display:flex; flex-direction:column; gap:20px; }
.setting-row { display:flex; align-items:flex-start; justify-content:space-between; gap:24px; }
.setting-label { font-size:15px; font-weight:600; margin-bottom:3px; }
.setting-desc  { font-size:13px; color:var(--gray); line-height:1.5; }

.form-actions { display:flex; gap:12px; justify-content:flex-end; flex-wrap:wrap; margin-top:4px; }
.save-msg { font-size:13px; color:var(--success); font-weight:500; }
.last-updated { font-size:12px; color:var(--gray-light); text-align:right; }


.toggle { display:inline-flex; align-items:center; cursor:pointer; flex-shrink:0; }
.toggle input { display:none; }
.toggle-track {
  width:44px; height:24px; border-radius:12px; background:var(--border);
  position:relative; transition:background var(--t);
}
.toggle-track::after {
  content:''; position:absolute; top:3px; left:3px;
  width:18px; height:18px; border-radius:50%; background:#fff;
  transition:transform var(--t); box-shadow:var(--shadow-xs);
}
.toggle input:checked + .toggle-track { background:var(--purple); }
.toggle input:checked + .toggle-track::after { transform:translateX(20px); }


.help-card .card-body { padding:20px 24px; }
.help-card h4 { font-size:15px; font-weight:600; margin-bottom:12px; }
.help-list { display:flex; flex-direction:column; gap:8px; padding-left:4px; }
.help-list li { font-size:14px; color:var(--gray); line-height:1.6; list-style:disc; margin-left:16px; }
</style>