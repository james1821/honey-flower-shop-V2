<template>
  <div>
    
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="container hero-inner">
        <div class="hero-text fade-up">
          <span class="hero-eyebrow">Gifts · Create · Lasting Memories</span>
          <h1 class="hero-title">Gifts that<br><em>speak louder</em><br>than words.</h1>
          <p class="hero-sub">Hand-crafted bouquets, money-filled arrangements & premium gift bundles.</p>
          <div class="hero-actions">
            <NuxtLink to="/shop" class="btn btn-primary btn-lg">Shop Now</NuxtLink>
           
          </div>
        </div>
        <div class="hero-img fade-up" style="animation-delay:.15s">
       <img src="https://i.ibb.co/LXC0fjfJ/logo.jpg" alt="logo" border="0">
        </div>
      </div>
    </section>

    
    <section class="section">
      <div class="container">
        <h2 class="section-title">What are you looking for?</h2>
        <div class="cat-grid">
          <NuxtLink v-for="cat in categories" :key="cat.slug" :to="`/shop?type=${typeMap[cat.slug] ?? ''}`" class="cat-card">
            <img :src="cat.image_url || ''" :alt="cat.name" class="cat-img" />
            <div class="cat-overlay">
              <h3>{{ cat.name }}</h3>
              <span>Shop →</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

  
    <section class="section bg-cream">
      <div class="container">
        <div class="section-head">
          <h2 class="section-title">Bestsellers</h2>
          <NuxtLink to="/shop" class="btn btn-ghost">View all →</NuxtLink>
        </div>
        <div class="product-grid">
          <ShopProductCard v-for="p in featured" :key="p.id" :product="p" @quick-add="openProduct(p)" />
        </div>
      </div>
    </section>

    <section class="money-cta">
      <div class="container money-cta-inner">
        <div class="money-cta-text">
          <span class="hero-eyebrow">NEW &amp; UNIQUE</span>
          <h2>Flowers + Real Cash<br>in One Beautiful Bouquet</h2>
          <p>Choose any amount from ₱500 up to ₱20,000 and we'll fold crisp peso bills right into the arrangement. The ultimate birthday, graduation, or graduation gift.</p>
          <NuxtLink to="/shop?type=money_bouquet" class="btn btn-gold btn-lg">Explore Money Bouquets →</NuxtLink>
        </div>
        <img src="https://i.ibb.co/xtVvVGQg/photo-2023-08-18-13-58-04-2.jpg" alt="Money bouquet" class="money-cta-img" />
      </div>
    </section>

 
    <section class="section">
      <div class="container">
    <GalleryCollage />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types'

const { getProducts, getCategories } = useProducts()

const categories = ref<any[]>([])
const featured = ref<Product[]>([])

const typeMap: Record<string, string> = {
  
}

// const trusts = [
  
// ]

async function openProduct(p: Product) {
  navigateTo(`/shop/${p.slug}`)
}

const { data: catData } = await useAsyncData('home-cats', () => getCategories().then(r => r.data))
const { data: featData } = await useAsyncData('home-featured', () => getProducts({ featured: true, pageSize: 8 }).then(r => r.data))
categories.value = catData.value ?? []
featured.value = featData.value ?? []
</script>

<style scoped>
.hero { position:relative; overflow:hidden; min-height:560px; display:flex; align-items:center; }
.hero-bg { position:absolute; inset:0; background:linear-gradient(135deg,#eef5f0 0%,#fdf9f4 50%,#fdf0f1 100%); }
.hero-inner { position:relative; display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center; padding:8px 24px; }
@media(max-width:768px){ .hero-inner{ grid-template-columns:1fr; padding:60px 24px; } }
.hero-eyebrow { font-size:12px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--purple); }
.hero-title { font-size:clamp(40px,6vw,68px); margin:12px 0; color:var(--charcoal); }
.hero-title em { font-style:italic; color:var(--purple); }
.hero-sub { font-size:17px; color:var(--gray); line-height:1.7; max-width:460px; margin-bottom:28px; }
.hero-actions { display:flex; gap:12px; flex-wrap:wrap; }
.hero-img img { border-radius:var(--radius-xl); box-shadow:var(--shadow-lg); width:100%; aspect-ratio:1; object-fit:cover; }

.section { padding:80px 0; }
.section.bg-cream { background:var(--cream-dark); }
.section-title { font-size:clamp(28px,4vw,40px); margin-bottom:32px; }
.section-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:32px; }
.section-head .section-title { margin-bottom:0; }

.cat-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:16px; }
.cat-card { position:relative; border-radius:var(--radius-lg); overflow:hidden; aspect-ratio:.8; cursor:pointer; }
.cat-img { width:100%; height:100%; object-fit:cover; transition:transform .4s var(--ease); }
.cat-card:hover .cat-img { transform:scale(1.06); }
.cat-overlay {
  position:absolute; inset:0;
  background:linear-gradient(to top, rgba(0,0,0,.65) 0%, transparent 55%);
  display:flex; flex-direction:column; justify-content:flex-end; padding:20px;
  color:#fff;
}
.cat-overlay h3 { font-size:20px; }
.cat-overlay span { font-size:14px; opacity:.8; }

.product-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:20px; }

.money-cta { background:linear-gradient(135deg,#1a3a22 0%,#2d6040 100%); color:#fff; padding:80px 0; }
.money-cta-inner { display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center; }
@media(max-width:768px){ .money-cta-inner{ grid-template-columns:1fr; } }
.money-cta-text .hero-eyebrow { color:var(--gold); }
.money-cta-text h2 { font-size:clamp(28px,4vw,44px); margin:12px 0 16px; color:#fff; }
.money-cta-text p { font-size:16px; color:rgba(255,255,255,.8); line-height:1.7; margin-bottom:28px; max-width:460px; }
.money-cta-img { border-radius:var(--radius-xl); box-shadow:var(--shadow-lg); width:100%; aspect-ratio:1; object-fit:cover; }

.trust-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:24px; }
.trust-item { text-align:center; padding:28px 20px; }
.trust-icon { font-size:36px; display:block; margin-bottom:12px; }
.trust-item h4 { font-family:var(--font-serif); font-size:18px; margin-bottom:8px; }
.trust-item p { font-size:14px; color:var(--gray); line-height:1.6; }
</style>
