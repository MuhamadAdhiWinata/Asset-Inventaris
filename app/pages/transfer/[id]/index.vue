<!-- pages/transfer/[id]/index.vue -->
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

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b pb-4 mb-6">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="font-mono text-sm text-muted-foreground">TRX-{{ String(transaksi.id).padStart(4, '0') }}</span>
            <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              Transfer
            </span>
          </div>
          <h1 class="text-xl font-bold tracking-tight">{{ aset.barangNama }}</h1>
          <p class="text-muted-foreground text-sm mt-0.5">{{ aset.kodeAset }} · {{ formatTanggal(transaksi.tanggal) }}</p>
        </div>
        <button @click="navigateTo('/transfer')"
          class="inline-flex items-center gap-2 h-9 px-4 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors self-start">
          <ArrowLeftIcon class="h-4 w-4" /> Kembali
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">

        <!-- Kolom Kiri -->
        <div class="space-y-5">

          <!-- Detail Transfer -->
          <div class="border rounded-xl p-6 space-y-5">
            <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Detail Transfer</h2>

            <!-- Arrow diagram -->
            <div class="flex items-center gap-3">
              <div class="flex-1 border rounded-lg p-4 text-center">
                <p class="text-xs text-muted-foreground mb-1">Unit Asal</p>
                <p class="font-medium">{{ detail.unitAsalNama }}</p>
              </div>
              <div class="flex flex-col items-center gap-1 flex-shrink-0">
                <ArrowRightIcon class="h-5 w-5 text-primary" />
              </div>
              <div class="flex-1 border border-primary/30 bg-primary/5 rounded-lg p-4 text-center">
                <p class="text-xs text-muted-foreground mb-1">Unit Tujuan</p>
                <p class="font-medium text-primary">{{ detail.unitTujuanNama }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div class="space-y-0.5">
                <p class="text-xs text-muted-foreground">Tanggal Transfer</p>
                <p class="text-sm font-medium">{{ formatTanggal(transaksi.tanggal) }}</p>
              </div>
              <div class="space-y-0.5 sm:col-span-2">
                <p class="text-xs text-muted-foreground">Alasan</p>
                <p class="text-sm">{{ detail.alasan || '—' }}</p>
              </div>
              <div class="space-y-0.5 sm:col-span-3">
                <p class="text-xs text-muted-foreground">Keterangan</p>
                <p class="text-sm">{{ transaksi.keterangan || '—' }}</p>
              </div>
            </div>
          </div>

          <!-- Info Aset -->
          <div class="border rounded-xl p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Info Aset</h2>
              <button @click="navigateTo(`/aset/${aset.id}`)"
                class="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                <EyeIcon class="h-3.5 w-3.5" /> Lihat Detail Aset
              </button>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div class="space-y-0.5">
                <p class="text-xs text-muted-foreground">Kode Aset</p>
                <p class="text-sm font-mono font-medium">{{ aset.kodeAset }}</p>
              </div>
              <div class="space-y-0.5">
                <p class="text-xs text-muted-foreground">Barang</p>
                <p class="text-sm font-medium">{{ aset.barangNama }}</p>
              </div>
              <div class="space-y-0.5">
                <p class="text-xs text-muted-foreground">Kategori</p>
                <p class="text-sm">{{ aset.kategoriNama }}</p>
              </div>
              <div class="space-y-0.5">
                <p class="text-xs text-muted-foreground">Nilai Buku</p>
                <p class="text-sm font-medium tabular-nums">{{ formatRupiah(aset.nilaiBuku) }}</p>
              </div>
              <div class="space-y-0.5">
                <p class="text-xs text-muted-foreground">Status Sekarang</p>
                <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" :class="STATUS_ASET_CONFIG[aset.status].class">
                  {{ aset.status }}
                </span>
              </div>
              <div class="space-y-0.5">
                <p class="text-xs text-muted-foreground">Unit Sekarang</p>
                <p class="text-sm font-medium">{{ aset.unitNama }}</p>
              </div>
            </div>
          </div>

        </div>

        <!-- Kolom Kanan -->
        <div class="space-y-4">
          <div class="border rounded-xl p-5 space-y-3">
            <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Ringkasan</h3>
            <div class="space-y-2.5 text-xs">
              <div class="flex justify-between gap-2">
                <span class="text-muted-foreground">No. Transaksi</span>
                <span class="font-mono font-medium">TRX-{{ String(transaksi.id).padStart(4, '0') }}</span>
              </div>
              <div class="flex justify-between gap-2">
                <span class="text-muted-foreground">Tanggal</span>
                <span>{{ formatTanggal(transaksi.tanggal) }}</span>
              </div>
              <div class="flex justify-between gap-2">
                <span class="text-muted-foreground">Dari</span>
                <span class="font-medium text-right max-w-[120px] truncate">{{ detail.unitAsalNama }}</span>
              </div>
              <div class="flex justify-between gap-2">
                <span class="text-muted-foreground">Ke</span>
                <span class="font-medium text-primary text-right max-w-[120px] truncate">{{ detail.unitTujuanNama }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </template>

  </main>
</template>

<script setup lang="ts">
import { ArrowLeftIcon, ArrowRightIcon, EyeIcon, RefreshCwIcon } from 'lucide-vue-next'
import { transaksiService, type Transaksi, type TrxTransfer } from '@/services/transaksiService'
import { asetService, type Aset, STATUS_ASET_CONFIG, formatRupiah, formatTanggal } from '@/services/asetService'

definePageMeta({
  layout: 'default',
  middleware: ['permission'],
  requiredPermission: 'transaction.view',
})

const route = useRoute()
const id    = computed(() => Number(route.params.id))

const transaksi = ref<Transaksi | null>(null)
const detail    = ref<TrxTransfer | null>(null)
const aset      = ref<Aset | null>(null)
const loading   = ref(true)
const error     = ref<string | null>(null)

async function fetchAll() {
  loading.value = true
  error.value   = null
  try {
    const allTrx = await transaksiService.getTransaksiByUnit(null)
    const found  = allTrx.find(t => t.id === id.value && t.jenis === 'transfer')

    if (!found || !found.asetId) {
      error.value = `Transaksi transfer #${id.value} tidak ditemukan.`
      return
    }

    const [det, asetFound] = await Promise.all([
      transaksiService.getTransferDetail(found.id),
      asetService.getItemById(found.asetId),
    ])

    if (!det || !asetFound) {
      error.value = 'Data tidak lengkap.'
      return
    }

    transaksi.value = found
    detail.value    = det
    aset.value      = asetFound
  } catch (err) {
    error.value = 'Gagal memuat data.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchAll)
</script>