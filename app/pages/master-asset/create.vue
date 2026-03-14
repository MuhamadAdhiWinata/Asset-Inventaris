<!-- pages/master-asset/create.vue -->
<template>
  <main class="p-4 md:px-6">
    <MasterAssetForm
      :initial-data="null"
      :kategori-list="kategoriList"
      :sub-kategori-list="subKategoriList"
      :satuan-list="satuanList"
      :loading-data="loadingLookup"
      :submitting="submitting"
      @submit="handleSubmit"
    />
  </main>
</template>

<script setup lang="ts">
import {
  masterAssetService,
  type MasterItemFormData,
  type KategoriItem,
  type SubKategoriItem,
  type SatuanItem,
} from '@/services/masterAssetService'
import MasterAssetForm from '@/components/features/master-asset/MasterAssetForm.vue'

definePageMeta({ layout: 'default' })

const kategoriList    = ref<KategoriItem[]>([])
const subKategoriList = ref<SubKategoriItem[]>([])
const satuanList      = ref<SatuanItem[]>([])
const loadingLookup   = ref(true)
const submitting      = ref(false)

onMounted(async () => {
  loadingLookup.value = true
  try {
    const [cats, subCats, units] = await Promise.all([
      masterAssetService.getCategories(),
      masterAssetService.getSubCategories(),
      masterAssetService.getUnits(),
    ])
    kategoriList.value    = cats
    subKategoriList.value = subCats
    satuanList.value      = units
  } catch (err) {
    console.error('Failed to load lookup data:', err)
  } finally {
    loadingLookup.value = false
  }
})

async function handleSubmit(data: MasterItemFormData) {
  submitting.value = true
  try {
    await masterAssetService.createItem(data)
    await navigateTo('/master-asset')
  } catch (err) {
    console.error('handleSubmit error:', err)
  } finally {
    submitting.value = false
  }
}
</script>