<template>
  <nav class="nav">
    <div class="container nav-inner">
      <NuxtLink to="/" class="logo">
      
        <span class="logo-name">Handmade By Honey</span>
      </NuxtLink>

      <ul class="nav-links hide-mobile">
        <li><NuxtLink to="/shop" class="nav-link">All Products</NuxtLink></li>
        <li><NuxtLink to="/shop?type=fresh_flowers" class="nav-link">Fresh Flowers</NuxtLink></li>
        <li><NuxtLink to="/shop?type=money_bouquet" class="nav-link">Money Bouquets</NuxtLink></li>
        <li><NuxtLink to="/shop?type=chocolate_bundle" class="nav-link">Chocolate Bundles</NuxtLink></li>
         <li><NuxtLink to="/shop?type=handmade_flowers" class="nav-link">Handmade Flowers</NuxtLink></li>
        <li><NuxtLink to="/shop?type=gift_voucher" class="nav-link">Others</NuxtLink></li>
      </ul>

      <div class="nav-right">
        <template v-if="!user">
          <NuxtLink to="/auth/login" class="btn btn-ghost btn-sm hide-mobile">Sign in</NuxtLink>
          <NuxtLink to="/auth/register" class="btn btn-primary btn-sm hide-mobile">Register</NuxtLink>
        </template>
        <template v-else>
          <div class="user-wrap hide-mobile" ref="userRef">
            <button class="user-btn" @click="menuOpen = !menuOpen">
              <span class="avatar">{{ initials }}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div v-if="menuOpen" class="user-menu fade-in">
              <NuxtLink to="/account/orders" @click="menuOpen=false">My Orders</NuxtLink>
              <NuxtLink v-if="isAdmin" to="/admin" @click="menuOpen=false">Admin Dashboard</NuxtLink>
              <hr style="border-color:var(--border);margin:6px 0">
              <button @click="logout">Sign Out</button>
            </div>
          </div>
        </template>

        <button class="cart-trigger" @click="cartStore.isOpen=true" aria-label="Cart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <span v-if="cartStore.itemCount" class="cart-badge">{{ cartStore.itemCount }}</span>
        </button>

      
        <button class="show-mobile icon-btn" @click="mobileOpen=!mobileOpen">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div v-if="mobileOpen" class="mobile-menu fade-in">
      <NuxtLink to="/shop" @click="mobileOpen=false">All Products</NuxtLink>
      <NuxtLink to="/shop?type=flowers" @click="mobileOpen=false">Flowers</NuxtLink>
      <NuxtLink to="/shop?type=money_bouquet" @click="mobileOpen=false">Money Bouquets</NuxtLink>
      <NuxtLink to="/shop?type=chocolate_bundle" @click="mobileOpen=false">Chocolate Bundles</NuxtLink>
      <NuxtLink to="/shop?type=gift_voucher" @click="mobileOpen=false">Gift Vouchers</NuxtLink>
      <hr style="border-color:var(--border)">
      <template v-if="!user">
        <NuxtLink to="/auth/login" @click="mobileOpen=false">Sign In</NuxtLink>
        <NuxtLink to="/auth/register" @click="mobileOpen=false">Register</NuxtLink>
      </template>
      <template v-else>
        <NuxtLink to="/account/orders" @click="mobileOpen=false">My Orders</NuxtLink>
        <NuxtLink v-if="isAdmin" to="/admin" @click="mobileOpen=false">Admin Dashboard</NuxtLink>
        <button @click="logout">Sign Out</button>
      </template>
    </div>
  </nav>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const cartStore = useCartStore()
const { success } = useToast()

const menuOpen = ref(false)
const mobileOpen = ref(false)
const isAdmin = ref(false)
const userRef = ref<HTMLElement>()

const initials = computed(() => (user.value?.email ?? '').slice(0, 2).toUpperCase())

onMounted(async () => {
  if (user.value) {
    const { data } = await supabase.from('profiles').select('role').eq('id', user.value.id).maybeSingle()
    isAdmin.value = data?.role === 'admin'
  }
})

async function logout() {
  await supabase.auth.signOut()
  menuOpen.value = false
  success('Signed out')
  navigateTo('/')
}

onClickOutside(userRef, () => { menuOpen.value = false })
</script>

<style scoped>
.nav {
  position: fixed; top: 0; left: 0; right: 0; height: var(--nav-h);
  background: rgba(253,249,244,.96); backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border); z-index: 100;
}
.nav-inner {
  height: 100%; display: flex; align-items: center; gap: 24px;
}
.logo { display:flex; align-items:center; gap:9px; flex-shrink:0; }
.logo-flower { font-size:22px; }
.logo-name { font-family:var(--font-serif); font-size:24px; color:var(--charcoal); }
.nav-links { display:flex; gap:2px; flex:1; }
.nav-link {
  padding: 7px 13px; border-radius: var(--radius-full);
  font-size: 13.5px; color: var(--gray);
  transition: all var(--t) var(--ease);
}
.nav-link:hover { background: var(--green-pale); color: var(--green); }
.nav-right { display:flex; align-items:center; gap:10px; margin-left:auto; }
.cart-trigger {
  position:relative; background:none; border:none; width:40px; height:40px;
  border-radius:var(--radius-full); display:flex; align-items:center; justify-content:center;
  color: var(--charcoal); transition: background var(--t);
}
.cart-trigger:hover { background: var(--cream-dark); }
.cart-badge {
  position:absolute; top:2px; right:2px; background:var(--green); color:#fff;
  font-size:10px; font-weight:700; width:17px; height:17px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
}
.icon-btn { background:none; border:none; padding:8px; color:var(--charcoal); }
.user-wrap { position:relative; }
.user-btn { display:flex; align-items:center; gap:6px; background:none; border:none; cursor:pointer; }
.avatar {
  width:34px; height:34px; border-radius:50%; background:var(--green-pale);
  color:var(--green); font-size:12px; font-weight:700;
  display:flex; align-items:center; justify-content:center;
}
.user-menu {
  position:absolute; top:calc(100% + 8px); right:0;
  background:#fff; border-radius:var(--radius-md); box-shadow:var(--shadow-lg);
  border:1px solid var(--border); padding:6px; min-width:180px;
  display:flex; flex-direction:column; gap:2px;
}
.user-menu a, .user-menu button {
  display:block; width:100%; text-align:left; padding:9px 13px;
  border-radius:var(--radius-sm); font-size:14px; color:var(--charcoal);
  background:none; border:none; cursor:pointer; transition:background var(--t);
}
.user-menu a:hover, .user-menu button:hover { background:var(--cream); }
.mobile-menu {
  position:absolute; top:var(--nav-h); left:0; right:0;
  background:#fff; border-bottom:1px solid var(--border);
  padding:12px 16px; display:flex; flex-direction:column; gap:2px; box-shadow:var(--shadow-md);
}
.mobile-menu a, .mobile-menu button {
  display:block; padding:11px 14px; border-radius:var(--radius-sm); font-size:15px;
  color:var(--charcoal); background:none; border:none; text-align:left; cursor:pointer; width:100%;
}
.mobile-menu a:hover, .mobile-menu button:hover { background:var(--cream); }
</style>
