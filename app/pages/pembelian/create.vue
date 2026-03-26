<!-- pages/pembelian/create.vue -->
<template>
  <main class="p-4 md:px-6">
    <PembelianForm
      :barang-list="barangList"
      :supplier-list="supplierList"
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
import { transaksiService, type PembelianFormData } from '@/services/transaksiService'
import { barangService, type Barang } from '@/services/barangService'
import { supplierService, type Supplier } from '@/services/supplierService'
import { unitKantorService, type UnitKantor } from '@/services/unitKantorService'
import { useAuthStore } from '@/stores/useAuthStore'
import PembelianForm from '@/components/features/pembelian/PembelianForm.vue'

definePageMeta({
  layout: 'default',
  middleware: ['permission'],
  requiredPermission: 'transaction.create',
})

const authStore = useAuthStore()

const barangList    = ref<Barang[]>([])
const supplierList  = ref<Supplier[]>([])
const unitList      = ref<UnitKantor[]>([])
const loadingLookup = ref(true)
const submitting    = ref(false)

onMounted(async () => {
  try {
    const [barangs, suppliers, units] = await Promise.all([
      barangService.getActiveItems(),
      supplierService.getActiveItems(),
      unitKantorService.getActiveItems(),
    ])
    barangList.value   = barangs
    supplierList.value = suppliers
    unitList.value     = units
  } catch (err) {
    console.error('Failed to load lookup:', err)
  } finally {
    loadingLookup.value = false
  }
})

async function handleSubmit(data: PembelianFormData & {
  itemsMeta: {
    supplierId: number
    supplierNama: string
    barangNama: string
    barangKode: string
    kategoriNama: string
    unitNama: string
  }[]
}) {
  submitting.value = true
  try {
    const result = await transaksiService.createPembelian(
      {
        unitId:     data.unitId,
        tanggal:    data.tanggal,
        keterangan: data.keterangan,
        items:      data.items,
      },
      {
        createdBy: authStore.user?.id ?? 0,
        itemsMeta: data.itemsMeta,
      }
    )

    // Redirect ke halaman list dengan info aset yang dibuat
    await navigateTo('/pembelian')
  } catch (err) {
    console.error('handleSubmit error:', err)
  } finally {
    submitting.value = false
  }
}
</script>