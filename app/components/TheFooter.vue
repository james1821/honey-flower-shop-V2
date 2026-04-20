<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <div class="f-logo">
          <!-- <span>✿</span> -->
          <span class="f-name">Handmade By Honey</span>
        </div>
        <p>Hand-crafted bouquets, money-filled arrangements & premium gift bundles.</p>
      </div>

     
      <div class="footer-col">
        <h4>Shop</h4>
        <NuxtLink to="/shop">All Products</NuxtLink>
        <NuxtLink to="/shop?type=fresh_flowers">Fresh Flowers</NuxtLink>
        <NuxtLink to="/shop?type=money_bouquet">Money Bouquets</NuxtLink>
        <NuxtLink to="/shop?type=chocolate_bundle">Chocolate Bundles</NuxtLink>
        <NuxtLink to="/shop?type=handmade_flowers">Handmade Flowers</NuxtLink>
        <NuxtLink to="/shop?type=others">Others</NuxtLink>
      </div>

      <div class="footer-col">
        <h4>Help</h4>
        <a href="#">Delivery Info</a>
        <a href="#">Returns</a>
        <a href="#">FAQ</a>
        <a href="#">Contact Us</a>
      </div>

      <div class="footer-col">
        <h4>Account</h4>
        <NuxtLink to="/auth/login">Sign In</NuxtLink>
        <NuxtLink to="/auth/register">Create Account</NuxtLink>
        <NuxtLink to="/account/orders">My Orders</NuxtLink>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="container">
        <p>© {{ year }} Handmade By Honey. All rights reserved.</p>
        <p>Made with ✿ in the Philippines</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style scoped>
.footer { 
  background: var(--charcoal); 
  color: rgba(255,255,255,.75); 
  margin-top: 80px; 
}
.footer-inner {
  padding: 64px 24px 48px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 48px;
}
@media(max-width:768px) {
  .footer-inner { 
    grid-template-columns: 1fr 1fr; 
    gap: 32px; 
    padding: 40px 24px; 
  }
}
@media(max-width:480px) {
  .footer-inner { grid-template-columns: 1fr; }
}
.f-logo { 
  display:flex; 
  align-items:center; 
  gap:8px; 
  margin-bottom:12px; 
}
.f-logo span:first-child { font-size:22px; }
.f-name { 
  font-family:var(--font-serif); 
  font-size:22px; 
  color:#fff; 
}
.footer-brand p { 
  font-size:14px; 
  line-height:1.7; 
  max-width:260px; 
}
.footer-col { 
  display:flex; 
  flex-direction:column; 
  gap:10px; 
}
.footer-col h4 { 
  font-family:var(--font-serif); 
  font-size:16px; 
  color:#fff; 
  font-weight:400; 
  margin-bottom:4px; 
}
.footer-col a { 
  font-size:14px; 
  color:rgba(255,255,255,.6); 
  transition:color var(--t); 
}
.footer-col a:hover { color:#fff; }
.footer-bottom { 
  border-top:1px solid rgba(255,255,255,.1); 
  padding:20px 24px; 
}
.footer-bottom .container { 
  display:flex; 
  justify-content:space-between; 
  align-items:center; 
  flex-wrap:wrap; 
  gap:8px; 
  font-size:13px; 
}
</style>