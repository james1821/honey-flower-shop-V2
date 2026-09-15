<template>
  <div class="img-uploader">
    <!-- Multiple images (e.g. product gallery) -->
    <div v-if="multiple" class="img-grid">
      <div v-for="(url, idx) in listValue" :key="url + idx" class="img-slot filled">
        <img :src="url" alt="" />
        <button type="button" class="remove-btn" title="Remove" @click="removeAt(idx)">✕</button>
      </div>
      <label v-if="listValue.length < max" class="img-slot add-slot" :class="{ busy: uploading }">
        <input type="file" accept="image/*" multiple :disabled="uploading" hidden @change="onFilesSelected" />
        <span v-if="uploading" class="add-label">
          <span class="spinner"></span>{{ progressLabel || 'Uploading…' }}
        </span>
        <span v-else class="add-label">+ Add Photo</span>
      </label>
    </div>

    <!-- Single image (e.g. gallery photo, popup banner) -->
    <div v-else class="single-wrap">
      <div v-if="singleValue" class="img-slot filled large">
        <img :src="singleValue" alt="" />
        <button type="button" class="remove-btn" title="Remove" @click="clearSingle">✕</button>
      </div>
      <label v-else class="img-slot add-slot large" :class="{ busy: uploading }">
        <input type="file" accept="image/*" :disabled="uploading" hidden @change="onFilesSelected" />
        <span v-if="uploading" class="add-label">
          <span class="spinner"></span>{{ progressLabel || 'Uploading…' }}
        </span>
        <span v-else class="add-label">+ Upload Image</span>
      </label>

      <button
        v-if="singleValue"
        type="button"
        class="btn btn-secondary btn-sm"
        style="margin-top:8px"
        :disabled="uploading"
        @click="replaceInput?.click()"
      >
        {{ uploading ? (progressLabel || 'Uploading…') : 'Replace Image' }}
      </button>
      <input ref="replaceInput" type="file" accept="image/*" hidden @change="onFilesSelected" />
    </div>

    <p class="hint">Images are compressed automatically before upload — no need to resize first.</p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string | string[] | undefined
  multiple?: boolean
  folder: string
  max?: number
}>(), { multiple: false, max: 5 })

const emit = defineEmits<{ 'update:modelValue': [string | string[]] }>()

const { uploading, progressLabel, uploadImages, deleteImageByUrl } = useImageUpload()
const { success, error } = useToast()
const replaceInput = ref<HTMLInputElement>()

const listValue = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []))
const singleValue = computed(() => (typeof props.modelValue === 'string' ? props.modelValue : ''))

async function onFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''
  if (!files.length) return

  try {
    if (props.multiple) {
      const room = Math.max(props.max - listValue.value.length, 0)
      if (!room) { error(`You can add up to ${props.max} photos`); return }
      const uploaded = await uploadImages(files.slice(0, room), props.folder)
      emit('update:modelValue', [...listValue.value, ...uploaded.map(u => u.url)])
    } else {
      const previous = singleValue.value
      const firstFile = files[0]
      if (!firstFile) return
      const uploaded = (await uploadImages([firstFile], props.folder))[0]
      if (!uploaded) return
      emit('update:modelValue', uploaded.url)
      if (previous) await deleteImageByUrl(previous)
    }
    success('Image uploaded')
  } catch (err: any) {
    error('Upload failed: ' + (err?.message ?? 'unknown error'))
  }
}

async function removeAt(idx: number) {
  const next = [...listValue.value]
  const [removed] = next.splice(idx, 1)
  emit('update:modelValue', next)
  if (removed) await deleteImageByUrl(removed)
}

async function clearSingle() {
  const previous = singleValue.value
  emit('update:modelValue', '')
  if (previous) await deleteImageByUrl(previous)
}
</script>

<style scoped>
.img-uploader { display:flex; flex-direction:column; gap:8px; }
.img-grid { display:flex; flex-wrap:wrap; gap:10px; }
.img-slot {
  position:relative; width:96px; height:96px; border-radius:var(--radius-md);
  overflow:hidden; flex-shrink:0;
}
.img-slot.large { width:100%; max-width:280px; height:200px; }
.img-slot.filled { border:1.5px solid var(--border); }
.img-slot.filled img { width:100%; height:100%; object-fit:cover; display:block; }
.img-slot.add-slot {
  display:flex; align-items:center; justify-content:center; text-align:center;
  border:1.5px dashed var(--border); background:var(--cream); cursor:pointer;
  font-size:12px; color:var(--gray); transition:all var(--t); padding:6px;
}
.img-slot.add-slot:hover { border-color:var(--purple); color:var(--purple); }
.img-slot.add-slot.busy { cursor:wait; opacity:.8; }
.add-label { display:flex; flex-direction:column; align-items:center; gap:6px; }
.remove-btn {
  position:absolute; top:4px; right:4px; width:20px; height:20px; border-radius:50%;
  background:rgba(0,0,0,.6); color:#fff; border:none; font-size:11px; cursor:pointer;
  display:flex; align-items:center; justify-content:center; line-height:1;
}
.hint { font-size:12px; color:var(--gray-light); }
.spinner { width:14px; height:14px; border-width:2px; }
</style>
