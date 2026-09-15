export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['nuxt-vuefire', '@pinia/nuxt', '@vueuse/nuxt'],

  vuefire: {
    // Firebase project config (safe to expose client-side — these are public identifiers,
    // access is controlled by Firestore/Storage security rules, not by hiding these values).
    config: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    },
    auth: {
      enabled: true,
      // sessionCookie is left off (default) so no Firebase Admin service account is required.
      // Auth state is handled client-side via VueFire, same trust model the app already used with Supabase's anon key.
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
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap',
        },
      ],
    },
  },
})
