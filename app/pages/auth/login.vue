<template>
  <div class="auth-page">
    <div class="auth-card">
      <NuxtLink to="/" class="auth-logo">Handmade By Honey</NuxtLink>
      <h1>Welcome back</h1>
      <p class="auth-sub">Sign in to track your orders and more</p>

      <form @submit.prevent="login" class="auth-form">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input v-model="email" type="email" class="form-input" placeholder="you@example.com" required />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input v-model="password" type="password" class="form-input" placeholder="••••••••" required />
        </div>
        <p v-if="err" class="form-error">{{ err }}</p>
        <button type="submit" class="btn btn-primary btn-lg" style="width:100%" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Sign In</span>
        </button>
      </form>

      <div class="auth-divider"><span>or</span></div>

      <button type="button" class="btn btn-google" :disabled="googleLoading" @click="loginWithGoogle">
        <span v-if="googleLoading" class="spinner"></span>
        <template v-else>
          <GoogleIcon />
          Continue with Google
        </template>
      </button>

      <p class="auth-footer">Don't have an account? <NuxtLink to="/auth/register">Register</NuxtLink></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { signInWithEmailAndPassword } from 'firebase/auth'

const auth = useFirebaseAuth()!
const { success, error: toastError } = useToast()
const route = useRoute()
const { signInWithGoogle, friendlyGoogleAuthError } = useGoogleAuth()

const email = ref(''), password = ref(''), err = ref(''), loading = ref(false)
const googleLoading = ref(false)

async function login() {
  loading.value = true; err.value = ''
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    success('Welcome back!')
    navigateTo((route.query.redirect as string) || '/')
  } catch (e: any) {
    err.value = friendlyAuthError(e?.code)
  } finally {
    loading.value = false
  }
}

async function loginWithGoogle() {
  googleLoading.value = true; err.value = ''
  try {
    await signInWithGoogle()
    success('Welcome back!')
    navigateTo((route.query.redirect as string) || '/')
  } catch (e: any) {
    const message = friendlyGoogleAuthError(e?.code)
    if (message) toastError(message)
  } finally {
    googleLoading.value = false
  }
}

function friendlyAuthError(code?: string) {
  switch (code) {
    case 'auth/invalid-email': return 'That email address looks invalid.'
    case 'auth/user-disabled': return 'This account has been disabled.'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'Incorrect email or password.'
    case 'auth/too-many-requests': return 'Too many attempts. Please try again later.'
    default: return 'Could not sign in. Please try again.'
  }
}
</script>

<style scoped>
.auth-page { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:40px 24px; background:var(--cream); }
.auth-card { background:#fff; border-radius:var(--radius-xl); border:1px solid var(--border); padding:48px 40px; width:100%; max-width:420px; box-shadow:var(--shadow-md); }
.auth-logo { font-family:var(--font-serif); font-size:24px; display:block; margin-bottom:28px; color:var(--purple); }
.auth-card h1 { font-size:30px; margin-bottom:6px; }
.auth-sub { color:var(--gray); margin-bottom:28px; }
.auth-form { display:flex; flex-direction:column; gap:16px; }
.auth-footer { text-align:center; margin-top:20px; font-size:14px; color:var(--gray); }
.auth-footer a { color:var(--purple); font-weight:600; }

.auth-divider { display:flex; align-items:center; gap:12px; margin:20px 0; color:var(--gray-light); font-size:13px; }
.auth-divider::before, .auth-divider::after { content:''; flex:1; height:1px; background:var(--border); }

.btn-google {
  width:100%; display:flex; align-items:center; justify-content:center; gap:10px;
  padding:12px 16px; border-radius:var(--radius-md); border:1.5px solid var(--border);
  background:#fff; font-size:15px; font-weight:500; cursor:pointer; transition:all var(--t);
}
.btn-google:hover:not(:disabled) { border-color:var(--purple); background:var(--cream); }
.btn-google:disabled { opacity:.7; cursor:wait; }
</style>
