<!-- pages/aset/create.vue -->
<template>
  <main class="p-4 md:px-6">
    <AsetForm
      :initial-data="null"
      :barang-list="barangList"
      :unit-list="unitList"
      :show-unit-select="!authStore.isUnitScoped"
      :default-unit-id="authStore.activeUnitId ?? 0"
      :loading-data="loadingLookup"
      :submitting="submitting"
      @submit="handleSubmit"
    />
  </main>
</template>

<script setup lang="ts">
import { asetService, type AsetFormData } from '@/services/asetService'
import { barangService, type Barang } from '@/services/barangService'
import { unitKantorService, type UnitKantor } from '@/services/unitKantorService'
import { useAuthStore } from '@/stores/useAuthStore'
import AsetForm from '@/components/features/aset/AsetForm.vue'

definePageMeta({
  layout: 'default',
  middleware: ['permission'],
  requiredPermission: 'asset.create',
})

const authStore = useAuthStore()

const barangList    = ref<Barang[]>([])
const unitList      = ref<UnitKantor[]>([])
const loadingLookup = ref(true)
const submitting    = ref(false)

onMounted(async () => {
  try {
    const [barangs, units] = await Promise.all([
      barangService.getActiveItems(),
      unitKantorService.getActiveItems(),
    ])
    barangList.value = barangs
    unitList.value   = units
  } catch (err) {
    console.error('Failed to load lookup:', err)
  } finally {
    loadingLookup.value = false
  }
})

async function handleSubmit(data: AsetFormData & { barangMeta: Barang; unitNama: string }) {
  submitting.value = true
  try {
    await asetService.createItem(data, {
      barangNama:   data.barangMeta.nama,
      barangKode:   data.barangMeta.kode,
      kategoriNama: data.barangMeta.kategoriNama,
      unitNama:     data.unitNama,
    })
    await navigateTo('/aset')
  } catch (err) {
    console.error('handleSubmit error:', err)
  } finally {
    submitting.value = false
  }
}
</script>