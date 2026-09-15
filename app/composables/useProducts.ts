import type { Product, Category, DeliveryOption, ProductType } from '~/types'
import {
  collection, query, where, orderBy, limit, getDocs,
} from 'firebase/firestore'
import { docToProduct, docToCategory, docToDeliveryOption } from '~/utils/firestore-mappers'

export function useProducts() {
  const db = useFirestore()

  async function getProducts(opts?: { type?: ProductType; featured?: boolean; search?: string; page?: number; pageSize?: number }) {
    // Firestore has no OFFSET pagination or free-text ILIKE search, so for this shop's scale
    // we fetch the filtered catalog and page/search client-side (fine up to a few thousand items).
    const constraints = [where('is_active', '==', true)]
    if (opts?.type) constraints.push(where('type', '==', opts.type))
    if (opts?.featured) constraints.push(where('is_featured', '==', true))

    try {
      const q = query(collection(db, 'products'), ...constraints, orderBy('created_at', 'desc'))
      const snap = await getDocs(q)
      let items = snap.docs.map(docToProduct)

      if (opts?.search) {
        const s = opts.search.toLowerCase()
        items = items.filter(p => p.name.toLowerCase().includes(s))
      }
      // featured-first, like the old `.order('is_featured', { ascending: false })`
      items.sort((a, b) => Number(b.is_featured) - Number(a.is_featured))

      const page = opts?.page ?? 1
      const ps = opts?.pageSize ?? 24
      const start = (page - 1) * ps
      const paged = items.slice(start, start + ps)

      return { data: paged, error: null, count: items.length }
    } catch (error: any) {
      return { data: null, error: error?.message ?? String(error), count: 0 }
    }
  }

  async function getProduct(slug: string) {
    try {
      const q = query(collection(db, 'products'), where('slug', '==', slug), where('is_active', '==', true), limit(1))
      const snap = await getDocs(q)
      if (snap.empty) return { data: null, error: null }
      return { data: docToProduct(snap.docs[0]!), error: null }
    } catch (error: any) {
      return { data: null, error: error?.message ?? String(error) }
    }
  }

  async function getCategories() {
    try {
      const q = query(collection(db, 'categories'), where('is_active', '==', true), orderBy('sort_order'))
      const snap = await getDocs(q)
      return { data: snap.docs.map(docToCategory) as Category[], error: null }
    } catch (error: any) {
      return { data: null, error: error?.message ?? String(error) }
    }
  }

  async function getDeliveryOptions() {
    try {
      const q = query(collection(db, 'delivery_options'), where('is_active', '==', true))
      const snap = await getDocs(q)
      return { data: snap.docs.map(docToDeliveryOption) as DeliveryOption[], error: null }
    } catch (error: any) {
      return { data: null, error: error?.message ?? String(error) }
    }
  }

  return { getProducts, getProduct, getCategories, getDeliveryOptions }
}
