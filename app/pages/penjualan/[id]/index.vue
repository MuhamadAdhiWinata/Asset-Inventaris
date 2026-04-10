<!-- pages/penjualan/[id]/index.vue -->
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
            <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400">Penjualan</span>
          </div>
          <h1 class="text-xl font-bold tracking-tight">{{ aset.barangNama }}</h1>
          <p class="text-muted-foreground text-sm mt-0.5">{{ aset.kodeAset }} · {{ formatTanggal(transaksi.tanggal) }}</p>
        </div>
        <button @click="navigateTo('/penjualan')"
          class="inline-flex items-center gap-2 h-9 px-4 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors self-start">
          <ArrowLeftIcon class="h-4 w-4" /> Kembali
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <div class="space-y-5">

          <!-- Detail -->
          <div class="border rounded-xl p-6 space-y-4">
            <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Detail Penjualan</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div class="space-y-0.5"><p class="text-xs text-muted-foreground">Pembeli</p><p class="text-sm font-medium">{{ detail.pembeli }}</p></div>
              <div class="space-y-0.5"><p class="text-xs text-muted-foreground">Tanggal</p><p class="text-sm font-medium">{{ formatTanggal(transaksi.tanggal) }}</p></div>
              <div class="space-y-0.5"><p class="text-xs text-muted-foreground">No. Dokumen</p><p class="text-sm">{{ detail.noDokumen || '—' }}</p></div>
              <div class="space-y-0.5 sm:col-span-3"><p class="text-xs text-muted-foreground">Keterangan</p><p class="text-sm">{{ transaksi.keterangan || '—' }}</p></div>
            </div>
          </div>

          <!-- Nilai -->
          <div class="border rounded-xl p-6 space-y-4">
            <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Nilai Transaksi</h2>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="border rounded-lg p-4 space-y-1">
                <p class="text-xs text-muted-foreground">Harga Perolehan</p>
                <p class="text-sm font-bold tabular-nums">{{ formatRupiah(aset.hargaPerolehan) }}</p>
              </div>
              <div class="border rounded-lg p-4 space-y-1">
                <p class="text-xs text-muted-foreground">Nilai Buku Saat Jual</p>
                <p class="text-sm font-bold tabular-nums text-muted-foreground">{{ formatRupiah(aset.hargaPerolehan) }}</p>
              </div>
              <div class="border rounded-lg p-4 space-y-1 bg-primary/5">
                <p class="text-xs text-muted-foreground">Harga Jual</p>
                <p class="text-sm font-bold tabular-nums text-primary">{{ formatRupiah(detail.hargaJual) }}</p>
              </div>
            </div>
            <!-- Laba/Rugi -->
            <div class="flex items-center justify-between p-3 rounded-lg"
              :class="labaRugi >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'">
              <span class="text-sm font-medium" :class="labaRugi >= 0 ? 'text-green-700 dark:text-green-400' : 'text-destructive'">
                {{ labaRugi >= 0 ? 'Laba Penjualan Aset' : 'Rugi Penjualan Aset' }}
              </span>
              <span class="text-base font-bold tabular-nums" :class="labaRugi >= 0 ? 'text-green-700 dark:text-green-400' : 'text-destructive'">
                {{ labaRugi >= 0 ? '+' : '' }}{{ formatRupiah(labaRugi) }}
              </span>
            </div>
          </div>

        </div>

        <!-- Sidebar -->
        <div class="space-y-4">
          <div class="border rounded-xl p-5 space-y-3">
            <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Info Aset</h3>
            <div class="space-y-2.5 text-xs">
              <div class="flex justify-between gap-2"><span class="text-muted-foreground">Kode</span><span class="font-mono font-medium">{{ aset.kodeAset }}</span></div>
              <div class="flex justify-between gap-2"><span class="text-muted-foreground">Barang</span><span class="font-medium">{{ aset.barangNama }}</span></div>
              <div class="flex justify-between gap-2"><span class="text-muted-foreground">Unit</span><span>{{ aset.unitNama }}</span></div>
              <div class="flex justify-between gap-2">
                <span class="text-muted-foreground">Status</span>
                <span class="inline-flex items-center rounded-full px-2 py-0.5 font-medium" :class="STATUS_ASET_CONFIG[aset.status].class">{{ aset.status }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </template>
  </main>
</template>

<script setup lang="ts">
import { ArrowLeftIcon, RefreshCwIcon } from 'lucide-vue-next'
import { transaksiService, type Transaksi, type TrxPenjualan } from '@/services/transaksiService'
import { asetService, type Aset, STATUS_ASET_CONFIG, formatRupiah, formatTanggal } from '@/services/asetService'

definePageMeta({ layout: 'default', middleware: ['permission'], requiredPermission: 'transaction.view' })

const route = useRoute()
const id    = computed(() => Number(route.params.id))

const transaksi = ref<Transaksi | null>(null)
const detail    = ref<TrxPenjualan | null>(null)
const aset      = ref<Aset | null>(null)
const loading   = ref(true)
const error     = ref<string | null>(null)

async function fetchAll() {
  loading.value = true; error.value = null
  try {
    const allTrx = await transaksiService.getTransaksiByUnit(null)
    const found  = allTrx.find(t => t.id === id.value && t.jenis === 'penjualan')
    if (!found || !found.asetId) { error.value = 'Transaksi tidak ditemukan.'; return }
    const [det, asetFound] = await Promise.all([
      transaksiService.getPenjualanDetail(found.id),
      asetService.getItemById(found.asetId),
    ])
    if (!det || !asetFound) { error.value = 'Data tidak lengkap.'; return }
    transaksi.value = found; detail.value = det; aset.value = asetFound
  } catch { error.value = 'Gagal memuat data.' }
  finally { loading.value = false }
}

onMounted(fetchAll)

const labaRugi = computed(() =>
  detail.value && aset.value ? detail.value.hargaJual - aset.value.hargaPerolehan : 0
)
</script>