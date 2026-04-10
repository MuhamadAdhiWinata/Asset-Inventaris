<!-- pages/penjualan/index.vue -->
<template>
  <main class="p-4 md:px-6">
    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b pb-4 mb-4">
      <div>
        <h1 class="text-xl font-bold tracking-tight">Penjualan Aset</h1>
        <p class="text-muted-foreground text-sm mt-1">Riwayat penjualan aset ke pihak luar.</p>
      </div>
      <button v-if="authStore.can('transaction.create')" @click="navigateTo('/penjualan/create')"
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4">
        <PlusIcon class="mr-2 h-4 w-4" /> Buat Penjualan
      </button>
    </div>

    <PenjualanTable
      :items="paginatedItems"
      :loading="loading"
      :error="error"
      :current-page="currentPage"
      :total-items="filteredItems.length"
      :items-per-page="itemsPerPage"
      @detail="(item) => navigateTo(`/penjualan/${item.transaksi.id}`)"
      @page-change="handlePageChange"
      @filter-change="handleFilterChange"
      @retry="fetchData"
    />
  </main>
</template>

<script setup lang="ts">
import { PlusIcon } from 'lucide-vue-next'
import { transaksiService } from '@/services/transaksiService'
import { asetService } from '@/services/asetService'
import { useAuthStore } from '@/stores/useAuthStore'
import PenjualanTable, { type PenjualanRow } from '@/components/features/penjualan/PenjualanTable.vue'

definePageMeta({ layout: 'default', middleware: ['permission'], requiredPermission: 'transaction.view' })

const authStore    = useAuthStore()
const allRows      = ref<PenjualanRow[]>([])
const loading      = ref(true)
const error        = ref<string | null>(null)
const currentPage  = ref(1)
const itemsPerPage = 10
const activeFilters = ref({ search: '' })

const filteredItems = computed(() => {
  const q = activeFilters.value.search.toLowerCase()
  if (!q) return allRows.value
  return allRows.value.filter(r =>
    r.asetKode.toLowerCase().includes(q) ||
    r.asetNama.toLowerCase().includes(q) ||
    r.detail.pembeli.toLowerCase().includes(q)
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
    const trxList   = await transaksiService.getTransaksiByUnit(authStore.activeUnitId)
    const pjList    = trxList.filter(t => t.jenis === 'penjualan')
    const allAset   = await asetService.getItems(null)
    const rows: PenjualanRow[] = []

    for (const trx of pjList) {
      if (!trx.asetId) continue
      const detail = await transaksiService.getPenjualanDetail(trx.id)
      if (!detail) continue
      const aset = allAset.data.find(a => a.id === trx.asetId)
      rows.push({
        transaksi: trx, detail,
        asetKode: aset?.kodeAset ?? '—',
        asetNama: aset?.barangNama ?? '—',
        nilaiBukuSaatJual: aset?.hargaPerolehan ?? 0,
      })
    }
    allRows.value = rows
  } catch (err) {
    error.value = 'Gagal memuat data penjualan.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
function handleFilterChange(f: typeof activeFilters.value) { activeFilters.value = f; currentPage.value = 1 }
function handlePageChange(p: number) { currentPage.value = p }
</script>