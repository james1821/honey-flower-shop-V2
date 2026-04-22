export interface GalleryItem {
  id: string
  type: 'work' | 'customer'
  image_url: string
  caption: string | null
  customer_name: string | null
  rating: number | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export function useGallery() {
  const supabase = useSupabaseClient()

  async function getGalleryItems(type?: 'work' | 'customer') {
    let q = supabase
      .from('gallery_items')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (type) q = q.eq('type', type)

    const { data, error } = await q
    return { data: data as GalleryItem[] | null, error }
  }

  async function adminGetAllGallery() {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .order('sort_order', { ascending: true })
    return { data: data as GalleryItem[] | null, error }
  }

  async function adminUpsertGalleryItem(item: Partial<GalleryItem>) {
    if (item.id) {
      const { data, error } = await supabase
        .from('gallery_items')
        .update(item)
        .eq('id', item.id)
        .select()
        .maybeSingle()
      return { data, error }
    }
    const { data, error } = await supabase
      .from('gallery_items')
      .insert(item)
      .select()
      .maybeSingle()
    return { data, error }
  }

  async function adminDeleteGalleryItem(id: string) {
    const { error } = await supabase.from('gallery_items').delete().eq('id', id)
    return { error }
  }

  async function adminReorder(items: { id: string; sort_order: number }[]) {
    const updates = items.map(item =>
      supabase.from('gallery_items').update({ sort_order: item.sort_order }).eq('id', item.id)
    )
    await Promise.all(updates)
  }

  return {
    getGalleryItems,
    adminGetAllGallery,
    adminUpsertGalleryItem,
    adminDeleteGalleryItem,
    adminReorder,
  }
}