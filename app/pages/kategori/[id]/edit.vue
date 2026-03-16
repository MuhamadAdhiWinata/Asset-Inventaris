<!-- pages/kategori/[id]/edit.vue -->
<template>
  <main class="p-4 md:px-6">
    <KategoriForm
      :initial-data="item"
      :loading-data="loadingData"
      :fetch-error="fetchError"
      :submitting="submitting"
      @submit="handleSubmit"
      @retry="fetchItem"
    />
  </main>
</template>

<script setup lang="ts">
import { kategoriService, type Kategori, type KategoriFormData } from '@/services/kategoriService'
import KategoriForm from '@/components/features/kategori/KategoriForm.vue'

definePageMeta({
  layout: 'default',
  middleware: ['permission'],
  requiredPermission: 'master.edit',
})

const route = useRoute()
const id    = computed(() => Number(route.params.id))

const item        = ref<Kategori | null>(null)
const loadingData = ref(true)
const fetchError  = ref<string | null>(null)
const submitting  = ref(false)

async function fetchItem() {
  loadingData.value = true
  fetchError.value  = null
  try {
    const found = await kategoriService.getItemById(id.value)
    if (!found) {
      fetchError.value = `Kategori dengan ID ${id.value} tidak ditemukan.`
      return
    }
    item.value = found
  } catch (err) {
    fetchError.value = 'Gagal memuat data. Silakan coba lagi.'
    console.error('fetchItem error:', err)
  } finally {
    loadingData.value = false
  }
}

onMounted(fetchItem)

async function handleSubmit(data: KategoriFormData) {
  submitting.value = true
  try {
    await kategoriService.updateItem(id.value, data)
    await navigateTo('/kategori')
  } catch (err) {
    console.error('handleSubmit error:', err)
  } finally {
    submitting.value = false
  }
}
</script>