<!-- pages/pembelian/index.vue -->
<template>
  <main class="p-4 md:px-6">

    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b pb-4 mb-4">
      <div>
        <h1 class="text-xl font-bold tracking-tight">Pembelian Aset</h1>
        <p class="text-muted-foreground text-sm mt-1">
          Riwayat transaksi pembelian dan aset yang dihasilkan.
        </p>
      </div>
      <button
        v-if="authStore.can('transaction.create')"
        @click="navigateTo('/pembelian/create')"
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4"
      >
        <PlusIcon class="mr-2 h-4 w-4" />
        Buat Pembelian
      </button>
    </div>

    <PembelianTable
      :items="paginatedItems"
      :loading="loading"
      :error="error"
      :current-page="currentPage"
      :total-items="filteredItems.length"
      :items-per-page="itemsPerPage"
      :show-unit-column="!authStore.isUnitScoped"
      @detail="(item) => navigateTo(`/pembelian/${item.transaksi.id}`)"
      @page-change="handlePageChange"
      @filter-change="handleFilterChange"
      @retry="fetchData"
    />

  </main>
</template>

<script setup lang="ts">
import { PlusIcon } from 'lucide-vue-next'
import { transaksiService } from '@/services/transaksiService'
import { unitKantorService } from '@/services/unitKantorService'
import { useAuthStore } from '@/stores/useAuthStore'
import PembelianTable, { type PembelianRow } from '@/components/features/pembelian/PembelianTable.vue'

definePageMeta({
  layout: 'default',
  middleware: ['permission'],
  requiredPermission: 'transaction.view',
})

const authStore = useAuthStore()

const allRows      = ref<PembelianRow[]>([])
const loading      = ref(true)
const error        = ref<string | null>(null)
const currentPage  = ref(1)
const itemsPerPage = 10

const activeFilters = ref({ search: '' })

const filteredItems = computed(() => {
  const q = activeFilters.value.search.toLowerCase()
  if (!q) return allRows.value
  return allRows.value.filter(row =>
    row.detail.supplierNama.toLowerCase().includes(q) ||
    row.detail.barangNama.toLowerCase().includes(q)
  )
})

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredItems.value.slice(start, start + itemsPerPage)
})

async function fetchData() {
  loading.value = true
  error.value   = null
  try {
    const trxList = await transaksiService.getTransaksiByUnit(authStore.activeUnitId)
    const pembelianList = trxList.filter(t => t.jenis === 'pembelian')

    const rows: PembelianRow[] = []
    for (const trx of pembelianList) {
      const detail = await transaksiService.getPembelianDetail(trx.id)
      if (!detail) continue
      const unitNama = await unitKantorService.getNamaById(trx.unitId)
      rows.push({ transaksi: trx, detail, unitNama })
    }
    allRows.value = rows
  } catch (err) {
    error.value = 'Gagal memuat data pembelian. Silakan coba lagi.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

function handleFilterChange(filters: typeof activeFilters.value) {
  activeFilters.value = filters
  currentPage.value   = 1
}

function handlePageChange(page: number) { currentPage.value = page }
</script>