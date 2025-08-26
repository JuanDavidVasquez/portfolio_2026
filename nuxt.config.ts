// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  ssr: true, 
  
  // Configuración para mejorar la detección de carga
  experimental: {
    payloadExtraction: false 
  },

  css: [
    '@/assets/main.scss',
  ],

  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/scripts'
  ],

  // Configuración adicional para el rendimiento del loading
  nitro: {
    // Configuraciones del servidor si necesitas
  },

  // Configurar el app para mejor control del loading
  app: {
    // Configuraciones globales de la app
    head: {
      // Meta tags que pueden afectar la carga
    }
  }
})