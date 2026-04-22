<template>
  <NuxtLink :to="`/shop/${product.slug}`" class="product-card">
    <div class="card-img-wrap">
      <img :src="product.images[0] || '/placeholder.jpg'" :alt="product.name" class="card-img" loading="lazy" />
      <div class="card-badges">
        <span v-if="product.is_featured" class="badge badge-gold">Featured</span>
        <span v-if="product.sale_price" class="badge badge-error">Sale</span>
        <span v-if="product.type === 'money_bouquet'" class="badge badge-gold">💵 Money</span>
        <span v-if="product.type === 'chocolate_bundle'" class="badge badge-blush">🍫 Bundle</span>
        <span v-if="product.type === 'gift_voucher'" class="badge badge-green">🎁 Voucher</span>
      </div>
    </div>
    <div class="card-body">
      <p v-if="product.category" class="card-cat">{{ product.category.name }}</p>
      <h3 class="card-title">{{ product.name }}</h3>
      <p class="card-desc">{{ product.short_description }}</p>
      <div class="card-footer-row">
        <div class="price-wrap">
          <span v-if="product.sale_price" class="price-old">{{ fmt(product.base_price) }}</span>
          <span class="price">{{ fmt(product.sale_price ?? product.base_price) }}</span>
          <span v-if="product.type === 'money_bouquet'" class="price-note">+ cash</span>
        </div>
        <span class="quick-add" @click.prevent="$emit('quick-add', product)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Product } from '~/types'
defineProps<{ product: Product }>()
defineEmits<{ 'quick-add': [product: Product] }>()
const { fmt } = useCurrency()
</script>

<style scoped>
.product-card {
  display:flex; flex-direction:column; border-radius:var(--radius-lg);
  border:1px solid var(--border); background:#fff; overflow:hidden;
  transition:all var(--t) var(--ease); cursor:pointer;
}
.product-card:hover { box-shadow:var(--shadow-md); transform:translateY(-3px); }
.card-img-wrap { position:relative; aspect-ratio:1; overflow:hidden; }
.card-img { width:100%; height:100%; object-fit:cover; transition:transform .4s var(--ease); }
.product-card:hover .card-img { transform:scale(1.04); }
.card-badges { position:absolute; top:10px; left:10px; display:flex; flex-direction:column; gap:5px; }
.card-body { padding:16px; display:flex; flex-direction:column; gap:5px; flex:1; }
.card-cat { font-size:11px; font-weight:600; color:var(--purple); text-transform:uppercase; letter-spacing:.06em; }
.card-title { font-family:var(--font-serif); font-size:18px; line-height:1.25; }
.card-desc { font-size:13px; color:var(--gray); line-height:1.5; flex:1; }
.card-footer-row { display:flex; align-items:center; justify-content:space-between; margin-top:8px; }
.price-wrap { display:flex; align-items:baseline; gap:6px; flex-wrap:wrap; }
.price { font-size:18px; font-weight:700; color:var(--purple); }
.price-old { font-size:13px; color:var(--gray-light); text-decoration:line-through; }
.price-note { font-size:11px; color:var(--gold); font-weight:600; }
.quick-add {
  width:34px; height:34px; border-radius:50%; background:var(--purple-pale);
  color:var(--purple); display:flex; align-items:center; justify-content:center;
  transition:all var(--t); flex-shrink:0;
}
.quick-add:hover { background:var(--purple); color:#fff; }
</style>
