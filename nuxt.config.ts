// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  ssr: false,

  app: {
    baseURL: '/portfolio_2026/',
    buildAssetsDir: '/assets/'
  },


  css: [
    '@/assets/main.scss',
  ],

  modules: [
    '@nuxt/ui',
  ],

  // Configuración para GitHub Pages
  nitro: {
    preset: 'github-pages'
  },

  experimental: {
    payloadExtraction: false
  }
})