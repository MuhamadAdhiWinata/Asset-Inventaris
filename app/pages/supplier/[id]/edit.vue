<!-- pages/supplier/[id]/edit.vue -->
<template>
  <main class="p-4 md:px-6">
    <SupplierForm
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
import { supplierService, type Supplier, type SupplierFormData } from '@/services/supplierService'
import SupplierForm from '@/components/features/supplier/SupplierForm.vue'

definePageMeta({
  layout: 'default',
  middleware: ['permission'],
  requiredPermission: 'master.edit',
})

const route = useRoute()
const id    = computed(() => Number(route.params.id))

const item        = ref<Supplier | null>(null)
const loadingData = ref(true)
const fetchError  = ref<string | null>(null)
const submitting  = ref(false)

async function fetchItem() {
  loadingData.value = true
  fetchError.value  = null
  try {
    const found = await supplierService.getItemById(id.value)
    if (!found) {
      fetchError.value = `Supplier dengan ID ${id.value} tidak ditemukan.`
      return
    }
    item.value = found
  } catch (err) {
    fetchError.value = 'Gagal memuat data. Silakan coba lagi.'
  } finally {
    loadingData.value = false
  }
}

onMounted(fetchItem)

async function handleSubmit(data: SupplierFormData) {
  submitting.value = true
  try {
    await supplierService.updateItem(id.value, data)
    await navigateTo('/supplier')
  } catch (err) {
    console.error('handleSubmit error:', err)
  } finally {
    submitting.value = false
  }
}
</script>