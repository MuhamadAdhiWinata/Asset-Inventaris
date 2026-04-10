<!-- components/features/penjualan/PenjualanForm.vue -->
<template>
  <div>

    <div class="mb-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold tracking-tight">Penjualan Aset</h1>
          <p class="text-muted-foreground text-sm mt-1">Catat penjualan aset ke pihak luar.</p>
        </div>
        <div class="hidden lg:flex items-center gap-3 flex-shrink-0">
          <button type="button" @click="navigateTo('/penjualan')"
            class="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors">
            <ArrowLeftIcon class="h-4 w-4" /> Kembali
          </button>
          <button type="button" :disabled="submitting || !selectedAset" @click="handleSubmit"
            class="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none">
            <Loader2Icon v-if="submitting" class="h-4 w-4 animate-spin" />
            <CheckIcon v-else class="h-4 w-4" />
            Proses Penjualan
          </button>
        </div>
      </div>
    </div>

    <div v-if="loadingData" class="space-y-4">
      <div v-for="i in 2" :key="i" class="h-40 rounded-xl bg-muted animate-pulse" />
    </div>

    <form v-else @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

        <!-- Kolom Kiri -->
        <div class="space-y-5">

          <!-- Pilih Aset -->
          <div class="border rounded-xl p-6 space-y-4">
            <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Aset yang Dijual</h2>
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Cari & Pilih Aset <span class="text-destructive">*</span></label>
              <div class="relative">
                <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input v-model="asetSearch" type="text" placeholder="Ketik kode atau nama aset..."
                  class="w-full pl-9 pr-4 h-10 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
              <div v-if="asetSearch && filteredAset.length > 0 && !selectedAset"
                class="border rounded-lg overflow-hidden shadow-sm max-h-48 overflow-y-auto">
                <button v-for="a in filteredAset" :key="a.id" type="button" @click="selectAset(a)"
                  class="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-accent transition-colors border-b last:border-0">
                  <div class="text-left">
                    <p class="font-mono font-medium text-xs">{{ a.kodeAset }}</p>
                    <p class="text-muted-foreground text-xs">{{ a.barangNama }}</p>
                  </div>
                  <span class="text-xs font-medium tabular-nums">{{ formatRupiah(a.nilaiBuku) }}</span>
                </button>
              </div>
            </div>

            <div v-if="selectedAset" class="border rounded-lg p-4 bg-muted/30 space-y-3">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="font-mono font-medium text-sm">{{ selectedAset.kodeAset }}</p>
                  <p class="font-medium text-sm mt-0.5">{{ selectedAset.barangNama }}</p>
                  <p class="text-xs text-muted-foreground">{{ selectedAset.unitNama }}</p>
                </div>
                <button type="button" @click="clearAset"
                  class="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex-shrink-0">
                  <XIcon class="h-4 w-4" />
                </button>
              </div>
              <div class="grid grid-cols-2 gap-2 text-xs pt-1 border-t">
                <div>
                  <p class="text-muted-foreground">Harga Perolehan</p>
                  <p class="font-medium tabular-nums">{{ formatRupiah(selectedAset.hargaPerolehan) }}</p>
                </div>
                <div>
                  <p class="text-muted-foreground">Nilai Buku Sekarang</p>
                  <p class="font-medium tabular-nums text-primary">{{ formatRupiah(selectedAset.nilaiBuku) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Detail Penjualan -->
          <div class="border rounded-xl p-6 space-y-5">
            <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Detail Penjualan</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Harga Jual (Rp) <span class="text-destructive">*</span></label>
                <input v-model.number="form.hargaJual" type="number" required min="0"
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm tabular-nums ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                <p class="text-xs text-muted-foreground">{{ formatRupiah(form.hargaJual) }}</p>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Tanggal Penjualan <span class="text-destructive">*</span></label>
                <input v-model="form.tanggal" type="date" required
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>

              <div class="sm:col-span-2 space-y-1.5">
                <label class="text-sm font-medium">Pembeli <span class="text-destructive">*</span></label>
                <input v-model="form.pembeli" type="text" required placeholder="Nama pembeli / perusahaan..."
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">No. Dokumen</label>
                <input v-model="form.noDokumen" type="text" placeholder="No. faktur / kwitansi..."
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Keterangan</label>
                <input v-model="form.keterangan" type="text" placeholder="Opsional..."
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>

            </div>
          </div>

          <!-- Actions mobile -->
          <div class="flex items-center justify-between pt-1 lg:hidden">
            <button type="button" @click="navigateTo('/penjualan')"
              class="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors">
              <ArrowLeftIcon class="h-4 w-4" /> Kembali
            </button>
            <button type="submit" :disabled="submitting || !selectedAset"
              class="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none">
              <Loader2Icon v-if="submitting" class="h-4 w-4 animate-spin" />
              <CheckIcon v-else class="h-4 w-4" />
              Proses
            </button>
          </div>

        </div>

        <!-- Kolom Kanan -->
        <div class="hidden lg:block">
          <div class="sticky top-6 space-y-4">

            <!-- Laba / Rugi -->
            <div class="border rounded-xl p-5 space-y-4">
              <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Analisis Penjualan</h3>

              <div v-if="!selectedAset" class="text-center py-4 text-xs text-muted-foreground">
                Pilih aset terlebih dahulu
              </div>

              <template v-else>
                <div class="space-y-3">
                  <div class="flex justify-between gap-2 text-sm">
                    <span class="text-muted-foreground">Harga Jual</span>
                    <span class="font-medium tabular-nums">{{ formatRupiah(form.hargaJual) }}</span>
                  </div>
                  <div class="flex justify-between gap-2 text-sm">
                    <span class="text-muted-foreground">Nilai Buku</span>
                    <span class="tabular-nums text-muted-foreground">{{ formatRupiah(selectedAset.nilaiBuku) }}</span>
                  </div>
                  <div class="border-t pt-3 flex justify-between gap-2">
                    <span class="text-sm font-medium">{{ labaRugi >= 0 ? 'Laba' : 'Rugi' }}</span>
                    <span class="text-base font-bold tabular-nums"
                      :class="labaRugi >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'">
                      {{ labaRugi >= 0 ? '+' : '' }}{{ formatRupiah(labaRugi) }}
                    </span>
                  </div>
                </div>

                <!-- Visual indicator -->
                <div class="rounded-lg p-3 text-xs text-center font-medium"
                  :class="labaRugi > 0
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : labaRugi === 0
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'"
                >
                  {{ labaRugi > 0 ? '▲ Laba Penjualan Aset' : labaRugi === 0 ? '= Impas' : '▼ Rugi Penjualan Aset' }}
                </div>
              </template>
            </div>

            <!-- Info -->
            <div class="border border-dashed rounded-xl p-4 space-y-1.5">
              <p class="text-xs font-medium text-muted-foreground">Info</p>
              <ul class="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Hanya aset berstatus Aktif yang bisa dijual</li>
                <li>Status aset berubah menjadi Terjual</li>
                <li>Laba/rugi = Harga Jual − Nilai Buku</li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </form>

  </div>
</template>

<script setup lang="ts">
import { ArrowLeftIcon, CheckIcon, Loader2Icon, SearchIcon, XIcon } from 'lucide-vue-next'
import { type PenjualanFormData } from '@/services/transaksiService'
import { type Aset, formatRupiah } from '@/services/asetService'

interface PenjualanForm {
  hargaJual:   number
  tanggal:     string
  pembeli:     string
  noDokumen:   string
  keterangan:  string
}

interface Props {
  asetList:    Aset[]
  loadingData?: boolean
  submitting?:  boolean
}

const props = withDefaults(defineProps<Props>(), {
  loadingData: false,
  submitting: false,
})

const emit = defineEmits<{
  submit: [data: PenjualanFormData]
}>()

const asetSearch   = ref('')
const selectedAset = ref<Aset | null>(null)

const filteredAset = computed(() => {
  if (!asetSearch.value) return []
  const q = asetSearch.value.toLowerCase()
  return props.asetList
    .filter(a => a.status === 'Aktif')
    .filter(a => a.kodeAset.toLowerCase().includes(q) || a.barangNama.toLowerCase().includes(q))
    .slice(0, 8)
})

function selectAset(a: Aset) {
  selectedAset.value = a
  asetSearch.value   = a.kodeAset
}

function clearAset() {
  selectedAset.value = null
  asetSearch.value   = ''
}

const form = ref<PenjualanForm>({
  hargaJual:  0,
  tanggal:    new Date().toISOString().slice(0, 10),
  pembeli:    '',
  noDokumen:  '',
  keterangan: '',
})

const labaRugi = computed(() =>
  selectedAset.value ? form.value.hargaJual - selectedAset.value.nilaiBuku : 0
)

function handleSubmit() {
  if (!selectedAset.value) return
  emit('submit', {
    asetId:     selectedAset.value.id,
    unitId:     selectedAset.value.unitId,
    tanggal:    form.value.tanggal,
    hargaJual:  form.value.hargaJual,
    pembeli:    form.value.pembeli,
    noDokumen:  form.value.noDokumen,
    keterangan: form.value.keterangan,
  })
}
</script>