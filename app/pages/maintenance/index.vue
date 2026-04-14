<!-- pages/maintenance/index.vue -->
<template>
  <main class="p-4 md:px-6">

    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b pb-4 mb-4">
      <div>
        <h1 class="text-xl font-bold tracking-tight">Maintenance Aset</h1>
        <p class="text-muted-foreground text-sm mt-1">Kelola perbaikan dan perawatan aset.</p>
      </div>
      <button v-if="authStore.can('transaction.create')" @click="navigateTo('/maintenance/create')"
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4">
        <PlusIcon class="mr-2 h-4 w-4" /> Buat Maintenance
      </button>
    </div>

    <!-- Badge ringkasan aset dalam perbaikan -->
    <div v-if="!loading && dalamPerbaikanCount > 0"
      class="flex items-center gap-3 p-3 mb-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/10">
      <WrenchIcon class="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
      <p class="text-xs text-yellow-700 dark:text-yellow-400">
        <span class="font-medium">{{ dalamPerbaikanCount }} aset</span> sedang dalam perbaikan.
        Klik ikon <span class="font-medium">✓</span> untuk menandai selesai.
      </p>
    </div>

    <MaintenanceTable
      :items="paginatedItems"
      :loading="loading"
      :error="error"
      :current-page="currentPage"
      :total-items="filteredItems.length"
      :items-per-page="itemsPerPage"
      @detail="(item) => navigateTo(`/maintenance/${item.transaksi.id}`)"
      @selesaikan="openSelesaikan"
      @page-change="handlePageChange"
      @filter-change="handleFilterChange"
      @retry="fetchData"
    />

    <!-- Dialog konfirmasi selesai -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="selesaikanDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50" @click="selesaikanDialog = false" />
          <div class="relative bg-background border rounded-xl shadow-xl w-full max-w-md p-6">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircleIcon class="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div class="flex-1">
                <h2 class="text-base font-semibold">Tandai Maintenance Selesai</h2>
                <p class="text-sm text-muted-foreground mt-1">
                  Aset <span class="font-medium">{{ itemToSelesaikan?.asetNama }}</span> akan dikembalikan ke status Aktif.
                </p>
                <div class="mt-3 space-y-1.5">
                  <label class="text-sm font-medium">Tanggal Selesai</label>
                  <input v-model="tanggalSelesai" type="date"
                    class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button type="button" :disabled="selesaikanLoading" @click="selesaikanDialog = false"
                class="inline-flex items-center justify-center h-10 px-4 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:pointer-events-none">
                Batal
              </button>
              <button type="button" :disabled="selesaikanLoading" @click="handleSelesaikan"
                class="inline-flex items-center gap-2 justify-center h-10 px-4 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:pointer-events-none">
                <Loader2Icon v-if="selesaikanLoading" class="h-4 w-4 animate-spin" />
                <CheckIcon v-else class="h-4 w-4" />
                Tandai Selesai
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </main>
</template>

<script setup lang="ts">
import { CheckCircleIcon, CheckIcon, Loader2Icon, PlusIcon, WrenchIcon } from 'lucide-vue-next'
import { transaksiService } from '@/services/transaksiService'
import { asetService } from '@/services/asetService'
import { useAuthStore } from '@/stores/useAuthStore'
import MaintenanceTable, { type MaintenanceRow } from '@/components/features/maintenance/MaintenanceTable.vue'

definePageMeta({ layout: 'default', middleware: ['permission'], requiredPermission: 'transaction.view' })

const authStore    = useAuthStore()
const allRows      = ref<MaintenanceRow[]>([])
const loading      = ref(true)
const error        = ref<string | null>(null)
const currentPage  = ref(1)
const itemsPerPage = 10
const activeFilters = ref({ search: '', status: 'Semua' })

// Dialog selesaikan
const selesaikanDialog  = ref(false)
const selesaikanLoading = ref(false)
const itemToSelesaikan  = ref<MaintenanceRow | null>(null)
const tanggalSelesai    = ref(new Date().toISOString().slice(0, 10))

const dalamPerbaikanCount = computed(() =>
  allRows.value.filter(r => r.detail.status === 'Dalam Perbaikan').length
)

const filteredItems = computed(() => {
  const q = activeFilters.value.search.toLowerCase()
  return allRows.value.filter(r => {
    const matchSearch = !q ||
      r.asetKode.toLowerCase().includes(q) ||
      r.asetNama.toLowerCase().includes(q) ||
      r.detail.vendor.toLowerCase().includes(q)
    const matchStatus = activeFilters.value.status === 'Semua' ||
      r.detail.status === activeFilters.value.status
    return matchSearch && matchStatus
  })
})

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredItems.value.slice(start, start + itemsPerPage)
})

async function fetchData() {
  loading.value = true; error.value = null
  try {
    const trxList   = await transaksiService.getTransaksiByUnit(authStore.activeUnitId)
    const maintList = trxList.filter(t => t.jenis === 'maintenance')
    const allAset   = await asetService.getItems(null)
    const rows: MaintenanceRow[] = []

    for (const trx of maintList) {
      if (!trx.asetId) continue
      const detail = await transaksiService.getMaintenanceDetail(trx.id)
      if (!detail) continue
      const aset = allAset.data.find(a => a.id === trx.asetId)
      rows.push({ transaksi: trx, detail, asetKode: aset?.kodeAset ?? '—', asetNama: aset?.barangNama ?? '—' })
    }
    allRows.value = rows
  } catch { error.value = 'Gagal memuat data maintenance.' }
  finally { loading.value = false }
}

onMounted(fetchData)

function handleFilterChange(f: typeof activeFilters.value) { activeFilters.value = f; currentPage.value = 1 }
function handlePageChange(p: number) { currentPage.value = p }

function openSelesaikan(item: MaintenanceRow) {
  itemToSelesaikan.value  = item
  tanggalSelesai.value    = new Date().toISOString().slice(0, 10)
  selesaikanDialog.value  = true
}

async function handleSelesaikan() {
  if (!itemToSelesaikan.value) return
  selesaikanLoading.value = true
  try {
    await transaksiService.selesaikanMaintenance(
      itemToSelesaikan.value.transaksi.id,
      tanggalSelesai.value
    )
    selesaikanDialog.value = false
    itemToSelesaikan.value = null
    await fetchData()
  } catch (err) { console.error(err) }
  finally { selesaikanLoading.value = false }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>