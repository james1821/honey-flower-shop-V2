export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase', '@pinia/nuxt', '@vueuse/nuxt'],
  supabase: { redirect: false },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
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
          href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap',
        },
      ],
    },
  },
})
