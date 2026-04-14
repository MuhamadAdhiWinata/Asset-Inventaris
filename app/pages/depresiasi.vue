<!-- pages/depresiasi/index.vue -->
<template>
  <main class="p-4 md:px-6">

    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b pb-4 mb-6">
      <div>
        <h1 class="text-xl font-bold tracking-tight">Depresiasi Aset</h1>
        <p class="text-muted-foreground text-sm mt-1">Proses depresiasi bulanan untuk semua aset aktif.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

      <!-- Kolom Kiri: Form Proses -->
      <div class="space-y-5">

        <!-- Form Periode -->
        <div class="border rounded-xl p-6 space-y-5">
          <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Proses Depresiasi Bulanan</h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <!-- Unit — hanya admin pusat yang pilih, admin unit auto isi -->
            <div v-if="!authStore.isUnitScoped" class="sm:col-span-2 space-y-1.5">
              <label class="text-sm font-medium">Unit Kantor</label>
              <select v-model="form.unitId"
                class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option :value="null">Semua Unit</option>
                <option v-for="u in unitList" :key="u.id" :value="u.id">{{ u.nama }}</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="text-sm font-medium">Periode (Bulan/Tahun) <span class="text-destructive">*</span></label>
              <input v-model="form.periode" type="month" required
                class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>

            <div class="space-y-1.5">
              <label class="text-sm font-medium">Keterangan</label>
              <input v-model="form.keterangan" type="text" :placeholder="`Depresiasi ${form.periode}`"
                class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>

          </div>

          <button type="button" :disabled="processing || !form.periode" @click="showConfirm = true"
            class="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none">
            <TrendingDownIcon class="h-4 w-4" />
            Proses Depresiasi
          </button>
        </div>

        <!-- Riwayat -->
        <div class="border rounded-xl p-6 space-y-4">
          <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Riwayat Proses</h2>

          <div v-if="loadingHistory" class="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2Icon class="h-4 w-4 animate-spin" /> Memuat riwayat...
          </div>

          <div v-else-if="riwayat.length === 0" class="flex flex-col items-center py-8 gap-2 text-muted-foreground">
            <TrendingDownIcon class="h-6 w-6 opacity-40" />
            <p class="text-sm">Belum ada riwayat depresiasi</p>
          </div>

          <div v-else class="rounded-lg border overflow-hidden">
            <table class="w-full text-sm">
              <thead class="border-b bg-muted/40">
                <tr>
                  <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Periode</th>
                  <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">Aset</th>
                  <th class="h-10 px-4 text-right align-middle font-medium text-muted-foreground whitespace-nowrap">Nilai Depresiasi</th>
                  <th class="h-10 px-4 text-right align-middle font-medium text-muted-foreground whitespace-nowrap hidden lg:table-cell">Nilai Buku Sesudah</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in riwayat" :key="row.transaksi.id"
                  class="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td class="px-4 py-2.5 align-middle">
                    <p class="font-medium text-xs">{{ row.detail.periode }}</p>
                    <p class="text-xs text-muted-foreground">{{ formatTanggal(row.transaksi.tanggal) }}</p>
                  </td>
                  <td class="px-4 py-2.5 align-middle hidden md:table-cell">
                    <p class="text-xs font-medium">{{ row.asetNama }}</p>
                    <p class="text-xs font-mono text-muted-foreground">{{ row.asetKode }}</p>
                  </td>
                  <td class="px-4 py-2.5 align-middle text-right tabular-nums text-xs font-medium text-muted-foreground">
                    {{ formatRupiah(row.detail.nilaiPeriode) }}
                  </td>
                  <td class="px-4 py-2.5 align-middle text-right tabular-nums text-xs hidden lg:table-cell">
                    {{ formatRupiah(row.detail.nilaiBukuSesudah) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- Kolom Kanan: Info -->
      <div class="space-y-4">

        <div class="border rounded-xl p-5 space-y-4">
          <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Periode Ini</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between gap-2">
              <span class="text-muted-foreground">Periode</span>
              <span class="font-medium">{{ form.periode || '—' }}</span>
            </div>
            <div class="flex justify-between gap-2">
              <span class="text-muted-foreground">Unit</span>
              <span class="font-medium">{{ unitLabel }}</span>
            </div>
          </div>
        </div>

        <div class="border rounded-xl p-5 space-y-3">
          <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <InfoIcon class="h-3.5 w-3.5" /> Cara Kerja
          </h3>
          <div class="space-y-2 text-xs text-muted-foreground">
            <div class="flex items-start gap-2">
              <div class="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span>Sistem menghitung depresiasi untuk semua aset berstatus Aktif</span>
            </div>
            <div class="flex items-start gap-2">
              <div class="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span>Garis lurus: nilai tetap setiap bulan (harga / masa manfaat / 12)</span>
            </div>
            <div class="flex items-start gap-2">
              <div class="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span>Saldo menurun: nilai menurun setiap bulan (2 / masa manfaat × nilai buku / 12)</span>
            </div>
            <div class="flex items-start gap-2">
              <div class="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span>Nilai buku tidak akan minus — depresiasi berhenti di nol</span>
            </div>
            <div class="flex items-start gap-2">
              <div class="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 flex-shrink-0" />
              <span>Periode yang sudah diproses tidak bisa diproses ulang</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Dialog Konfirmasi -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50" @click="showConfirm = false" />
          <div class="relative bg-background border rounded-xl shadow-xl w-full max-w-md p-6">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                <TrendingDownIcon class="h-5 w-5 text-primary" />
              </div>
              <div class="flex-1">
                <h2 class="text-base font-semibold">Konfirmasi Proses Depresiasi</h2>
                <p class="text-sm text-muted-foreground mt-1">
                  Proses depresiasi untuk periode <span class="font-medium">{{ form.periode }}</span>
                  pada <span class="font-medium">{{ unitLabel }}</span>.
                </p>
                <div class="mt-3 p-3 rounded-lg bg-muted text-xs text-muted-foreground space-y-1">
                  <p>• Akumulasi depresiasi semua aset aktif akan diupdate</p>
                  <p>• Transaksi depresiasi akan dicatat per aset</p>
                  <p>• Proses ini tidak bisa dibatalkan</p>
                </div>
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button type="button" :disabled="processing" @click="showConfirm = false"
                class="inline-flex items-center justify-center h-10 px-4 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50">
                Batal
              </button>
              <button type="button" :disabled="processing" @click="handleProses"
                class="inline-flex items-center gap-2 justify-center h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                <Loader2Icon v-if="processing" class="h-4 w-4 animate-spin" />
                <TrendingDownIcon v-else class="h-4 w-4" />
                Ya, Proses Sekarang
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Dialog Hasil -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="hasilDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50" @click="hasilDialog = false" />
          <div class="relative bg-background border rounded-xl shadow-xl w-full max-w-md p-6">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircleIcon class="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div class="flex-1">
                <h2 class="text-base font-semibold">Depresiasi Berhasil Diproses</h2>
                <p class="text-sm text-muted-foreground mt-1">Periode {{ hasilPeriode }}</p>
                <div class="mt-4 grid grid-cols-2 gap-3">
                  <div class="border rounded-lg p-3 text-center">
                    <p class="text-2xl font-bold">{{ hasilResult?.processed ?? 0 }}</p>
                    <p class="text-xs text-muted-foreground mt-1">Aset diproses</p>
                  </div>
                  <div class="border rounded-lg p-3 text-center">
                    <p class="text-lg font-bold tabular-nums text-primary">{{ formatRupiah(hasilResult?.totalDepresiasi ?? 0) }}</p>
                    <p class="text-xs text-muted-foreground mt-1">Total depresiasi</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex justify-end mt-6">
              <button type="button" @click="hasilDialog = false"
                class="inline-flex items-center justify-center h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </main>
</template>

<script setup lang="ts">
import { CheckCircleIcon, InfoIcon, Loader2Icon, TrendingDownIcon } from 'lucide-vue-next'
import { transaksiService, type DepresiasiFormData } from '@/services/transaksiService'
import { asetService, formatRupiah, formatTanggal } from '@/services/asetService'
import { unitKantorService, type UnitKantor } from '@/services/unitKantorService'
import { useAuthStore } from '@/stores/useAuthStore'

definePageMeta({ layout: 'default', middleware: ['permission'], requiredPermission: 'transaction.create' })

const authStore = useAuthStore()

interface RiwayatRow {
  transaksi: { id: number; tanggal: string; unitId: number; keterangan: string }
  detail: { periode: string; nilaiPeriode: number; akmSebelum: number; akmSesudah: number; nilaiBukuSesudah: number }
  asetKode: string
  asetNama: string
}

const unitList      = ref<UnitKantor[]>([])
const riwayat       = ref<RiwayatRow[]>([])
const loadingHistory = ref(true)
const processing    = ref(false)
const showConfirm   = ref(false)
const hasilDialog   = ref(false)
const hasilResult   = ref<{ processed: number; totalDepresiasi: number } | null>(null)
const hasilPeriode  = ref('')

// Default periode = bulan ini
const today = new Date()
const form  = ref<{ unitId: number | null; periode: string; keterangan: string }>({
  unitId:     authStore.isUnitScoped ? (authStore.activeUnitId ?? null) : null,
  periode:    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
  keterangan: '',
})

const unitLabel = computed(() => {
  if (authStore.isUnitScoped) return authStore.user?.unitName ?? 'Unit saya'
  if (form.value.unitId === null) return 'Semua Unit'
  return unitList.value.find(u => u.id === form.value.unitId)?.nama ?? '—'
})

async function fetchRiwayat() {
  loadingHistory.value = true
  try {
    const trxList  = await transaksiService.getTransaksiByUnit(authStore.activeUnitId)
    const depList  = trxList.filter(t => t.jenis === 'depresiasi')
    const allAset  = await asetService.getItems(null)
    const rows: RiwayatRow[] = []

    for (const trx of depList.slice(0, 50)) {
      if (!trx.asetId) continue
      const detail = await transaksiService.getDepresiasiDetail(trx.id)
      if (!detail) continue
      const aset = allAset.data.find(a => a.id === trx.asetId)
      rows.push({
        transaksi: trx,
        detail,
        asetKode: aset?.kodeAset ?? '—',
        asetNama: aset?.barangNama ?? '—',
      })
    }
    // Sort by tanggal desc then by periode desc
    riwayat.value = rows.sort((a, b) => b.detail.periode.localeCompare(a.detail.periode))
  } catch (err) { console.error(err) }
  finally { loadingHistory.value = false }
}

onMounted(async () => {
  try {
    unitList.value = await unitKantorService.getActiveItems()
  } catch (err) { console.error(err) }
  await fetchRiwayat()
})

async function handleProses() {
  processing.value = true
  showConfirm.value = false
  try {
    const result = await transaksiService.prosesBulanan(
      {
        unitId:     form.value.unitId,
        periode:    form.value.periode,
        keterangan: form.value.keterangan || `Depresiasi ${form.value.periode}`,
      },
      { createdBy: authStore.user?.id ?? 0 }
    )
    hasilResult.value  = result
    hasilPeriode.value = form.value.periode
    hasilDialog.value  = true
    await fetchRiwayat()
  } catch (err: any) {
    alert(err?.message ?? 'Gagal memproses depresiasi.')
  } finally {
    processing.value = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>