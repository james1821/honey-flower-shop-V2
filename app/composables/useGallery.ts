import {
  collection, query, where, orderBy, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc,
  serverTimestamp, writeBatch,
} from 'firebase/firestore'
import { docToGalleryItem } from '~/utils/firestore-mappers'

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
  const db = useFirestore()

  async function getGalleryItems(type?: 'work' | 'customer') {
    try {
      const constraints = [where('is_active', '==', true)]
      if (type) constraints.push(where('type', '==', type))
      const q = query(collection(db, 'gallery_items'), ...constraints, orderBy('sort_order', 'asc'))
      const snap = await getDocs(q)
      return { data: snap.docs.map(docToGalleryItem), error: null }
    } catch (error: any) {
      return { data: null, error: error?.message ?? String(error) }
    }
  }

  async function adminGetAllGallery() {
    try {
      const q = query(collection(db, 'gallery_items'), orderBy('sort_order', 'asc'))
      const snap = await getDocs(q)
      return { data: snap.docs.map(docToGalleryItem), error: null }
    } catch (error: any) {
      return { data: null, error: error?.message ?? String(error) }
    }
  }

  async function adminUpsertGalleryItem(item: Partial<GalleryItem>) {
    try {
      const { id, ...rest } = item
      if (id) {
        const ref = doc(db, 'gallery_items', id)
        await updateDoc(ref, { ...rest, updated_at: serverTimestamp() })
        const snap = await getDoc(ref)
        return { data: snap.exists() ? docToGalleryItem(snap) : null, error: null }
      }
      const ref = await addDoc(collection(db, 'gallery_items'), { ...rest, created_at: serverTimestamp() })
      return { data: { id: ref.id, ...rest } as GalleryItem, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error?.message ?? String(error) } }
    }
  }

  async function adminDeleteGalleryItem(id: string) {
    try {
      await deleteDoc(doc(db, 'gallery_items', id))
      return { error: null }
    } catch (error: any) {
      return { error: { message: error?.message ?? String(error) } }
    }
  }

  async function adminReorder(items: { id: string; sort_order: number }[]) {
    const batch = writeBatch(db)
    items.forEach(item => batch.update(doc(db, 'gallery_items', item.id), { sort_order: item.sort_order }))
    await batch.commit()
  }

  return {
    getGalleryItems,
    adminGetAllGallery,
    adminUpsertGalleryItem,
    adminDeleteGalleryItem,
    adminReorder,
  }
}
