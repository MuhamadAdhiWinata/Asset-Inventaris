<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/useAuthStore'
import { onMounted } from 'vue'

const authStore = useAuthStore()

// Restore session hanya di client (SSR-safe)
onMounted(() => {
  authStore.restoreSession()
})
</script>