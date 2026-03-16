<!-- pages/aset/index.vue -->
<template>
  <main class="p-4 md:px-6">

    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b pb-4 mb-4">
      <div>
        <h1 class="text-xl font-bold tracking-tight">Daftar Aset</h1>
        <p class="text-muted-foreground text-sm mt-1">
          <template v-if="authStore.isUnitScoped">
            Aset milik {{ authStore.user?.unitName }}.
          </template>
          <template v-else>
            Semua aset dari seluruh unit kantor.
          </template>
        </p>
      </div>
      <button
        v-if="authStore.can('asset.create')"
        @click="navigateTo('/aset/create')"
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4"
      >
        <PlusIcon class="mr-2 h-4 w-4" />
        Input Initial Balance
      </button>
    </div>

    <!-- Info untuk admin pusat -->
    <div
      v-if="!authStore.isUnitScoped"
      class="flex items-center gap-3 p-3 mb-4 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/10"
    >
      <InfoIcon class="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
      <p class="text-xs text-blue-700 dark:text-blue-400">
        Anda melihat aset dari <span class="font-medium">semua unit kantor</span>. Kolom "Unit" ditampilkan untuk membedakan kepemilikan.
      </p>
    </div>

    <AsetTable
      :items="paginatedItems"
      :loading="loading"
      :error="error"
      :current-page="currentPage"
      :total-items="filteredItems.length"
      :items-per-page="itemsPerPage"
      :kategori-list="kategoriList"
      :show-unit-column="!authStore.isUnitScoped"
      @detail="(item) => navigateTo(`/aset/${item.id}`)"
      @edit="(item) => navigateTo(`/aset/${item.id}/edit`)"
      @delete="openDelete"
      @page-change="handlePageChange"
      @filter-change="handleFilterChange"
      @retry="fetchData"
    />

    <ConfirmDialog
      :is-open="deleteDialogOpen"
      title="Hapus Aset"
      :description="`Apakah Anda yakin ingin menghapus aset &quot;${itemToDelete?.kodeAset}&quot;? Hanya aset initial balance yang dapat dihapus.`"
      :loading="deleting"
      @confirm="handleConfirmDelete"
      @cancel="deleteDialogOpen = false"
    />

  </main>
</template>

<script setup lang="ts">
import { InfoIcon, PlusIcon } from 'lucide-vue-next'
import { asetService, type Aset } from '@/services/asetService'
import { kategoriService, type Kategori } from '@/services/kategoriService'
import { useAuthStore } from '@/stores/useAuthStore'
import AsetTable     from '@/components/features/aset/AsetTable.vue'
import ConfirmDialog from '@/components/features/aset/ConfirmDialog.vue'

definePageMeta({
  layout: 'default',
  middleware: ['permission'],
  requiredPermission: 'asset.view',
})

const authStore = useAuthStore()

const items        = ref<Aset[]>([])
const kategoriList = ref<Kategori[]>([])
const loading      = ref(true)
const error        = ref<string | null>(null)
const currentPage  = ref(1)
const itemsPerPage = 10

const activeFilters = ref({ search: '', kategori: 'Semua', status: 'Semua' })

const deleteDialogOpen = ref(false)
const itemToDelete     = ref<Aset | null>(null)
const deleting         = ref(false)

// Filter client-side
const filteredItems = computed(() =>
  items.value.filter(item => {
    const q = activeFilters.value.search.toLowerCase()
    const matchSearch   = !q ||
      item.kodeAset.toLowerCase().includes(q) ||
      item.barangNama.toLowerCase().includes(q)
    const matchKategori = activeFilters.value.kategori === 'Semua' ||
      item.kategoriNama === activeFilters.value.kategori
    const matchStatus   = activeFilters.value.status === 'Semua' ||
      item.status === activeFilters.value.status
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
    // Kirim activeUnitId — null = admin pusat (semua unit)
    const res = await asetService.getItems(authStore.activeUnitId)
    if (res.success) items.value = res.data
  } catch (err) {
    error.value = 'Gagal memuat data aset. Silakan coba lagi.'
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

function openDelete(item: Aset) {
  // Hanya initial balance yang bisa dihapus manual
  if (item.transaksiId !== null) return
  itemToDelete.value     = item
  deleteDialogOpen.value = true
}

async function handleConfirmDelete() {
  if (!itemToDelete.value) return
  deleting.value = true
  try {
    await asetService.deleteItem(itemToDelete.value.id)
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