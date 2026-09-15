import type { Product, Order, OrderStatus, PromoCode, DeliveryOption, DashboardStats, Profile } from '~/types'
import {
  collection, query, where, orderBy, limit, getDocs, getDoc, getCountFromServer,
  doc, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import {
  docToProduct, docToOrder, docToPromo, docToDeliveryOption, docToProfile, docToCategory,
} from '~/utils/firestore-mappers'

export function useAdmin() {
  const db = useFirestore()

  // Dashboard
  async function getDashboardStats(): Promise<{ data: DashboardStats | null; error: string | null }> {
    try {
      const now = new Date()
      const d30 = new Date(now.getTime() - 30 * 86400000)
      const d60 = new Date(now.getTime() - 60 * 86400000)

      const [curSnap, prevSnap, customersCount, recentSnap] = await Promise.all([
        getDocs(query(collection(db, 'orders'), where('created_at', '>=', Timestamp.fromDate(d30)))),
        getDocs(query(collection(db, 'orders'), where('created_at', '>=', Timestamp.fromDate(d60)), where('created_at', '<', Timestamp.fromDate(d30)))),
        getCountFromServer(query(collection(db, 'users'), where('role', '==', 'customer'))),
        getDocs(query(collection(db, 'orders'), orderBy('created_at', 'desc'), limit(8))),
      ])

      const orders = curSnap.docs.map(docToOrder)
      const prevOrders = prevSnap.docs.map(docToOrder)
      const rev = orders.reduce((s, o) => s + Number(o.total), 0)
      const prevRev = prevOrders.reduce((s, o) => s + Number(o.total), 0)
      const days = Array.from({ length: 14 }, (_, i) => new Date(now.getTime() - i * 86400000).toISOString().split('T')[0]!).reverse()
      const revenueByDay = days.map(date => ({
        date,
        revenue: orders.filter(o => o.created_at.startsWith(date)).reduce((s, o) => s + Number(o.total), 0),
      }))

      return {
        data: {
          totalRevenue: rev,
          totalOrders: orders.length,
          pendingOrders: orders.filter(o => o.status === 'pending').length,
          totalCustomers: customersCount.data().count ?? 0,
          revenueChange: prevRev > 0 ? ((rev - prevRev) / prevRev) * 100 : 0,
          ordersChange: prevOrders.length > 0 ? ((orders.length - prevOrders.length) / prevOrders.length) * 100 : 0,
          recentOrders: recentSnap.docs.map(docToOrder),
          revenueByDay,
        },
        error: null,
      }
    } catch (error: any) {
      return { data: null, error: error?.message ?? String(error) }
    }
  }

  // Products
  async function adminGetProducts(page = 1, ps = 20, search = '') {
    try {
      const q = query(collection(db, 'products'), orderBy('created_at', 'desc'))
      const snap = await getDocs(q)
      let items = snap.docs.map(docToProduct)
      if (search) {
        const s = search.toLowerCase()
        items = items.filter(p => p.name.toLowerCase().includes(s))
      }
      const total = items.length
      const start = (page - 1) * ps
      return { data: items.slice(start, start + ps) as Product[], error: null, count: total }
    } catch (error: any) {
      return { data: null, error: error?.message ?? String(error), count: 0 }
    }
  }

  async function adminUpsertProduct(p: Partial<Product> & { id?: string }) {
    try {
      const { id, category, ...rest } = p as any

      // Denormalize the category snapshot onto the product so product cards/lists never
      // need a second read (Firestore has no server-side joins).
      if (rest.category_id) {
        const catSnap = await getDoc(doc(db, 'categories', rest.category_id))
        rest.category = catSnap.exists() ? docToCategory(catSnap) : null
      } else if (rest.category_id === '' || rest.category_id === null) {
        rest.category_id = null
        rest.category = null
      }

      if (id) {
        await updateDoc(doc(db, 'products', id), { ...rest, updated_at: serverTimestamp() })
        const snap = await getDoc(doc(db, 'products', id))
        return { data: docToProduct(snap), error: null }
      }
      const ref = await addDoc(collection(db, 'products'), {
        ...rest,
        images: rest.images ?? [],
        variants: rest.variants ?? [],
        tags: rest.tags ?? [],
        metadata: rest.metadata ?? {},
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })
      const snap = await getDoc(ref)
      return { data: docToProduct(snap), error: null }
    } catch (error: any) {
      return { data: null, error: { message: error?.message ?? String(error) } }
    }
  }

  async function adminDeleteProduct(id: string) {
    try {
      await deleteDoc(doc(db, 'products', id))
      return { error: null }
    } catch (error: any) {
      return { error: { message: error?.message ?? String(error) } }
    }
  }

  // Orders
  async function adminGetOrders(page = 1, ps = 20, status?: OrderStatus) {
    try {
      const constraints = status ? [where('status', '==', status)] : []
      const q = query(collection(db, 'orders'), ...constraints, orderBy('created_at', 'desc'))
      const snap = await getDocs(q)
      const items = snap.docs.map(docToOrder)
      const start = (page - 1) * ps
      return { data: items.slice(start, start + ps) as Order[], error: null, count: items.length }
    } catch (error: any) {
      return { data: null, error: error?.message ?? String(error), count: 0 }
    }
  }

  async function adminUpdateOrderStatus(id: string, status: OrderStatus) {
    try {
      const ref = doc(db, 'orders', id)
      await updateDoc(ref, { status, updated_at: serverTimestamp() })
      const snap = await getDoc(ref)
      return { data: docToOrder(snap), error: null }
    } catch (error: any) {
      return { data: null, error: { message: error?.message ?? String(error) } }
    }
  }

  // Customers
  async function adminGetCustomers(page = 1, ps = 20, search = '') {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'customer'), orderBy('created_at', 'desc'))
      const snap = await getDocs(q)
      let items = snap.docs.map(docToProfile)
      if (search) {
        const s = search.toLowerCase()
        items = items.filter(c => c.full_name?.toLowerCase().includes(s) || c.email.toLowerCase().includes(s))
      }
      const total = items.length
      const start = (page - 1) * ps
      return { data: items.slice(start, start + ps) as Profile[], error: null, count: total }
    } catch (error: any) {
      return { data: null, error: error?.message ?? String(error), count: 0 }
    }
  }

  // Promos
  async function adminGetPromos() {
    try {
      const q = query(collection(db, 'promo_codes'), orderBy('created_at', 'desc'))
      const snap = await getDocs(q)
      return { data: snap.docs.map(docToPromo) as PromoCode[], error: null }
    } catch (error: any) {
      return { data: null, error: error?.message ?? String(error) }
    }
  }

  async function adminUpsertPromo(p: Partial<PromoCode>) {
    try {
      const { id, ...rest } = p
      if (id) {
        await updateDoc(doc(db, 'promo_codes', id), rest)
        const snap = await getDoc(doc(db, 'promo_codes', id))
        return { data: docToPromo(snap), error: null }
      }
      const ref = await addDoc(collection(db, 'promo_codes'), {
        ...rest,
        code: (rest.code ?? '').toUpperCase(),
        uses_count: 0,
        created_at: serverTimestamp(),
      })
      const snap = await getDoc(ref)
      return { data: docToPromo(snap), error: null }
    } catch (error: any) {
      return { data: null, error: { message: error?.message ?? String(error) } }
    }
  }

  async function adminDeletePromo(id: string) {
    try {
      await deleteDoc(doc(db, 'promo_codes', id))
      return { error: null }
    } catch (error: any) {
      return { error: { message: error?.message ?? String(error) } }
    }
  }

  // Delivery options
  async function adminGetDelivery() {
    try {
      const q = query(collection(db, 'delivery_options'), orderBy('price'))
      const snap = await getDocs(q)
      return { data: snap.docs.map(docToDeliveryOption) as DeliveryOption[], error: null }
    } catch (error: any) {
      return { data: null, error: error?.message ?? String(error) }
    }
  }

  async function adminUpsertDelivery(d: Partial<DeliveryOption>) {
    try {
      const { id, ...rest } = d
      if (id) {
        await updateDoc(doc(db, 'delivery_options', id), rest)
        const snap = await getDoc(doc(db, 'delivery_options', id))
        return { data: docToDeliveryOption(snap), error: null }
      }
      const ref = await addDoc(collection(db, 'delivery_options'), rest)
      const snap = await getDoc(ref)
      return { data: docToDeliveryOption(snap), error: null }
    } catch (error: any) {
      return { data: null, error: { message: error?.message ?? String(error) } }
    }
  }

  return {
    getDashboardStats,
    adminGetProducts, adminUpsertProduct, adminDeleteProduct,
    adminGetOrders, adminUpdateOrderStatus,
    adminGetCustomers,
    adminGetPromos, adminUpsertPromo, adminDeletePromo,
    adminGetDelivery, adminUpsertDelivery,
  }
}
