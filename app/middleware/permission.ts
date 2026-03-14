// middleware/permission.ts
//
// Cara pakai di page:
//
//   definePageMeta({
//     layout: 'default',
//     middleware: ['permission'],
//     requiredPermission: 'unit.view',
//   })

import { useAuthStore } from '@/stores/useAuthStore'
import type { Permission } from '@/stores/useAuthStore'

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  // Belum login → ke halaman login
  if (!authStore.isLoggedIn) {
    return navigateTo('/login')
  }

  // Cek permission jika halaman mendefinisikan requiredPermission
  const required = to.meta.requiredPermission as Permission | undefined
  if (required && !authStore.can(required)) {
    // Punya akun tapi tidak punya akses → 403
    return navigateTo('/403')
  }
})