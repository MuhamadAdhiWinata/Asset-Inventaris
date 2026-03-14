<!-- pages/unit-kantor/index.vue -->
<template>
  <main class="p-4 md:px-6">
    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b pb-4 mb-4">
      <div>
        <h1 class="text-xl font-bold tracking-tight">Unit Kantor</h1>
        <p class="text-muted-foreground text-sm mt-1">Kelola data unit kantor.</p>
      </div>
      <button
        v-if="authStore.can('unit.manage')"
        @click="navigateTo('/unit-kantor/create')"
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4"
      >
        <PlusIcon class="mr-2 h-4 w-4" />
        Tambah Unit
      </button>
    </div>

    <!-- table akan diisi sesuai template -->
  </main>
</template>

<script setup lang="ts">
import { PlusIcon } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/useAuthStore'

// ── Guard: hanya yang punya unit.view yang bisa akses ─────────
definePageMeta({
  layout: 'default',
  middleware: ['permission'],
  requiredPermission: 'unit.view',
})

const authStore = useAuthStore()
</script>