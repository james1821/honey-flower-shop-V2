import { doc, getDoc } from 'firebase/firestore'

export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin')) return
  // getCurrentUser() waits for Firebase Auth's first state resolution instead of reading
  // useCurrentUser().value immediately, which can still be null while auth is initializing.
  const user = await getCurrentUser()
  if (!user) return navigateTo('/auth/login?redirect=' + to.fullPath)
  const db = useFirestore()
  const snap = await getDoc(doc(db, 'users', user.uid))
  if (snap.data()?.role !== 'admin') return navigateTo('/?unauthorized=1')
})
