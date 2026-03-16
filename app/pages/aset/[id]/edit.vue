<!-- pages/aset/[id]/edit.vue -->
<template>
  <main class="p-4 md:px-6">
    <AsetForm
      :initial-data="item"
      :barang-list="barangList"
      :unit-list="unitList"
      :show-unit-select="false"
      :loading-data="loadingData"
      :fetch-error="fetchError"
      :submitting="submitting"
      @submit="handleSubmit"
      @retry="fetchAll"
    />
  </main>
</template>

<script setup lang="ts">
import { asetService, type Aset, type AsetFormData } from '@/services/asetService'
import { barangService, type Barang } from '@/services/barangService'
import { unitKantorService, type UnitKantor } from '@/services/unitKantorService'
import AsetForm from '@/components/features/aset/AsetForm.vue'

definePageMeta({
  layout: 'default',
  middleware: ['permission'],
  requiredPermission: 'asset.edit',
})

const route = useRoute()
const id    = computed(() => Number(route.params.id))

const item        = ref<Aset | null>(null)
const barangList  = ref<Barang[]>([])
const unitList    = ref<UnitKantor[]>([])
const loadingData = ref(true)
const fetchError  = ref<string | null>(null)
const submitting  = ref(false)

async function fetchAll() {
  loadingData.value = true
  fetchError.value  = null
  try {
    const [found, barangs, units] = await Promise.all([
      asetService.getItemById(id.value),
      barangService.getActiveItems(),
      unitKantorService.getActiveItems(),
    ])
    if (!found) {
      fetchError.value = `Aset dengan ID ${id.value} tidak ditemukan.`
      return
    }
    item.value       = found
    barangList.value = barangs
    unitList.value   = units
  } catch (err) {
    fetchError.value = 'Gagal memuat data. Silakan coba lagi.'
  } finally {
    loadingData.value = false
  }
}

onMounted(fetchAll)

async function handleSubmit(data: AsetFormData & { barangMeta: Barang; unitNama: string }) {
  submitting.value = true
  try {
    // Edit hanya update field yang boleh diubah
    await asetService.updateItem(id.value, {
      status:        data.status,
      akmDepresiasi: data.akmDepresiasi,
      nilaiBuku:     Math.max(0, data.hargaPerolehan - data.akmDepresiasi),
    })
    await navigateTo('/aset')
  } catch (err) {
    console.error('handleSubmit error:', err)
  } finally {
    submitting.value = false
  }
}
</script>