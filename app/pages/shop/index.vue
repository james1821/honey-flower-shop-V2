<template>
  <div class="shop-page">
    <div class="container">
      <div class="shop-header">
        <h1 class="shop-title">{{ pageTitle }}</h1>
        <p class="shop-sub">{{ products.length }} products</p>
      </div>

    
      <div class="filters">
        <div class="filter-tabs">
        
<NuxtLink to="/shop" class="tab" :class="{ active: !route.query.type }">All</NuxtLink>
<NuxtLink to="/shop?type=fresh_flowers" class="tab" :class="{ active: route.query.type==='fresh_flowers' }">Fresh Flowers</NuxtLink>
<NuxtLink to="/shop?type=money_bouquet" class="tab" :class="{ active: route.query.type==='money_bouquet' }">Money Bouquet</NuxtLink>
<NuxtLink to="/shop?type=chocolate_bundle" class="tab" :class="{ active: route.query.type==='chocolate_bundle' }">Chocolate Bundles</NuxtLink>
<NuxtLink to="/shop?type=handmade_flowers" class="tab" :class="{ active: route.query.type==='handmade_flowers' }">Handmade Flowers</NuxtLink>
<NuxtLink to="/shop?type=others" class="tab" :class="{ active: route.query.type==='others' }">Others</NuxtLink>
        </div>
        <input v-model="search" class="form-input search-input" placeholder="Search products…" />
      </div>

   
      <div v-if="loading" class="product-grid">
        <div v-for="n in 8" :key="n" class="skeleton-card">
          <div class="skeleton" style="aspect-ratio:1;border-radius:var(--radius-lg)"></div>
          <div style="padding:14px;display:flex;flex-direction:column;gap:8px">
            <div class="skeleton" style="height:14px;width:60%"></div>
            <div class="skeleton" style="height:20px;width:85%"></div>
            <div class="skeleton" style="height:14px;width:40%"></div>
          </div>
        </div>
      </div>
      <div v-else-if="products.length" class="product-grid">
        <ShopProductCard
          v-for="p in products" :key="p.id"
          :product="p"
          @quick-add="navigateTo(`/shop/${p.slug}`)"
        />
      </div>
      <div v-else class="empty-state">
        <p>No products found.</p>
        <NuxtLink to="/shop" class="btn btn-primary">View all products</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product, ProductType } from '~/types'

const route = useRoute()
const { getProducts } = useProducts()

const products = ref<Product[]>([])
const loading = ref(true)
const search = ref('')

const titleMap: Record<string, string> = {
  fresh_flowers: 'Fresh Flowers',
  money_bouquet: 'Money Bouquets',
  chocolate_bundle: 'Chocolate Bundles',
  handmade_flowers: 'Handmade Flowers',
  others: 'Other Products',
}
const pageTitle = computed(() =>
  route.query.type ? (titleMap[route.query.type as string] ?? 'Shop') : 'All Products'
)

async function load() {
  loading.value = true
  const { data } = await getProducts({
    type: route.query.type as ProductType | undefined,
    search: search.value || undefined,
  })
  products.value = data ?? []
  loading.value = false
}

watch(() => [route.query.type, search.value], useDebounceFn(load, 300))

await load()
</script>

<style scoped>
.shop-page { padding: 48px 0 80px; }
.shop-header { margin-bottom: 32px; }
.shop-title { font-size:clamp(28px,4vw,44px); margin-bottom:4px; }
.shop-sub { color:var(--gray); font-size:15px; }
.filters { display:flex; align-items:center; gap:16px; margin-bottom:32px; flex-wrap:wrap; }
.filter-tabs { display:flex; gap:6px; flex-wrap:wrap; flex:1; }
.tab {
  padding:8px 16px; border-radius:var(--radius-full); font-size:13.5px;
  color:var(--gray); border:1.5px solid var(--border); background:#fff;
  transition:all var(--t);
}
.tab:hover, .tab.active { background:var(--purple); color:#fff; border-color:var(--purple); }
.search-input { max-width:240px; }
.product-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); gap:20px; }
.skeleton-card { border-radius:var(--radius-lg); overflow:hidden; border:1px solid var(--border); background:#fff; }
.empty-state { text-align:center; padding:80px; display:flex; flex-direction:column; align-items:center; gap:16px; }
.empty-state p { font-size:18px; color:var(--gray); }
</style>
