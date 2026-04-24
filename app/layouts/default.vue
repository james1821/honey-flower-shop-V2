<template>
  <div class="site-wrap">
    <TheNav />
    <main class="site-main"><slot /></main>
    <TheFooter />
    <CartDrawer />


    <PopupBanner v-if="popup" :popup="popup" />
  </div>
</template>

<script setup lang="ts">
const { getPopup, hasSeenPopup } = usePopup()

const popup = ref<any>(null)

onMounted(async () => {

  if (hasSeenPopup()) return

  const { data } = await getPopup()
  if (data) popup.value = data
})
</script>

<style scoped>
.site-wrap { display:flex; flex-direction:column; min-height:100vh; }
.site-main  { flex:1; padding-top:var(--nav-h); }
</style>