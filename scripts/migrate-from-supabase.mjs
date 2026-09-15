// One-time data migration: copies your existing Supabase rows into Firestore.
//
// This is NOT run automatically — it's a script you run once, locally, from your own machine,
// after you've set up the Firebase project and BEFORE you point the live site at Firebase.
//
// Setup:
//   1. npm install @supabase/supabase-js firebase-admin
//   2. Download a Firebase Admin service account key:
//      Firebase Console → Project settings → Service accounts → Generate new private key
//      Save it as scripts/service-account.json (already gitignored — see .gitignore)
//   3. Fill in the SUPABASE_URL / SUPABASE_SERVICE_KEY values below (or export them as env vars).
//      Use your Supabase *service role* key here, not the public anon key, so RLS doesn't
//      hide any rows.
//   4. node scripts/migrate-from-supabase.mjs
//
// What it does NOT do:
//   - Move your product images. They're currently just links (e.g. to Unsplash or wherever
//     they were hosted) — those links still work as-is in the `images` array. If you want
//     them actually hosted on Firebase Storage (with compression), re-upload them from the
//     admin Products page after migrating; the uploader will replace the URL for you.
//   - Recreate Supabase Auth users in Firebase Auth. Firebase can't import plaintext
//     passwords (Supabase can't export them either — they're hashed). Existing customers
//     will need to use "Forgot password" once on the new site, or you can invite them again.
//     This script DOES copy `profiles` rows into Firestore `users/{uid}`, but only for users
//     you migrate/create in Firebase Auth with matching uids — see the profiles section below.

import { createClient } from '@supabase/supabase-js'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { readFileSync } from 'node:fs'

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://YOUR-PROJECT.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'YOUR-SERVICE-ROLE-KEY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const serviceAccount = JSON.parse(readFileSync(new URL('./service-account.json', import.meta.url)))
initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

function toTimestamp(iso) {
  return iso ? Timestamp.fromDate(new Date(iso)) : Timestamp.now()
}

async function migrateCategories() {
  const { data, error } = await supabase.from('categories').select('*')
  if (error) throw error
  const batch = db.batch()
  for (const c of data ?? []) {
    batch.set(db.collection('categories').doc(c.id), {
      name: c.name, slug: c.slug, description: c.description ?? null,
      image_url: c.image_url ?? null, sort_order: c.sort_order ?? 0,
      is_active: c.is_active ?? true, created_at: toTimestamp(c.created_at),
    })
  }
  await batch.commit()
  console.log(`✓ Migrated ${data?.length ?? 0} categories`)
  return new Map((data ?? []).map(c => [c.id, c]))
}

async function migrateProducts(categoriesById) {
  const { data: products, error } = await supabase.from('products').select('*')
  if (error) throw error
  const { data: variants } = await supabase.from('product_variants').select('*')
  const variantsByProduct = new Map()
  for (const v of variants ?? []) {
    if (!variantsByProduct.has(v.product_id)) variantsByProduct.set(v.product_id, [])
    variantsByProduct.get(v.product_id).push({
      id: v.id, product_id: v.product_id, name: v.name,
      price_modifier: v.price_modifier ?? 0, description: v.description ?? null,
      is_active: v.is_active ?? true,
    })
  }

  const batch = db.batch()
  for (const p of products ?? []) {
    const cat = p.category_id ? categoriesById.get(p.category_id) : null
    batch.set(db.collection('products').doc(p.id), {
      name: p.name, slug: p.slug, description: p.description ?? null,
      short_description: p.short_description ?? null, type: p.type,
      category_id: p.category_id ?? null,
      category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
      base_price: p.base_price ?? 0, sale_price: p.sale_price ?? null,
      images: p.images ?? [], is_active: p.is_active ?? true, is_featured: p.is_featured ?? false,
      stock_qty: p.stock_qty ?? 0, delivery_types: p.delivery_types ?? ['standard'],
      tags: p.tags ?? [], money_min_amount: p.money_min_amount ?? null,
      money_max_amount: p.money_max_amount ?? null, money_step: p.money_step ?? null,
      metadata: p.metadata ?? {}, variants: variantsByProduct.get(p.id) ?? [],
      created_at: toTimestamp(p.created_at), updated_at: toTimestamp(p.updated_at),
    })
  }
  await batch.commit()
  console.log(`✓ Migrated ${products?.length ?? 0} products (with ${variants?.length ?? 0} variants embedded)`)
}

async function migrateDeliveryOptions() {
  const { data, error } = await supabase.from('delivery_options').select('*')
  if (error) throw error
  const batch = db.batch()
  for (const d of data ?? []) {
    batch.set(db.collection('delivery_options').doc(d.id), {
      name: d.name, type: d.type, description: d.description ?? '',
      price: d.price ?? 0, estimated_days: d.estimated_days ?? '', is_active: d.is_active ?? true,
    })
  }
  await batch.commit()
  console.log(`✓ Migrated ${data?.length ?? 0} delivery options`)
}

