<template>
  <header class="topbar">
    <div class="topbar-left">
      <h2 class="page-name">{{ title }}</h2>
    </div>
    <div class="topbar-right">
      <span class="admin-badge">Admin</span>
      <span class="user-email">{{ user?.email }}</span>
    </div>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()
const user = useSupabaseUser()

const titleMap: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/orders': 'Orders',
  '/admin/customers': 'Customers',
  '/admin/promos': 'Promo Codes',
  '/admin/delivery': 'Delivery Options',
}
const title = computed(() => titleMap[route.path] ?? 'Admin')
</script>

<style scoped>
.topbar {
  height: 60px; background: #fff; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 32px; flex-shrink: 0;
}
.page-name { font-size: 17px; font-weight: 600; }
.topbar-right { display:flex; align-items:center; gap:12px; }
.admin-badge { background:var(--purple-pale); color:var(--purple); font-size:11px; font-weight:700; padding:3px 10px; border-radius:var(--radius-full); text-transform:uppercase; letter-spacing:.06em; }
.user-email { font-size:13px; color:var(--gray); }
</style>
