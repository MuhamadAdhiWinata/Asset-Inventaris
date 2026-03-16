<!-- pages/barang/[id]/edit.vue -->
<template>
  <main class="p-4 md:px-6">
    <BarangForm
      :initial-data="item"
      :kategori-list="kategoriList"
      :loading-data="loadingData"
      :fetch-error="fetchError"
      :submitting="submitting"
      @submit="handleSubmit"
      @retry="fetchAll"
    />
  </main>
</template>

<script setup lang="ts">
import { barangService, type Barang, type BarangFormData } from '@/services/barangService'
import { kategoriService, type Kategori } from '@/services/kategoriService'
import BarangForm from '@/components/features/barang/BarangForm.vue'

definePageMeta({
  layout: 'default',
  middleware: ['permission'],
  requiredPermission: 'master.edit',
})

const route = useRoute()
const id    = computed(() => Number(route.params.id))

const item        = ref<Barang | null>(null)
const kategoriList = ref<Kategori[]>([])
const loadingData = ref(true)
const fetchError  = ref<string | null>(null)
const submitting  = ref(false)

async function fetchAll() {
  loadingData.value = true
  fetchError.value  = null
  try {
    const [found, cats] = await Promise.all([
      barangService.getItemById(id.value),
      kategoriService.getActiveItems(),
    ])
    if (!found) {
      fetchError.value = `Barang dengan ID ${id.value} tidak ditemukan.`
      return
    }
    item.value         = found
    kategoriList.value = cats
  } catch (err) {
    fetchError.value = 'Gagal memuat data. Silakan coba lagi.'
  } finally {
    loadingData.value = false
  }
}

onMounted(fetchAll)

async function handleSubmit(data: BarangFormData) {
  submitting.value = true
  try {
    const kat = kategoriList.value.find(k => k.id === data.kategoriId)
    if (!kat) throw new Error('Kategori tidak ditemukan')
    await barangService.updateItem(id.value, data, kat)
    await navigateTo('/barang')
  } catch (err) {
    console.error('handleSubmit error:', err)
  } finally {
    submitting.value = false
  }
}
</script>