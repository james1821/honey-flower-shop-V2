import type { Product, Order, OrderStatus, PromoCode, DeliveryOption, DashboardStats, Profile } from '~/types'

export function useAdmin() {
  const supabase = useSupabaseClient()

  // Dashboard
  async function getDashboardStats(): Promise<{ data: DashboardStats | null; error: string | null }> {
    const now = new Date()
    const d30 = new Date(now.getTime() - 30 * 86400000).toISOString()
    const d60 = new Date(now.getTime() - 60 * 86400000).toISOString()

    const [cur, prev, customers, recent] = await Promise.all([
      supabase.from('orders').select('total,status,created_at').gte('created_at', d30),
      supabase.from('orders').select('total').gte('created_at', d60).lt('created_at', d30),
      supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'customer'),
      supabase.from('orders').select('*, customer:profiles(full_name,email), delivery_option:delivery_options(name)').order('created_at', { ascending: false }).limit(8),
    ])

    const orders = cur.data ?? []
    const prevOrders = prev.data ?? []
    const rev = orders.reduce((s, o) => s + Number(o.total), 0)
    const prevRev = prevOrders.reduce((s, o) => s + Number(o.total), 0)
    const days = Array.from({ length: 14 }, (_, i) => new Date(now.getTime() - i * 86400000).toISOString().split('T')[0]).reverse()
    const revenueByDay = days.map(date => ({
      date,
      revenue: orders.filter(o => o.created_at.startsWith(date)).reduce((s, o) => s + Number(o.total), 0),
    }))

    return {
      data: {
        totalRevenue: rev,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        totalCustomers: customers.count ?? 0,
        revenueChange: prevRev > 0 ? ((rev - prevRev) / prevRev) * 100 : 0,
        ordersChange: prevOrders.length > 0 ? ((orders.length - prevOrders.length) / prevOrders.length) * 100 : 0,
        recentOrders: (recent.data ?? []) as Order[],
        revenueByDay,
      },
      error: null,
    }
  }

  // Products
  async function adminGetProducts(page = 1, ps = 20, search = '') {
    let q = supabase.from('products').select('*, category:categories(*)', { count: 'exact' })
      .order('created_at', { ascending: false }).range((page - 1) * ps, page * ps - 1)
    if (search) q = q.ilike('name', `%${search}%`)
    const { data, error, count } = await q
    return { data: data as Product[] | null, error, count }
  }

  async function adminUpsertProduct(p: Partial<Product> & { id?: string }) {
    if (p.id) {
      const { data, error } = await supabase.from('products').update({ ...p, updated_at: new Date().toISOString() }).eq('id', p.id).select().maybeSingle()
      return { data, error }
    }
    const { data, error } = await supabase.from('products').insert(p).select().maybeSingle()
    return { data, error }
  }

  async function adminDeleteProduct(id: string) {
    return await supabase.from('products').delete().eq('id', id)
  }

  // Orders
  async function adminGetOrders(page = 1, ps = 20, status?: OrderStatus) {
    let q = supabase.from('orders')
      .select('*, customer:profiles(full_name,email), items:order_items(*), delivery_option:delivery_options(name)', { count: 'exact' })
      .order('created_at', { ascending: false }).range((page - 1) * ps, page * ps - 1)
    if (status) q = q.eq('status', status)
    const { data, error, count } = await q
    return { data: data as Order[] | null, error, count }
  }

  async function adminUpdateOrderStatus(id: string, status: OrderStatus) {
    const { data, error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id).select().maybeSingle()
    return { data, error }
  }

  // Customers
  async function adminGetCustomers(page = 1, ps = 20, search = '') {
    let q = supabase.from('profiles').select('*', { count: 'exact' }).eq('role', 'customer')
      .order('created_at', { ascending: false }).range((page - 1) * ps, page * ps - 1)
    if (search) q = q.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    const { data, error, count } = await q
    return { data: data as Profile[] | null, error, count }
  }

  // Promos
  async function adminGetPromos() {
    const { data, error } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false })
    return { data: data as PromoCode[] | null, error }
  }

  async function adminUpsertPromo(p: Partial<PromoCode>) {
    if (p.id) {
      const { data, error } = await supabase.from('promo_codes').update(p).eq('id', p.id).select().maybeSingle()
      return { data, error }
    }
    const { data, error } = await supabase.from('promo_codes').insert(p).select().maybeSingle()
    return { data, error }
  }

  async function adminDeletePromo(id: string) { return await supabase.from('promo_codes').delete().eq('id', id) }

  // Delivery options
  async function adminGetDelivery() {
    const { data, error } = await supabase.from('delivery_options').select('*').order('price')
    return { data: data as DeliveryOption[] | null, error }
  }

  async function adminUpsertDelivery(d: Partial<DeliveryOption>) {
    if (d.id) {
      const { data, error } = await supabase.from('delivery_options').update(d).eq('id', d.id).select().maybeSingle()
      return { data, error }
    }
    const { data, error } = await supabase.from('delivery_options').insert(d).select().maybeSingle()
    return { data, error }
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
