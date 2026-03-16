<!-- pages/master-asset/index.vue -->
<template>
  <main class="p-4 md:px-6">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b pb-4 mb-4">
      <div>
        <h1 class="text-xl font-bold tracking-tight">Master Aset</h1>
        <p class="text-muted-foreground text-sm mt-1">Kelola data aset inventaris perusahaan.</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4"
        >
          <DownloadIcon class="mr-2 h-4 w-4" />
          Export
        </button>
        <button
          @click="navigateTo('/master-asset/create')"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4"
        >
          <PlusIcon class="mr-2 h-4 w-4" />
          Tambah Aset
        </button>
      </div>
    </div>

    <!-- Table + Filters -->
    <MasterAssetTable
      :items="paginatedItems"
      :loading="loading"
      :error="error"
      :current-page="currentPage"
      :total-items="filteredItems.length"
      :items-per-page="itemsPerPage"
      :kategori-list="kategoriList"
      @edit="(item) => navigateTo(`/master-asset/${item.id}/edit`)"
      @delete="openDelete"
      @page-change="handlePageChange"
      @filter-change="handleFilterChange"
      @retry="fetchData"
    />

    <!-- Delete Confirmation -->
    <ConfirmDialog
      :is-open="deleteDialogOpen"
      title="Hapus Aset"
      :description="`Apakah Anda yakin ingin menghapus &quot;${itemToDelete?.namaAset}&quot;? Tindakan ini tidak dapat dibatalkan.`"
      :loading="deleting"
      @confirm="handleConfirmDelete"
      @cancel="deleteDialogOpen = false"
    />

  </main>
</template>

<script setup lang="ts">
import { DownloadIcon, PlusIcon } from 'lucide-vue-next'
import {
  masterAssetService,
  type MasterItem,
  type KategoriItem,
} from '@/services/masterAssetService'
import MasterAssetTable from '@/components/features/master-asset/MasterAssetTable.vue'
import ConfirmDialog    from '@/components/features/master-asset/ConfirmDialog.vue'

definePageMeta({ layout: 'default' })

// ── Table state ───────────────────────────────────────────────
const items        = ref<MasterItem[]>([])
const loading      = ref(true)
const error        = ref<string | null>(null)
const currentPage  = ref(1)
const itemsPerPage = 8

// ── Filter state ──────────────────────────────────────────────
const activeFilters = ref({
  search:   '',
  kategori: 'Semua',
  status:   'Semua',
})

// ── Lookup data ───────────────────────────────────────────────
const kategoriList = ref<KategoriItem[]>([])

// ── Delete dialog state ───────────────────────────────────────
const deleteDialogOpen = ref(false)
const itemToDelete     = ref<MasterItem | null>(null)
const deleting         = ref(false)

// ── Computed ──────────────────────────────────────────────────
const filteredItems = computed(() =>
  items.value.filter(item => {
    const q = activeFilters.value.search.toLowerCase()

    const matchSearch =
      !q ||
      item.kodeAset.toLowerCase().includes(q) ||
      item.namaAset.toLowerCase().includes(q) ||
      item.lokasi.toLowerCase().includes(q)

    const matchKategori =
      activeFilters.value.kategori === 'Semua' ||
      item.kategori === activeFilters.value.kategori

    const matchStatus =
      activeFilters.value.status === 'Semua' ||
      item.status === activeFilters.value.status

    return matchSearch && matchKategori && matchStatus
  })
)

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredItems.value.slice(start, start + itemsPerPage)
})

// ── Fetch ─────────────────────────────────────────────────────
async function fetchData() {
  loading.value = true
  error.value   = null
  try {
    const response = await masterAssetService.getItems()
    if (response.success) items.value = response.data
  } catch (err) {
    error.value = 'Gagal memuat data aset. Silakan coba lagi.'
    console.error('fetchData error:', err)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    kategoriList.value = await masterAssetService.getCategories()
  } catch (err) {
    console.error('Failed to load categories:', err)
  }
  await fetchData()
})

// ── Handlers ──────────────────────────────────────────────────
function handleFilterChange(filters: typeof activeFilters.value) {
  activeFilters.value = filters
  currentPage.value   = 1
}

function handlePageChange(page: number) {
  currentPage.value = page
}

function openDelete(item: MasterItem) {
  itemToDelete.value     = item
  deleteDialogOpen.value = true
}

async function handleConfirmDelete() {
  if (!itemToDelete.value) return
  deleting.value = true
  try {
    await masterAssetService.deleteItem(itemToDelete.value.id)
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