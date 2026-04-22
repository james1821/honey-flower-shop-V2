<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <NuxtLink to="/">Handmade By Honey</NuxtLink>
    </div>

    <nav class="sidebar-nav">
      <p class="nav-section">Main</p>
      <NuxtLink to="/admin" class="nav-item" exact-active-class="active">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        Dashboard
      </NuxtLink>

      <p class="nav-section">Catalog</p>
      <NuxtLink to="/admin/products" class="nav-item" active-class="active">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        Products
      </NuxtLink>
      <NuxtLink to="/admin/delivery" class="nav-item" active-class="active">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        Delivery Options
      </NuxtLink>
      <NuxtLink to="/admin/promos" class="nav-item" active-class="active">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
        Promo Codes
      </NuxtLink>

      <p class="nav-section">Operations</p>
      <NuxtLink to="/admin/orders" class="nav-item" active-class="active">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
        Orders
      </NuxtLink>
      <NuxtLink to="/admin/customers" class="nav-item" active-class="active">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
        Customers
      </NuxtLink>
      <NuxtLink to="/admin/gallery" class="nav-item" active-class="active">
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
  Gallery
</NuxtLink>
    </nav>

    <div class="sidebar-footer">
      <NuxtLink to="/" class="nav-item">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        View Store
      </NuxtLink>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-w); background: var(--charcoal); color: rgba(255,255,255,.7);
  display: flex; flex-direction: column; flex-shrink: 0;
  position: sticky; top: 0; height: 100vh;
}
@media(max-width:768px){ .sidebar{ display:none; } }
.sidebar-logo { padding:20px; border-bottom:1px solid rgba(255,255,255,.08); }
.sidebar-logo a { font-family:var(--font-serif); font-size:22px; color:#fff; }
.sidebar-nav { flex:1; padding:16px 10px; overflow-y:auto; display:flex; flex-direction:column; gap:2px; }
.nav-section { font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.3); padding:12px 10px 4px; }
.nav-item {
  display:flex; align-items:center; gap:10px; padding:10px 12px;
  border-radius:var(--radius-sm); font-size:14px; color:rgba(255,255,255,.65);
  transition:all var(--t); border:none; background:none; cursor:pointer; text-decoration:none; width:100%;
}
.nav-item:hover, .nav-item.active { background:rgba(255,255,255,.08); color:#fff; }
.sidebar-footer { padding:10px 10px 16px; border-top:1px solid rgba(255,255,255,.08); }
</style>
