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
          :class="`tilt-${i % 5}`"
          @click="openLightbox(i)"
        >
          <div class="collage-frame">
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
      </div>

      <!-- Skeleton loading -->
      <div v-else-if="loading" class="collage-grid">
        <div v-for="n in 6" :key="n" class="collage-cell">
          <div class="collage-frame"><div class="skeleton" style="width:100%;aspect-ratio:3/4"></div></div>
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
            <img :src="cldPad(item.image_url, 280, 360)" :alt="item.caption ?? ''" class="slide-img" loading="lazy" />
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

/* ── Collage Grid: Pinterest-style masonry, keeps portrait photos whole ── */
.collage-grid {
  column-count: 4; column-gap: 20px;
}
@media(max-width: 900px) { .collage-grid { column-count: 3; column-gap: 16px; } }
@media(max-width: 600px) { .collage-grid { column-count: 2; column-gap: 12px; } }

.collage-cell {
  break-inside: avoid; margin-bottom: 20px; cursor: pointer;
  transition: transform .25s var(--ease);
}
@media(max-width: 600px) { .collage-cell { margin-bottom: 12px; } }
.collage-cell:hover { transform: translateY(-4px); }

/* slight alternating tilt per card for a scrapbook feel, straightens on hover */
.tilt-0 { transform: rotate(-1.2deg); } .tilt-0:hover { transform: rotate(0deg) translateY(-4px); }
.tilt-1 { transform: rotate(1deg); }    .tilt-1:hover { transform: rotate(0deg) translateY(-4px); }
.tilt-2 { transform: rotate(-.6deg); }  .tilt-2:hover { transform: rotate(0deg) translateY(-4px); }
.tilt-3 { transform: rotate(.8deg); }   .tilt-3:hover { transform: rotate(0deg) translateY(-4px); }
.tilt-4 { transform: rotate(-.3deg); }  .tilt-4:hover { transform: rotate(0deg) translateY(-4px); }

.collage-frame {
  position: relative; border-radius: var(--radius-lg);
  overflow: hidden; background: #fff;
  padding: 8px 8px 0; box-shadow: var(--shadow-md);
}

.collage-img {
  width: 100%; height: auto; display: block;
  border-radius: calc(var(--radius-lg) - 6px) calc(var(--radius-lg) - 6px) 0 0;
  transition: transform .5s var(--ease);
}
.collage-cell:hover .collage-img { transform: scale(1.03); }

.collage-overlay {
  position: absolute; left: 8px; right: 8px; bottom: 0; top: 8px;
  background: linear-gradient(to top, rgba(0,0,0,.72) 0%, transparent 55%);
  opacity: 0; transition: opacity var(--t);
  display: flex; align-items: flex-end; padding: 16px;
  border-radius: calc(var(--radius-lg) - 6px) calc(var(--radius-lg) - 6px) 0 0;
}
.collage-cell:hover .collage-overlay { opacity: 1; }

/* the "paper" strip at the bottom of the frame, like a Polaroid caption area */
.collage-frame::after { content: ''; display: block; height: 10px; }

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
.slide-img { width: 100%; height: 360px; object-fit: cover; }
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