async function migratePromoCodes() {
  const { data, error } = await supabase.from('promo_codes').select('*')
  if (error) throw error
  const batch = db.batch()
  for (const p of data ?? []) {
    batch.set(db.collection('promo_codes').doc(p.id), {
      code: p.code, discount_type: p.discount_type, discount_value: p.discount_value ?? 0,
      valid_until: p.valid_until ?? null, max_uses: p.max_uses ?? null,
      uses_count: p.uses_count ?? 0, min_order_amount: p.min_order_amount ?? null,
      is_active: p.is_active ?? true, created_at: toTimestamp(p.created_at),
    })
  }
  await batch.commit()
  console.log(`✓ Migrated ${data?.length ?? 0} promo codes`)
}

async function migrateGalleryItems() {
  const { data, error } = await supabase.from('gallery_items').select('*')
  if (error) throw error
  const batch = db.batch()
  for (const g of data ?? []) {
    batch.set(db.collection('gallery_items').doc(g.id), {
      type: g.type, image_url: g.image_url, caption: g.caption ?? null,
      customer_name: g.customer_name ?? null, rating: g.rating ?? null,
      sort_order: g.sort_order ?? 0, is_active: g.is_active ?? true,
      created_at: toTimestamp(g.created_at),
    })
  }
  await batch.commit()
  console.log(`✓ Migrated ${data?.length ?? 0} gallery items`)
}

async function migratePopupBanner() {
  const { data, error } = await supabase.from('popup_banner').select('*').maybeSingle()
  if (error) throw error
  if (!data) { console.log('– No popup banner row to migrate'); return }
  await db.collection('popup_banner').doc('main').set({
    image_url: data.image_url, link_url: data.link_url ?? null,
    is_active: data.is_active ?? false, updated_at: toTimestamp(data.updated_at),
  })
  console.log('✓ Migrated popup banner')
}

async function migrateOrders() {
  const { data: orders, error } = await supabase.from('orders').select('*')
  if (error) throw error
  const { data: items } = await supabase.from('order_items').select('*')
  const itemsByOrder = new Map()
  for (const it of items ?? []) {
    if (!itemsByOrder.has(it.order_id)) itemsByOrder.set(it.order_id, [])
    itemsByOrder.get(it.order_id).push({
      id: it.id, order_id: it.order_id, product_id: it.product_id, variant_id: it.variant_id ?? null,
      quantity: it.quantity, unit_price: it.unit_price ?? 0, money_amount: it.money_amount ?? null,
      subtotal: it.subtotal ?? 0, product_snapshot: it.product_snapshot ?? {},
    })
  }

  let n = 0
  for (const batchChunk of chunk(orders ?? [], 400)) {
    const batch = db.batch()
    for (const o of batchChunk) {
      batch.set(db.collection('orders').doc(o.id), {
        order_number: o.order_number ?? `HB-${String(++n).padStart(5, '0')}`,
        customer_id: o.customer_id ?? null,
        customer: null, // backfilled lazily; admin order list will still show recipient_name
        subtotal: o.subtotal ?? 0, delivery_fee: o.delivery_fee ?? 0,
        discount_amount: o.discount_amount ?? 0, total: o.total ?? 0,
        cash_in_order: o.cash_in_order ?? 0, delivery_option_id: o.delivery_option_id ?? null,
        delivery_option: null, delivery_date: o.delivery_date ?? null,
        delivery_address: o.delivery_address ?? null, pickup_name: o.pickup_name ?? null,
        recipient_name: o.recipient_name ?? '', recipient_phone: o.recipient_phone ?? null,
        gift_message: o.gift_message ?? null, promo_code: o.promo_code ?? null, notes: o.notes ?? null,
        status: o.status ?? 'pending', items: itemsByOrder.get(o.id) ?? [],
        created_at: toTimestamp(o.created_at), updated_at: toTimestamp(o.updated_at),
      })
    }
    await batch.commit()
  }
  // Keep the Firestore order-number counter ahead of the highest migrated number.
  await db.collection('counters').doc('orders').set({ value: (orders ?? []).length }, { merge: true })
  console.log(`✓ Migrated ${orders?.length ?? 0} orders (with ${items?.length ?? 0} line items embedded)`)
}

function* chunk(arr, size) {
  for (let i = 0; i < arr.length; i += size) yield arr.slice(i, i + size)
}

async function main() {
  console.log('Starting Supabase → Firestore migration…\n')
  const categoriesById = await migrateCategories()
  await migrateProducts(categoriesById)
  await migrateDeliveryOptions()
  await migratePromoCodes()
  await migrateGalleryItems()
  await migratePopupBanner()
  await migrateOrders()
  console.log('\nDone. Customer profiles (users/{uid}) and Auth accounts are NOT migrated by')
  console.log('this script — see the comment at the top of this file for why, and re-create')
  console.log('your admin account per MIGRATION.md.')
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
