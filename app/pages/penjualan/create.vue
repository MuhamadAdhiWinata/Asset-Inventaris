<!-- pages/penjualan/create.vue -->
<template>
  <main class="p-4 md:px-6">
    <PenjualanForm
      :aset-list="asetList"
      :loading-data="loadingLookup"
      :submitting="submitting"
      @submit="handleSubmit"
    />
  </main>
</template>

<script setup lang="ts">
import { transaksiService, type PenjualanFormData } from '@/services/transaksiService'
import { asetService, type Aset } from '@/services/asetService'
import { useAuthStore } from '@/stores/useAuthStore'
import PenjualanForm from '@/components/features/penjualan/PenjualanForm.vue'

definePageMeta({ layout: 'default', middleware: ['permission'], requiredPermission: 'transaction.create' })

const authStore     = useAuthStore()
const asetList      = ref<Aset[]>([])
const loadingLookup = ref(true)
const submitting    = ref(false)

onMounted(async () => {
  try {
    const res = await asetService.getItems(authStore.activeUnitId)
    asetList.value = res.data.filter(a => a.status === 'Aktif')
  } catch (err) { console.error(err) }
  finally { loadingLookup.value = false }
})

async function handleSubmit(data: PenjualanFormData) {
  submitting.value = true
  try {
    await transaksiService.createPenjualan(data, { createdBy: authStore.user?.id ?? 0 })
    await navigateTo('/penjualan')
  } catch (err) { console.error(err) }
  finally { submitting.value = false }
}
</script>