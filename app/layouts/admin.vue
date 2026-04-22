<template>
  <div class="admin-shell">
    <AdminSidebar />
    <div class="admin-body">
      <AdminTopbar />
      <main class="admin-content"><slot /></main>
    </div>
  </div>
</template>
<style scoped>
.admin-shell  { display:flex; min-height:100vh; background:#f5f3ef; }
.admin-body   { flex:1; display:flex; flex-direction:column; min-width:0; overflow:hidden; }
.admin-content{ flex:1; padding:28px 32px; overflow-y:auto; }
@media(max-width:768px){ .admin-content{ padding:16px; } }
</style>
