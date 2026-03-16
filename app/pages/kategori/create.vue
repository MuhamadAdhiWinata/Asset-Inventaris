<!-- pages/kategori/create.vue -->
<template>
  <main class="p-4 md:px-6">
    <KategoriForm
      :initial-data="null"
      :submitting="submitting"
      @submit="handleSubmit"
    />
  </main>
</template>

<script setup lang="ts">
import { kategoriService, type KategoriFormData } from '@/services/kategoriService'
import KategoriForm from '@/components/features/kategori/KategoriForm.vue'

definePageMeta({
  layout: 'default',
  middleware: ['permission'],
  requiredPermission: 'master.create',
})

const submitting = ref(false)

async function handleSubmit(data: KategoriFormData) {
  submitting.value = true
  try {
    await kategoriService.createItem(data)
    await navigateTo('/kategori')
  } catch (err) {
    console.error('handleSubmit error:', err)
  } finally {
    submitting.value = false
  }
}
</script>