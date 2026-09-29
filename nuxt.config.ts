export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['nuxt-vuefire', '@pinia/nuxt', '@vueuse/nuxt'],

  vuefire: {
    // 1. Explicitly tell nuxt-vuefire NOT to look for firebase-admin on the server
    admin: {
      enabled: false,
    },
    auth: {
      enabled: true,
      // sessionCookie: false is enforced when admin is disabled
    },
    // 2. Fallbacks handle both process.env.FIREBASE_* and NUXT_PUBLIC_FIREBASE_*
    config: {
      apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
      authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
    },
  },

  // 3. Prevent Nitro / Vite from attempting to bundle firebase-admin on Vercel
  nitro: {
    externals: {
      exclude: ['firebase-admin'],
    },
  },

  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      appName: 'Handmade By Honey',
      currencySymbol: '₱',
    },
  },
  typescript: { strict: true },
  app: {
    head: {
      title: 'Handmade By Honey — Flowers & Gifts ',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'icon', type: 'image/jpeg', href: '/logo.jpg' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap',
        },
      ],
    },
  },
})