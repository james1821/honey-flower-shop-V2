export interface PopupBanner {
  id: string
  image_url: string
  link_url: string | null
  is_active: boolean
  updated_at: string
}

export function usePopup() {
  const supabase = useSupabaseClient()
  const SESSION_KEY = 'florette_popup_seen'

  async function getPopup() {
    const { data, error } = await supabase
      .from('popup_banner')
      .select('*')
      .eq('is_active', true)
      .maybeSingle()
    return { data: data as PopupBanner | null, error }
  }

  async function adminGetPopup() {
    const { data, error } = await supabase
      .from('popup_banner')
      .select('*')
      .maybeSingle()
    return { data: data as PopupBanner | null, error }
  }

  async function adminSavePopup(payload: Partial<PopupBanner> & { id?: string }) {
    if (payload.id) {
      const { data, error } = await supabase
        .from('popup_banner')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', payload.id)
        .select()
        .maybeSingle()
      return { data, error }
    }
    // Insert if no row exists yet
    const { data, error } = await supabase
      .from('popup_banner')
      .insert({ ...payload, updated_at: new Date().toISOString() })
      .select()
      .maybeSingle()
    return { data, error }
  }

  // Session helpers
  function hasSeenPopup(): boolean {
    if (typeof sessionStorage === 'undefined') return false
    return sessionStorage.getItem(SESSION_KEY) === '1'
  }

  function markPopupSeen() {
    if (typeof sessionStorage === 'undefined') return
    sessionStorage.setItem(SESSION_KEY, '1') // Mark as seen
  }

  return { getPopup, adminGetPopup, adminSavePopup, hasSeenPopup, markPopupSeen }
}