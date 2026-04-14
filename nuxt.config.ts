// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/assets/css/tailwind.css'],
  modules: ['shadcn-nuxt', '@pinia/nuxt'],
  shadcn: {
    prefix: '',
    componentDir: './app/components/ui'
  },
  vite: {
    plugins: [
      // @ts-ignore
      tailwindcss()
    ]
  },
  app: {
    pageTransition: {
      name: 'page',
      mode: 'out-in',
    },
  },
})