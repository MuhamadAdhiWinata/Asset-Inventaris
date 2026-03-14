<!-- pages/master-asset/[id]/edit.vue -->
<template>
  <main class="p-4 md:px-6">
    <MasterAssetForm
      :initial-data="item"
      :kategori-list="kategoriList"
      :sub-kategori-list="subKategoriList"
      :satuan-list="satuanList"
      :loading-data="loadingData"
      :fetch-error="fetchError"
      :submitting="submitting"
      @submit="handleSubmit"
      @retry="fetchAll"
    />
  </main>
</template>

<script setup lang="ts">
import {
  masterAssetService,
  type MasterItem,
  type MasterItemFormData,
  type KategoriItem,
  type SubKategoriItem,
  type SatuanItem,
} from '@/services/masterAssetService'
import MasterAssetForm from '@/components/features/master-asset/MasterAssetForm.vue'

definePageMeta({ layout: 'default' })

const route = useRoute()
const id    = computed(() => Number(route.params.id))

const item            = ref<MasterItem | null>(null)
const kategoriList    = ref<KategoriItem[]>([])
const subKategoriList = ref<SubKategoriItem[]>([])
const satuanList      = ref<SatuanItem[]>([])
const loadingData     = ref(true)
const fetchError      = ref<string | null>(null)
const submitting      = ref(false)

async function fetchAll() {
  loadingData.value = true
  fetchError.value  = null
  try {
    const [found, cats, subCats, units] = await Promise.all([
      masterAssetService.getItemById(id.value),
      masterAssetService.getCategories(),
      masterAssetService.getSubCategories(),
      masterAssetService.getUnits(),
    ])

    if (!found) {
      fetchError.value = `Aset dengan ID ${id.value} tidak ditemukan.`
      return
    }

    item.value            = found
    kategoriList.value    = cats
    subKategoriList.value = subCats
    satuanList.value      = units
  } catch (err) {
    fetchError.value = 'Gagal memuat data aset. Silakan coba lagi.'
    console.error('fetchAll error:', err)
  } finally {
    loadingData.value = false
  }
}

onMounted(fetchAll)

async function handleSubmit(data: MasterItemFormData) {
  submitting.value = true
  try {
    await masterAssetService.updateItem(id.value, data)
    await navigateTo('/master-asset')
  } catch (err) {
    console.error('handleSubmit error:', err)
  } finally {
    submitting.value = false
  }
}
</script>