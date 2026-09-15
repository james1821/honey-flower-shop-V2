import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { docToPopup } from '~/utils/firestore-mappers'

export interface PopupBanner {
  id: string
  image_url: string
  link_url: string | null
  is_active: boolean
  updated_at: string
}

// The site only ever shows one popup banner, so it lives at a fixed document id
// instead of a full collection — simpler than Supabase's "one row" table.
const POPUP_DOC_ID = 'main'

export function usePopup() {
  const db = useFirestore()
  const SESSION_KEY = 'florette_popup_seen'

  async function getPopup() {
    try {
      const snap = await getDoc(doc(db, 'popup_banner', POPUP_DOC_ID))
      if (!snap.exists() || !snap.data().is_active) return { data: null, error: null }
      return { data: docToPopup(snap), error: null }
    } catch (error: any) {
      return { data: null, error: error?.message ?? String(error) }
    }
  }

  async function adminGetPopup() {
    try {
      const snap = await getDoc(doc(db, 'popup_banner', POPUP_DOC_ID))
      if (!snap.exists()) return { data: null, error: null }
      return { data: docToPopup(snap), error: null }
    } catch (error: any) {
      return { data: null, error: error?.message ?? String(error) }
    }
  }

  async function adminSavePopup(payload: Partial<PopupBanner> & { id?: string }) {
    try {
      const { id, ...rest } = payload
      const ref = doc(db, 'popup_banner', POPUP_DOC_ID)
      await setDoc(ref, { ...rest, updated_at: serverTimestamp() }, { merge: true })
      const snap = await getDoc(ref)
      return { data: docToPopup(snap), error: null }
    } catch (error: any) {
      return { data: null, error: { message: error?.message ?? String(error) } }
    }
  }

  function hasSeenPopup(): boolean {
    if (typeof sessionStorage === 'undefined') return false
    return sessionStorage.getItem(SESSION_KEY) === '1'
  }

  function markPopupSeen() {
    if (typeof sessionStorage === 'undefined') return
    sessionStorage.setItem(SESSION_KEY, '1')
  }

  return { getPopup, adminGetPopup, adminSavePopup, hasSeenPopup, markPopupSeen }
}
