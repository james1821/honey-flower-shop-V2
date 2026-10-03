export default defineNuxtConfig({
  compatibilityDate: '2026-09-29',
  
  // Disable Server-Side Rendering (runs as a Client-Side SPA)
  ssr: false,

  devtools: { enabled: true },
  modules: ['nuxt-vuefire', '@pinia/nuxt', '@vueuse/nuxt'],

  // SPA mode: no server/api routes, avoids needing a Firebase Admin service account
  ssr: false,

  vuefire: {
    config: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    },
    auth: {
      enabled: true,
    },
  },

  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      appName: 'Handmade By Honey',
      currencySymbol: '₱',
      // Cloudinary image hosting
      cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
      cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
    },
  },
  typescript: { strict: true },
  app: {
    head: {
      title: 'Handmade By Honey — Flowers & Gifts',
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