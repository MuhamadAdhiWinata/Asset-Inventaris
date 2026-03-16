<!-- pages/kategori/index.vue -->
<template>
  <main class="p-4 md:px-6">

    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b pb-4 mb-4">
      <div>
        <h1 class="text-xl font-bold tracking-tight">Kategori</h1>
        <p class="text-muted-foreground text-sm mt-1">Kelola kategori aset dan parameter depresiasi default.</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="navigateTo('/kategori/create')"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4"
        >
          <PlusIcon class="mr-2 h-4 w-4" />
          Tambah Kategori
        </button>
      </div>
    </div>

    <KategoriTable
      :items="paginatedItems"
      :loading="loading"
      :error="error"
      :current-page="currentPage"
      :total-items="filteredItems.length"
      :items-per-page="itemsPerPage"
      @edit="(item) => navigateTo(`/kategori/${item.id}/edit`)"
      @delete="openDelete"
      @page-change="handlePageChange"
      @filter-change="handleFilterChange"
      @retry="fetchData"
    />

    <ConfirmDialog
      :is-open="deleteDialogOpen"
      title="Hapus Kategori"
      :description="`Apakah Anda yakin ingin menghapus kategori &quot;${itemToDelete?.nama}&quot;? Tindakan ini tidak dapat dibatalkan.`"
      :loading="deleting"
      @confirm="handleConfirmDelete"
      @cancel="deleteDialogOpen = false"
    />

  </main>
</template>

<script setup lang="ts">
import { PlusIcon } from 'lucide-vue-next'
import { kategoriService, type Kategori } from '@/services/kategoriService'
import KategoriTable  from '@/components/features/kategori/KategoriTable.vue'
import ConfirmDialog  from '@/components/features/kategori/ConfirmDialog.vue'

definePageMeta({
  layout: 'default',
  middleware: ['permission'],
  requiredPermission: 'master.view',
})

const items        = ref<Kategori[]>([])
const loading      = ref(true)
const error        = ref<string | null>(null)
const currentPage  = ref(1)
const itemsPerPage = 10

const activeFilters = ref({ search: '', status: 'Semua' })

const deleteDialogOpen = ref(false)
const itemToDelete     = ref<Kategori | null>(null)
const deleting         = ref(false)

// ── Filter client-side ────────────────────────────────────────
const filteredItems = computed(() =>
  items.value.filter(item => {
    const q = activeFilters.value.search.toLowerCase()
    const matchSearch = !q ||
      item.kode.toLowerCase().includes(q) ||
      item.nama.toLowerCase().includes(q)
    const matchStatus = activeFilters.value.status === 'Semua' ||
      item.status === activeFilters.value.status
    return matchSearch && matchStatus
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
    const res = await kategoriService.getItems()
    if (res.success) items.value = res.data
  } catch (err) {
    error.value = 'Gagal memuat data kategori. Silakan coba lagi.'
    console.error('fetchData error:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

// ── Handlers ──────────────────────────────────────────────────
function handleFilterChange(filters: typeof activeFilters.value) {
  activeFilters.value = filters
  currentPage.value   = 1
}

function handlePageChange(page: number) {
  currentPage.value = page
}

function openDelete(item: Kategori) {
  itemToDelete.value     = item
  deleteDialogOpen.value = true
}

async function handleConfirmDelete() {
  if (!itemToDelete.value) return
  deleting.value = true
  try {
    await kategoriService.deleteItem(itemToDelete.value.id)
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