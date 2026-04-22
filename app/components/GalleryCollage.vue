<template>
  <section class="gallery-section">
    <div class="container">
      <div class="gallery-header">
        <div>
          <span class="eyebrow">Our Work & Happy Customers</span>
          <h2 class="gallery-title">Every Bouquet, a Memory</h2>
        </div>
        <div class="tab-pills">
          <button
            class="pill" :class="{ active: activeTab === 'all' }"
            @click="activeTab = 'all'"
          >All</button>
          <button
            class="pill" :class="{ active: activeTab === 'work' }"
            @click="activeTab = 'work'"
          >Our Work</button>
          <button
            class="pill" :class="{ active: activeTab === 'customer' }"
            @click="activeTab = 'customer'"
          >Customer Photos</button>
        </div>
      </div>

      <!-- Collage Grid -->
      <div v-if="!loading && filtered.length" class="collage-grid">
        <div
          v-for="(item, i) in filtered.slice(0, 9)"
          :key="item.id"
          class="collage-cell"
          :class="getCellClass(i)"
          @click="openLightbox(i)"
        >
          <img :src="item.image_url" :alt="item.caption ?? 'Gallery'" class="collage-img" loading="lazy" />
          <div class="collage-overlay">
            <div class="overlay-content">
              <p v-if="item.caption" class="overlay-caption">{{ item.caption }}</p>
              <div v-if="item.customer_name" class="overlay-customer">
                <span class="customer-name">— {{ item.customer_name }}</span>
                <div v-if="item.rating" class="stars">
                  <span v-for="s in item.rating" :key="s">★</span>
                </div>
              </div>
            </div>
          </div>
          <span v-if="item.type === 'customer'" class="customer-badge">📸 Customer</span>
        </div>
      </div>

      <!-- Skeleton loading -->
      <div v-else-if="loading" class="collage-grid">
        <div v-for="n in 6" :key="n" class="collage-cell" :class="getCellClass(n-1)">
          <div class="skeleton" style="width:100%;height:100%"></div>
        </div>
      </div>

      <!-- Slider for remaining items -->
      <div v-if="!loading && filtered.length > 9" class="slider-wrap">
        <p class="slider-label">More Photos</p>
        <div class="slider-track" ref="sliderRef">
          <div
            v-for="item in filtered.slice(9)"
            :key="item.id"
            class="slide"
            @click="openLightbox(filtered.indexOf(item))"
          >
            <img :src="item.image_url" :alt="item.caption ?? ''" class="slide-img" loading="lazy" />
            <div class="slide-info">
              <p v-if="item.caption" class="slide-caption">{{ item.caption }}</p>
              <p v-if="item.customer_name" class="slide-customer">— {{ item.customer_name }}</p>
            </div>
          </div>
        </div>
        <div class="slider-controls">
          <button class="slider-btn" @click="scrollSlider(-1)">←</button>
          <button class="slider-btn" @click="scrollSlider(1)">→</button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!loading && !filtered.length" class="gallery-empty">
        <p>No photos yet.</p>
      </div>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <div v-if="lightboxOpen" class="lightbox" @click.self="lightboxOpen = false">
        <button class="lb-close" @click="lightboxOpen = false">✕</button>
        <button class="lb-prev" @click="prevPhoto">←</button>
        <button class="lb-next" @click="nextPhoto">→</button>

        <div class="lb-content">
          <img :src="filtered[lbIndex]?.image_url" :alt="filtered[lbIndex]?.caption ?? ''" class="lb-img" />
          <div class="lb-info">
            <p v-if="filtered[lbIndex]?.caption" class="lb-caption">{{ filtered[lbIndex]?.caption }}</p>
            <div v-if="filtered[lbIndex]?.customer_name" class="lb-customer">
              <span>— {{ filtered[lbIndex]?.customer_name }}</span>
              <div v-if="filtered[lbIndex]?.rating" class="lb-stars">
                <span v-for="s in filtered[lbIndex]?.rating" :key="s">★</span>
              </div>
            </div>
            <span class="lb-counter">{{ lbIndex + 1 }} / {{ filtered.length }}</span>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import type { GalleryItem } from '~/composables/useGallery'

const { getGalleryItems } = useGallery()

const items = ref<GalleryItem[]>([])
const loading = ref(true)
const activeTab = ref<'all' | 'work' | 'customer'>('all')
const lightboxOpen = ref(false)
const lbIndex = ref(0)
const sliderRef = ref<HTMLElement>()

const filtered = computed(() => {
  if (activeTab.value === 'all') return items.value
  return items.value.filter(i => i.type === activeTab.value)
})

onMounted(async () => {
  const { data } = await getGalleryItems()
  items.value = data ?? []
  loading.value = false
})

// Collage layout pattern — varies cell sizes
function getCellClass(i: number): string {
  const pattern = ['tall', 'normal', 'normal', 'wide', 'normal', 'normal', 'normal', 'tall', 'normal']
  return pattern[i % pattern.length] ?? 'normal'
}

function openLightbox(index: number) {
  lbIndex.value = index
  lightboxOpen.value = true
}

function nextPhoto() {
  lbIndex.value = (lbIndex.value + 1) % filtered.value.length
}

function prevPhoto() {
  lbIndex.value = (lbIndex.value - 1 + filtered.value.length) % filtered.value.length
}

function scrollSlider(dir: number) {
  if (!sliderRef.value) return
  sliderRef.value.scrollBy({ left: dir * 320, behavior: 'smooth' })
}

