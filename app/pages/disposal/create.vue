<!-- pages/disposal/create.vue -->
<template>
  <main class="p-4 md:px-6">
    <DisposalForm
      :aset-list="asetList"
      :loading-data="loadingLookup"
      :submitting="submitting"
      @submit="handleSubmit"
    />
  </main>
</template>

<script setup lang="ts">
import { transaksiService, type DisposalFormData } from '@/services/transaksiService'
import { asetService, type Aset } from '@/services/asetService'
import { useAuthStore } from '@/stores/useAuthStore'
import DisposalForm from '@/components/features/disposal/DisposalForm.vue'

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

async function handleSubmit(data: DisposalFormData) {
  submitting.value = true
  try {
    await transaksiService.createDisposal(data, { createdBy: authStore.user?.id ?? 0 })
    await navigateTo('/disposal')
  } catch (err) { console.error(err) }
  finally { submitting.value = false }
}
</script>