import type { Product, Category, DeliveryOption, ProductType } from '~/types'

export function useProducts() {
  const supabase = useSupabaseClient()

  async function getProducts(opts?: { type?: ProductType; featured?: boolean; search?: string; page?: number; pageSize?: number }) {
    const page = opts?.page ?? 1
    const ps = opts?.pageSize ?? 24
    let q = supabase.from('products').select('*, category:categories(*), variants:product_variants(*)', { count: 'exact' })
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range((page - 1) * ps, page * ps - 1)

    if (opts?.type) q = q.eq('type', opts.type)
    if (opts?.featured) q = q.eq('is_featured', true)
    if (opts?.search) q = q.ilike('name', `%${opts.search}%`)

    const { data, error, count } = await q
    return { data: data as Product[] | null, error, count }
  }

  async function getProduct(slug: string) {
    const { data, error } = await supabase
      .from('products').select('*, category:categories(*), variants:product_variants(*)')
      .eq('slug', slug).eq('is_active', true).maybeSingle()
    return { data: data as Product | null, error }
  }

  async function getCategories() {
    const { data, error } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
    return { data: data as Category[] | null, error }
  }

  async function getDeliveryOptions() {
    const { data, error } = await supabase.from('delivery_options').select('*').eq('is_active', true)
    return { data: data as DeliveryOption[] | null, error }
  }

  return { getProducts, getProduct, getCategories, getDeliveryOptions }
}
