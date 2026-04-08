<!-- pages/transfer/create.vue -->
<template>
  <main class="p-4 md:px-6">
    <TransferForm
      :aset-list="asetList"
      :unit-list="unitList"
      :loading-data="loadingLookup"
      :submitting="submitting"
      @submit="handleSubmit"
    />
  </main>
</template>

<script setup lang="ts">
import { transaksiService, type TransferFormData } from '@/services/transaksiService'
import { asetService, type Aset } from '@/services/asetService'
import { unitKantorService, type UnitKantor } from '@/services/unitKantorService'
import { useAuthStore } from '@/stores/useAuthStore'
import TransferForm from '@/components/features/transfer/TransferForm.vue'

definePageMeta({
  layout: 'default',
  middleware: ['permission'],
  requiredPermission: 'transaction.create',
})

const authStore = useAuthStore()

const asetList      = ref<Aset[]>([])
const unitList      = ref<UnitKantor[]>([])
const loadingLookup = ref(true)
const submitting    = ref(false)

onMounted(async () => {
  try {
    const [asetRes, units] = await Promise.all([
      asetService.getItems(authStore.activeUnitId),
      unitKantorService.getActiveItems(),
    ])
    // Hanya aset aktif yang bisa ditransfer
    asetList.value = asetRes.data.filter(a => a.status === 'Aktif')
    unitList.value = units
  } catch (err) {
    console.error('Failed to load lookup:', err)
  } finally {
    loadingLookup.value = false
  }
})

async function handleSubmit(data: TransferFormData & {
  unitAsalNama: string
  unitTujuanNama: string
}) {
  submitting.value = true
  try {
    await transaksiService.createTransfer(
      {
        asetId:       data.asetId,
        unitAsalId:   data.unitAsalId,
        unitTujuanId: data.unitTujuanId,
        tanggal:      data.tanggal,
        alasan:       data.alasan,
        keterangan:   data.keterangan,
      },
      {
        createdBy:      authStore.user?.id ?? 0,
        unitAsalNama:   data.unitAsalNama,
        unitTujuanNama: data.unitTujuanNama,
      }
    )
    await navigateTo('/transfer')
  } catch (err) {
    console.error('handleSubmit error:', err)
  } finally {
    submitting.value = false
  }
}
</script>