// Keyboard navigation
onMounted(() => {
  window.addEventListener('keydown', onKey)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
})
function onKey(e: KeyboardEvent) {
  if (!lightboxOpen.value) return
  if (e.key === 'ArrowRight') nextPhoto()
  if (e.key === 'ArrowLeft') prevPhoto()
  if (e.key === 'Escape') lightboxOpen.value = false
}
</script>

<style scoped>
.gallery-section { padding: 80px 0; background: var(--cream); }

.gallery-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  flex-wrap: wrap; gap: 20px; margin-bottom: 40px;
}
.eyebrow {
  font-size: 12px; font-weight: 700; letter-spacing: .1em;
  text-transform: uppercase; color: var(--purple); display: block; margin-bottom: 8px;
}
.gallery-title { font-size: clamp(28px, 4vw, 42px); }
.tab-pills { display: flex; gap: 8px; flex-wrap: wrap; }
.pill {
  padding: 8px 18px; border-radius: var(--radius-full);
  border: 1.5px solid var(--border); background: #fff;
  font-size: 13px; color: var(--gray); cursor: pointer; transition: all var(--t);
}
.pill:hover, .pill.active { background: var(--purple); color: #fff; border-color: var(--purple); }

/* ── Collage Grid ────────────────────────────────────────────────── */
.collage-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 200px;
  gap: 12px;
}
@media(max-width: 900px) { .collage-grid { grid-template-columns: repeat(2, 1fr); } }
@media(max-width: 500px) { .collage-grid { grid-template-columns: 1fr 1fr; grid-auto-rows: 160px; } }

.collage-cell {
  position: relative; border-radius: var(--radius-lg);
  overflow: hidden; cursor: pointer;
  background: var(--cream-dark);
}
.collage-cell.tall  { grid-row: span 2; }
.collage-cell.wide  { grid-column: span 2; }

.collage-img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform .5s var(--ease);
}
.collage-cell:hover .collage-img { transform: scale(1.06); }

.collage-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 50%);
  opacity: 0; transition: opacity var(--t);
  display: flex; align-items: flex-end; padding: 16px;
}
.collage-cell:hover .collage-overlay { opacity: 1; }

.overlay-content { color: #fff; }
.overlay-caption { font-size: 14px; font-weight: 500; margin-bottom: 4px; }
.overlay-customer { display: flex; align-items: center; gap: 8px; }
.customer-name { font-size: 13px; opacity: .85; }
.stars { color: #f5c842; font-size: 12px; letter-spacing: 1px; }

.customer-badge {
  position: absolute; top: 10px; right: 10px;
  background: rgba(0,0,0,.55); color: #fff;
  font-size: 11px; padding: 4px 10px; border-radius: var(--radius-full);
  backdrop-filter: blur(4px);
}

/* ── Slider ──────────────────────────────────────────────────────── */
.slider-wrap { margin-top: 24px; }
.slider-label { font-size: 13px; font-weight: 600; color: var(--gray); margin-bottom: 12px; }
.slider-track {
  display: flex; gap: 12px; overflow-x: auto;
  scroll-snap-type: x mandatory; padding-bottom: 8px;
  scrollbar-width: none;
}
.slider-track::-webkit-scrollbar { display: none; }
.slide {
  flex-shrink: 0; width: 280px; border-radius: var(--radius-lg);
  overflow: hidden; scroll-snap-align: start; cursor: pointer;
  border: 1px solid var(--border); background: #fff;
  transition: transform var(--t), box-shadow var(--t);
}
.slide:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
.slide-img { width: 100%; height: 200px; object-fit: cover; }
.slide-info { padding: 12px 14px; }
.slide-caption { font-size: 14px; font-weight: 500; margin-bottom: 4px; }
.slide-customer { font-size: 13px; color: var(--gray); }
.slider-controls { display: flex; gap: 10px; margin-top: 14px; justify-content: flex-end; }
.slider-btn {
  width: 40px; height: 40px; border-radius: 50%;
  border: 1.5px solid var(--border); background: #fff;
  font-size: 16px; cursor: pointer; transition: all var(--t);
  display: flex; align-items: center; justify-content: center;
}
.slider-btn:hover { background: var(--purple); color: #fff; border-color: var(--purple); }

/* ── Lightbox ────────────────────────────────────────────────────── */
.lightbox {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(0,0,0,.92);
  display: flex; align-items: center; justify-content: center;
  padding: 24px; animation: fadeIn .2s var(--ease);
}
.lb-close {
  position: absolute; top: 20px; right: 20px;
  background: rgba(255,255,255,.1); color: #fff; border: none;
  width: 40px; height: 40px; border-radius: 50%; font-size: 18px;
  cursor: pointer; transition: background var(--t);
}
.lb-close:hover { background: rgba(255,255,255,.25); }
.lb-prev, .lb-next {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: rgba(255,255,255,.1); color: #fff; border: none;
  width: 48px; height: 48px; border-radius: 50%; font-size: 20px;
  cursor: pointer; transition: background var(--t);
}
.lb-prev { left: 20px; }
.lb-next { right: 20px; }
.lb-prev:hover, .lb-next:hover { background: rgba(255,255,255,.25); }
.lb-content { max-width: 860px; width: 100%; display: flex; flex-direction: column; gap: 16px; }
.lb-img { width: 100%; max-height: 75vh; object-fit: contain; border-radius: var(--radius-lg); }
.lb-info { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
.lb-caption { font-size: 16px; font-weight: 500; color: #fff; }
.lb-customer { display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,.75); font-size: 14px; }
.lb-stars { color: #f5c842; font-size: 14px; letter-spacing: 1px; }
.lb-counter { font-size: 13px; color: rgba(255,255,255,.5); margin-left: auto; }

.gallery-empty { text-align: center; padding: 60px; color: var(--gray); }
</style>