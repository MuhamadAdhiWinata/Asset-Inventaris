<!-- pages/maintenance/[id]/index.vue -->
<template>
  <main class="p-4 md:px-6">

    <div v-if="loading" class="space-y-4">
      <div class="h-8 w-48 rounded-lg bg-muted animate-pulse" />
      <div class="h-64 rounded-xl bg-muted animate-pulse" />
    </div>

    <div v-else-if="error" class="flex flex-col items-center justify-center py-20 gap-3 border rounded-xl">
      <p class="text-sm text-destructive">{{ error }}</p>
      <button @click="fetchAll" class="inline-flex items-center gap-2 h-9 px-4 rounded-md border border-input bg-background text-sm hover:bg-accent transition-colors">
        <RefreshCwIcon class="h-4 w-4" /> Coba Lagi
      </button>
    </div>

    <template v-else-if="transaksi && detail && aset">

      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b pb-4 mb-6">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="font-mono text-sm text-muted-foreground">TRX-{{ String(transaksi.id).padStart(4, '0') }}</span>
            <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Maintenance</span>
            <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
              :class="detail.jenis === 'preventif'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'">
              {{ detail.jenis === 'preventif' ? 'Preventif' : 'Korektif' }}
            </span>
          </div>
          <h1 class="text-xl font-bold tracking-tight">{{ aset.barangNama }}</h1>
          <p class="text-muted-foreground text-sm mt-0.5">{{ aset.kodeAset }} · {{ formatTanggal(transaksi.tanggal) }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button @click="navigateTo('/maintenance')"
            class="inline-flex items-center gap-2 h-9 px-4 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors">
            <ArrowLeftIcon class="h-4 w-4" /> Kembali
          </button>
          <button v-if="detail.status === 'Dalam Perbaikan'" @click="showSelesaikan = true"
            class="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors">
            <CheckCircleIcon class="h-4 w-4" /> Tandai Selesai
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <div class="space-y-5">

          <!-- Detail -->
          <div class="border rounded-xl p-6 space-y-4">
            <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Detail Maintenance</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div class="space-y-0.5"><p class="text-xs text-muted-foreground">Tanggal Masuk</p><p class="text-sm font-medium">{{ formatTanggal(transaksi.tanggal) }}</p></div>
              <div class="space-y-0.5"><p class="text-xs text-muted-foreground">Tanggal Selesai</p><p class="text-sm font-medium">{{ detail.tanggalSelesai ? formatTanggal(detail.tanggalSelesai) : '—' }}</p></div>
              <div class="space-y-0.5"><p class="text-xs text-muted-foreground">Vendor / Teknisi</p><p class="text-sm font-medium">{{ detail.vendor || '—' }}</p></div>
              <div class="space-y-0.5"><p class="text-xs text-muted-foreground">Estimasi Biaya</p><p class="text-sm font-medium tabular-nums">{{ detail.biaya > 0 ? formatRupiah(detail.biaya) : '—' }}</p></div>
              <div class="space-y-0.5">
                <p class="text-xs text-muted-foreground">Status</p>
                <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  :class="detail.status === 'Dalam Perbaikan' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'">
                  {{ detail.status }}
                </span>
              </div>
              <div class="sm:col-span-3 space-y-0.5"><p class="text-xs text-muted-foreground">Deskripsi</p><p class="text-sm">{{ detail.deskripsi }}</p></div>
              <div class="sm:col-span-3 space-y-0.5"><p class="text-xs text-muted-foreground">Keterangan</p><p class="text-sm">{{ transaksi.keterangan || '—' }}</p></div>
            </div>
          </div>

          <!-- Info Aset -->
          <div class="border rounded-xl p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Info Aset</h2>
              <button @click="navigateTo(`/aset/${aset.id}`)" class="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                <EyeIcon class="h-3.5 w-3.5" /> Lihat Detail
              </button>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div class="space-y-0.5"><p class="text-xs text-muted-foreground">Kode Aset</p><p class="text-sm font-mono font-medium">{{ aset.kodeAset }}</p></div>
              <div class="space-y-0.5"><p class="text-xs text-muted-foreground">Barang</p><p class="text-sm font-medium">{{ aset.barangNama }}</p></div>
              <div class="space-y-0.5"><p class="text-xs text-muted-foreground">Kategori</p><p class="text-sm">{{ aset.kategoriNama }}</p></div>
              <div class="space-y-0.5"><p class="text-xs text-muted-foreground">Nilai Buku</p><p class="text-sm font-medium tabular-nums">{{ formatRupiah(aset.nilaiBuku) }}</p></div>
              <div class="space-y-0.5"><p class="text-xs text-muted-foreground">Unit</p><p class="text-sm">{{ aset.unitNama }}</p></div>
            </div>
          </div>

        </div>

        <!-- Sidebar -->
        <div class="space-y-4">
          <div class="border rounded-xl p-5 space-y-3">
            <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Ringkasan</h3>
            <div class="space-y-2.5 text-xs">
              <div class="flex justify-between gap-2"><span class="text-muted-foreground">No. Transaksi</span><span class="font-mono font-medium">TRX-{{ String(transaksi.id).padStart(4, '0') }}</span></div>
              <div class="flex justify-between gap-2"><span class="text-muted-foreground">Jenis</span><span class="font-medium capitalize">{{ detail.jenis }}</span></div>
              <div class="flex justify-between gap-2"><span class="text-muted-foreground">Masuk</span><span>{{ formatTanggal(transaksi.tanggal) }}</span></div>
              <div class="flex justify-between gap-2"><span class="text-muted-foreground">Selesai</span><span>{{ detail.tanggalSelesai ? formatTanggal(detail.tanggalSelesai) : '—' }}</span></div>
              <div v-if="detail.biaya > 0" class="flex justify-between gap-2 border-t pt-2">
                <span class="text-muted-foreground">Biaya</span>
                <span class="font-medium tabular-nums">{{ formatRupiah(detail.biaya) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dialog Selesaikan -->
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="showSelesaikan" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/50" @click="showSelesaikan = false" />
            <div class="relative bg-background border rounded-xl shadow-xl w-full max-w-md p-6">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircleIcon class="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div class="flex-1">
                  <h2 class="text-base font-semibold">Tandai Selesai</h2>
                  <p class="text-sm text-muted-foreground mt-1">Aset akan dikembalikan ke status Aktif.</p>
                  <div class="mt-3 space-y-1.5">
                    <label class="text-sm font-medium">Tanggal Selesai</label>
                    <input v-model="tanggalSelesai" type="date"
                      class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  </div>
                </div>
              </div>
              <div class="flex justify-end gap-3 mt-6">
                <button type="button" :disabled="selesaikanLoading" @click="showSelesaikan = false"
                  class="inline-flex items-center justify-center h-10 px-4 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50">
                  Batal
                </button>
                <button type="button" :disabled="selesaikanLoading" @click="handleSelesaikan"
                  class="inline-flex items-center gap-2 justify-center h-10 px-4 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50">
                  <Loader2Icon v-if="selesaikanLoading" class="h-4 w-4 animate-spin" />
                  <CheckIcon v-else class="h-4 w-4" />
                  Tandai Selesai
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

    </template>
  </main>
</template>

<script setup lang="ts">
import { ArrowLeftIcon, CheckCircleIcon, CheckIcon, EyeIcon, Loader2Icon, RefreshCwIcon } from 'lucide-vue-next'
import { transaksiService, type Transaksi, type TrxMaintenance } from '@/services/transaksiService'
import { asetService, type Aset, formatRupiah, formatTanggal } from '@/services/asetService'

definePageMeta({ layout: 'default', middleware: ['permission'], requiredPermission: 'transaction.view' })

const route = useRoute()
const id    = computed(() => Number(route.params.id))

const transaksi        = ref<Transaksi | null>(null)
const detail           = ref<TrxMaintenance | null>(null)
const aset             = ref<Aset | null>(null)
const loading          = ref(true)
const error            = ref<string | null>(null)
const showSelesaikan   = ref(false)
const selesaikanLoading = ref(false)
const tanggalSelesai   = ref(new Date().toISOString().slice(0, 10))

async function fetchAll() {
  loading.value = true; error.value = null
  try {
    const allTrx = await transaksiService.getTransaksiByUnit(null)
    const found  = allTrx.find(t => t.id === id.value && t.jenis === 'maintenance')
    if (!found || !found.asetId) { error.value = 'Transaksi tidak ditemukan.'; return }
    const [det, asetFound] = await Promise.all([
      transaksiService.getMaintenanceDetail(found.id),
      asetService.getItemById(found.asetId),
    ])
    if (!det || !asetFound) { error.value = 'Data tidak lengkap.'; return }
    transaksi.value = found; detail.value = det; aset.value = asetFound
  } catch { error.value = 'Gagal memuat data.' }
  finally { loading.value = false }
}

onMounted(fetchAll)

async function handleSelesaikan() {
  if (!transaksi.value) return
  selesaikanLoading.value = true
  try {
    await transaksiService.selesaikanMaintenance(transaksi.value.id, tanggalSelesai.value)
    showSelesaikan.value = false
    await fetchAll()
  } catch (err) { console.error(err) }
  finally { selesaikanLoading.value = false }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>