import { GoogleAuthProvider, signInWithPopup, type User } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

// Google sign-in, shared by login and register pages
export function useGoogleAuth() {
  const auth = useFirebaseAuth()!
  const db = useFirestore()

  async function signInWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider()
    const cred = await signInWithPopup(auth, provider)

    // create profile doc on first sign-in
    const profileRef = doc(db, 'users', cred.user.uid)
    const existing = await getDoc(profileRef)
    if (!existing.exists()) {
      await setDoc(profileRef, {
        email: cred.user.email ?? '',
        full_name: cred.user.displayName ?? null,
        phone: cred.user.phoneNumber ?? null,
        role: 'customer',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })
    }

    return cred.user
  }

  function friendlyGoogleAuthError(code?: string) {
    switch (code) {
      case 'auth/popup-closed-by-user': return ''
      case 'auth/popup-blocked': return 'Your browser blocked the sign-in popup. Please allow popups and try again.'
      case 'auth/account-exists-with-different-credential': return 'An account already exists with this email using a different sign-in method.'
      case 'auth/network-request-failed': return 'Network error. Please check your connection and try again.'
      default: return 'Could not sign in with Google. Please try again.'
    }
  }

  return { signInWithGoogle, friendlyGoogleAuthError }
}
