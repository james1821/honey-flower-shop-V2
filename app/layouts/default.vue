<template>
  <div class="site-wrap">
    <TheNav />
    <main class="site-main"><slot /></main>
    
  </div>
</template>
<style scoped>
.site-wrap { display:flex; flex-direction:column; min-height:100vh; }
.site-main  { flex:1; padding-top:var(--nav-h); }
</style>
