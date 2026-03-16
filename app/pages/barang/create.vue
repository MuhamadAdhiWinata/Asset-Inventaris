<!-- pages/barang/create.vue -->
<template>
  <main class="p-4 md:px-6">
    <BarangForm
      :initial-data="null"
      :kategori-list="kategoriList"
      :loading-data="loadingLookup"
      :submitting="submitting"
      @submit="handleSubmit"
    />
  </main>
</template>

<script setup lang="ts">
import { barangService, type BarangFormData } from '@/services/barangService'
import { kategoriService, type Kategori } from '@/services/kategoriService'
import BarangForm from '@/components/features/barang/BarangForm.vue'

definePageMeta({
  layout: 'default',
  middleware: ['permission'],
  requiredPermission: 'master.create',
})

const kategoriList  = ref<Kategori[]>([])
const loadingLookup = ref(true)
const submitting    = ref(false)

onMounted(async () => {
  try {
    kategoriList.value = await kategoriService.getActiveItems()
  } catch (err) {
    console.error('Failed to load kategori:', err)
  } finally {
    loadingLookup.value = false
  }
})

async function handleSubmit(data: BarangFormData) {
  submitting.value = true
  try {
    const kat = kategoriList.value.find(k => k.id === data.kategoriId)
    if (!kat) throw new Error('Kategori tidak ditemukan')
    await barangService.createItem(data, kat)
    await navigateTo('/barang')
  } catch (err) {
    console.error('handleSubmit error:', err)
  } finally {
    submitting.value = false
  }
}
</script>