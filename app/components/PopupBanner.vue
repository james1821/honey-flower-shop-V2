<template>
  <Teleport to="body">
    <Transition name="popup">
      <div v-if="visible" class="popup-overlay" @click.self="close">
        <div class="popup-box">

        
          <button class="popup-close" @click="close" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

       
          <a
            v-if="popup.link_url"
            :href="popup.link_url"
            class="popup-img-wrap"
            @click="close"
          >
            <img :src="popup.image_url" alt="Florette Promotion" class="popup-img" />
          </a>
          <div v-else class="popup-img-wrap">
            <img :src="popup.image_url" alt="Florette Promotion" class="popup-img" />
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { PopupBanner } from '~/composables/usePopup'

const props = defineProps<{ popup: PopupBanner }>()
const { markPopupSeen } = usePopup()

const visible = ref(false)

onMounted(() => {
 
  setTimeout(() => { visible.value = true }, 600)
})

function close() {
  visible.value = false
  markPopupSeen()
}
</script>

<style scoped>
.popup-overlay {
  position: fixed; inset: 0; z-index: 400;
  background: rgba(0, 0, 0, 0.6);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  backdrop-filter: blur(3px);
}

.popup-box {
  position: relative;
  max-width: 540px;
  width: 100%;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.popup-close {
  position: absolute; top: 12px; right: 12px; z-index: 10;
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(0, 0, 0, 0.5); color: #fff;
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background var(--t);
}
.popup-close:hover { background: rgba(0, 0, 0, 0.8); }

.popup-img-wrap {
  display: block; line-height: 0;
  cursor: v-bind("popup.link_url ? 'pointer' : 'default'");
}

.popup-img {
  width: 100%; height: auto;
  max-height: 80vh; object-fit: cover;
  display: block;
  transition: transform .4s var(--ease);
}
.popup-img-wrap:hover .popup-img {
  transform: v-bind("popup.link_url ? 'scale(1.02)' : 'none'");
}


.popup-enter-active {
  animation: popupIn .35s cubic-bezier(.34,1.56,.64,1);
}
.popup-leave-active {
  animation: popupOut .2s ease forwards;
}
.popup-enter-from .popup-box,
.popup-leave-to .popup-box {
  opacity: 0; transform: scale(.92);
}

@keyframes popupIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes popupOut {
  from { opacity: 1; }
  to   { opacity: 0; }
}
</style>