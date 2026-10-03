
import { doc, getDoc } from 'firebase/firestore'

export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin')) return
  // wait for auth state before checking
  const user = await getCurrentUser()
  if (!user) return navigateTo('/auth/login?redirect=' + to.fullPath)
  const db = useFirestore()
  const snap = await getDoc(doc(db, 'users', user.uid))
  if (snap.data()?.role !== 'admin') return navigateTo('/?unauthorized=1')
})
