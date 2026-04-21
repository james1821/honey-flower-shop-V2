<template>
  <div class="auth-page">
    <div class="auth-card">
      <NuxtLink to="/" class="auth-logo">Handmade By Honey</NuxtLink>
      <h1>Create account</h1>
      <p class="auth-sub">Join Handmade By Honey </p>

      <form @submit.prevent="register" class="auth-form">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input v-model="name" class="form-input" placeholder="Your full name" required />
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input v-model="email" type="email" class="form-input" placeholder="you@example.com" required />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input v-model="password" type="password" class="form-input" placeholder="Min. 8 characters" minlength="8" required />
        </div>
        <p v-if="err" class="form-error">{{ err }}</p>
        <button type="submit" class="btn btn-primary btn-lg" style="width:100%" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Create Account</span>
        </button>
      </form>

      <p class="auth-footer">Already have an account? <NuxtLink to="/auth/login">Sign in</NuxtLink></p>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const { success } = useToast()
const name = ref(''), email = ref(''), password = ref(''), err = ref(''), loading = ref(false)

async function register() {
  loading.value = true; err.value = ''
  const { error } = await supabase.auth.signUp({
    email: email.value, password: password.value,
    options: { data: { full_name: name.value } }
  })
  loading.value = false
  if (error) { err.value = error.message; return }
  success('Account created! Please check your email to verify.')
  navigateTo('/auth/login')
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
</style>
