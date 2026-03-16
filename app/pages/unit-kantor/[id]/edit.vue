<!-- pages/unit-kantor/[id]/edit.vue -->
<template>
  <main class="p-4 md:px-6">
    <UnitKantorForm
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
import { unitKantorService, type UnitKantor, type UnitKantorFormData } from '@/services/unitKantorService'
import UnitKantorForm from '@/components/features/unit-kantor/UnitKantorForm.vue'

definePageMeta({
  layout: 'default',
  middleware: ['permission'],
  requiredPermission: 'unit.manage',
})

const route = useRoute()
const id    = computed(() => Number(route.params.id))

const item        = ref<UnitKantor | null>(null)
const loadingData = ref(true)
const fetchError  = ref<string | null>(null)
const submitting  = ref(false)

async function fetchItem() {
  loadingData.value = true
  fetchError.value  = null
  try {
    const found = await unitKantorService.getItemById(id.value)
    if (!found) {
      fetchError.value = `Unit kantor dengan ID ${id.value} tidak ditemukan.`
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

async function handleSubmit(data: UnitKantorFormData) {
  submitting.value = true
  try {
    await unitKantorService.updateItem(id.value, data)
    await navigateTo('/unit-kantor')
  } catch (err) {
    console.error('handleSubmit error:', err)
  } finally {
    submitting.value = false
  }
}
</script>