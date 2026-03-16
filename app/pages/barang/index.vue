<!-- pages/barang/index.vue -->
<template>
  <main class="p-4 md:px-6">

    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b pb-4 mb-4">
      <div>
        <h1 class="text-xl font-bold tracking-tight">Barang</h1>
        <p class="text-muted-foreground text-sm mt-1">Kelola katalog jenis barang aset.</p>
      </div>
      <button
        @click="navigateTo('/barang/create')"
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4"
      >
        <PlusIcon class="mr-2 h-4 w-4" />
        Tambah Barang
      </button>
    </div>

    <BarangTable
      :items="paginatedItems"
      :loading="loading"
      :error="error"
      :current-page="currentPage"
      :total-items="filteredItems.length"
      :items-per-page="itemsPerPage"
      :kategori-list="kategoriList"
      @edit="(item) => navigateTo(`/barang/${item.id}/edit`)"
      @delete="openDelete"
      @page-change="handlePageChange"
      @filter-change="handleFilterChange"
      @retry="fetchData"
    />

    <ConfirmDialog
      :is-open="deleteDialogOpen"
      title="Hapus Barang"
      :description="`Apakah Anda yakin ingin menghapus barang &quot;${itemToDelete?.nama}&quot;? Tindakan ini tidak dapat dibatalkan.`"
      :loading="deleting"
      @confirm="handleConfirmDelete"
      @cancel="deleteDialogOpen = false"
    />

  </main>
</template>

<script setup lang="ts">
import { PlusIcon } from 'lucide-vue-next'
import { barangService, type Barang } from '@/services/barangService'
import { kategoriService, type Kategori } from '@/services/kategoriService'
import BarangTable   from '@/components/features/barang/BarangTable.vue'
import ConfirmDialog from '@/components/features/barang/ConfirmDialog.vue'

definePageMeta({
  layout: 'default',
  middleware: ['permission'],
  requiredPermission: 'master.view',
})

const items        = ref<Barang[]>([])
const kategoriList = ref<Kategori[]>([])
const loading      = ref(true)
const error        = ref<string | null>(null)
const currentPage  = ref(1)
const itemsPerPage = 10

const activeFilters = ref({ search: '', kategori: 'Semua', status: 'Semua' })

const deleteDialogOpen = ref(false)
const itemToDelete     = ref<Barang | null>(null)
const deleting         = ref(false)

const filteredItems = computed(() =>
  items.value.filter(item => {
    const q = activeFilters.value.search.toLowerCase()
    const matchSearch  = !q || item.kode.toLowerCase().includes(q) || item.nama.toLowerCase().includes(q)
    const matchKategori = activeFilters.value.kategori === 'Semua' || item.kategoriNama === activeFilters.value.kategori
    const matchStatus  = activeFilters.value.status === 'Semua' || item.status === activeFilters.value.status
    return matchSearch && matchKategori && matchStatus
  })
)

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredItems.value.slice(start, start + itemsPerPage)
})

async function fetchData() {
  loading.value = true
  error.value   = null
  try {
    const res = await barangService.getItems()
    if (res.success) items.value = res.data
  } catch (err) {
    error.value = 'Gagal memuat data barang. Silakan coba lagi.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    kategoriList.value = await kategoriService.getActiveItems()
  } catch (err) {
    console.error('Failed to load kategori:', err)
  }
  await fetchData()
})

function handleFilterChange(filters: typeof activeFilters.value) {
  activeFilters.value = filters
  currentPage.value   = 1
}

function handlePageChange(page: number) { currentPage.value = page }

function openDelete(item: Barang) {
  itemToDelete.value     = item
  deleteDialogOpen.value = true
}

async function handleConfirmDelete() {
  if (!itemToDelete.value) return
  deleting.value = true
  try {
    await barangService.deleteItem(itemToDelete.value.id)
    deleteDialogOpen.value = false
    itemToDelete.value     = null
    await fetchData()
  } catch (err) {
    console.error('handleConfirmDelete error:', err)
  } finally {
    deleting.value = false
  }
}
</script>